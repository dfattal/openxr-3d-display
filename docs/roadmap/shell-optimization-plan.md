# Shell / Multi-Compositor Optimization — Detailed Plan

**Branch:** `shell/optimization`
**Roadmap:** [shell-optimization.md](shell-optimization.md)
**Date:** 2026-05-02

This document is the implementation plan for the shell-mode performance work. The roadmap (`shell-optimization.md`) explains *why*; this document explains *what to change, where, in what order, and how to verify*.

---

## Background — what makes shell mode slow

All citations are from the `main` branch tip at the time of writing. Verify line numbers haven't drifted before editing.

### Cited code paths

1. **`src/xrt/compositor/multi/comp_multi_compositor.c`**
   * `run_func()` (~lines 262–350): wait thread iterates clients, calls `wait_fence()` per client (~line 318), moves frames `progress → scheduled`.
   * `layer_commit` handler (~lines 200–259, 353–375): client `xrEndFrame` calls `wait_for_wait_thread()` (~line 875), which can stall on the conditional variable if the wait thread is busy on another client.

2. **`src/xrt/compositor/multi/comp_multi_system.c`**
   * `xrt_system_compositor` render loop (~lines 3048–3109): single `predict_frame` per frame, broadcast wake time to all clients (~3100, 3109). Slowest client sets the global cadence.

3. **`src/xrt/compositor/d3d11_service/comp_d3d11_service.cpp`**
   * `keyed_mutex` field on shared images: line 130. Acquire/release pair: ~lines 2637–2693 (`AcquireSync` at 2641 with caller-provided timeout; `ReleaseSync` at 2676).
   * **`mutex_timeout_ms = 100`** at line 9883 — the smoking gun. Loop at 9882–9907 acquires per view; `AcquireSync` blocks the service render thread up to 100 ms per view.
   * **Zero-copy disable**: line 9930 — if `any_mutex_acquired` is true, the entire frame falls back to the slow blit path.
   * **Per-client blit loop**: lines 9992–10130 — `CopySubresourceRegion` / shader blit per client per view.
   * Chrome / overlay path uses a much shorter 4 ms timeout at line 7988 — confirms 100 ms is excessive for the per-tile path.
   * `ReleaseSync` cleanup: lines 2567–2571.

4. **`src/xrt/compositor/client/`** — IPC client compositor; `xrEndFrame` triggers cross-process fence + mutex round-trip with the service.

### What standalone (in-process handle) skips

* No cross-process texture sharing — app's swapchain *is* the compositor's input.
* No `KeyedMutex` — the app and compositor share a D3D11 device and synchronize via the immediate context.
* No "broadcast pacing" loop — the app's own `xrWaitFrame` returns the next vsync directly.
* No atlas blit — app renders straight to the per-tile region of the atlas.

The shell-mode pipeline replicates all of these as cross-process operations because Monado's IPC was built that way for VR runtimes, where every app must hit display Hz exactly. For a desktop-style spatial shell, the constraint is wrong: idle apps should be free, fast apps should not be gated by slow apps, and the service render loop should never CPU-wait on a client.

---

## Phase 1 — Quick wins

**Target:** restore smooth multi-app case for fast clients. 1–2 days.
**Branch tactic:** all work directly on `shell/optimization`.
**Risk:** low — changes are localized to `comp_d3d11_service.cpp`.

### Task 1.1 — Per-client zero-copy eligibility

**File:** `src/xrt/compositor/d3d11_service/comp_d3d11_service.cpp`, around line 9930.

**Today:** a single `bool any_mutex_acquired` flips the entire frame to the slow blit path.

**Change:**
* Track zero-copy eligibility *per client* (or per view per client), not globally.
* Each client decides independently whether its tile can be sampled in-place from the shared texture or must be blitted into the atlas.
* The shader / `CopySubresourceRegion` code in 9992–10130 already supports per-tile dispatch — we just need the upstream branch to be per-client.

**Edge cases to preserve:**
* Format mismatch between client texture and atlas (e.g. SRGB vs UNORM) must continue to take the shader-blit path. See `feedback_srgb_blit_paths.md`.
* Multi-tile / multiview clients (legacy apps): each tile's eligibility is independent.

**Verify:** with two `cube_handle_d3d11_win` clients, instrument and log per-client `zero_copy=Y/N` once per second. Both should be `Y` in the steady state.

### Task 1.2 — Drop mutex timeout from 100 ms to ~4 ms; on timeout, reuse previous tile

**File:** `src/xrt/compositor/d3d11_service/comp_d3d11_service.cpp`, line 9883.

**Today:** `mutex_timeout_ms = 100` ⇒ a stalled client can stall the service for 100 ms × view_count.

**Change:**
* Reduce timeout to 4 ms (matches the chrome-overlay path at line 7988).
* On `AcquireSync` timeout, do **not** retry. Instead, mark the tile as "stale" and reuse the previous frame's copy of that tile. Skip the blit for that client.
* Preserve the existing error log but downgrade severity (info, not error) and rate-limit it (see `docs/reference/debug-logging.md` — recurring events are `U_LOG_I`, throttled).

**Edge cases:**
* First frame for a client (no previous tile cached): substitute black or skip composing that client until first successful acquire.
* Client disconnect / crash: the session-teardown path at line 2567–2571 must still release any held mutexes. Verify under "kill -9 the client" testing.

**Verify:** instrument timeout count per client per second. Expected: zero in the smooth case, occasional during init / scene transitions, never sustained.

### Task 1.3 — Benchmark scaffold

**Files:** new `scripts/bench_shell_present.ps1` (or extend an existing tooling spot if one exists — check `scripts/`).

**What to capture:**
* `Present`-to-`Present` interval histogram for the service swapchain over 60 s.
* Per-client `xrEndFrame → xrEndFrame` interval histogram.
* Service-side render thread time per frame (instrumented with `os_monotonic_get_ns()`).

**Reference scenario:** two `cube_handle_d3d11_win` instances launched via `_package\bin\displayxr-shell.exe`.

**Output:** CSV per run; a small Python or PowerShell script that diffs two CSVs and prints p50/p95/p99 + jitter.

**Capture before-Phase-1 and after-Phase-1 baselines.** Both committed to `docs/roadmap/shell-optimization-status.md` as evidence.

### Phase 1 acceptance criteria

* `Present`-to-`Present` p99 for 2 fast clients in shell within 2× of one client standalone.
* No `mutex_timeout` events in the steady state with 2 fast clients.
* Per-client zero-copy stays `Y` for both clients in the smooth case.

---

## Phase 2 — Replace CPU mutex with GPU fence

**Target:** 3–5 days. Service render thread no longer CPU-blocks on any client.
**Risk:** medium — shared-fence support requires `ID3D11Device5` / `ID3D12Device`. Cross-process NT-handle fence creation has its own gotchas (see `feedback_atlas_stride_invariant.md` for the kind of cross-process diagnostic discipline needed; create equivalent service-log breadcrumbs for the new fence path).

### Task 2.1 — Add shared D3D11 fence to the IPC swapchain protocol

**Files (likely):**
* `src/xrt/ipc/shared/proto.json` — additive: optional fence-handle field on swapchain creation responses.
* `src/xrt/ipc/shared/ipc_protocol.h` — feature flag, fence handle struct.
* `src/xrt/compositor/client/comp_d3d11_client.cpp` (or equivalent) — client-side fence signal on `xrEndFrame`.
* `src/xrt/compositor/d3d11_service/comp_d3d11_service.cpp` — service-side fence import + `ID3D11DeviceContext4::Wait` on the GPU command list (NOT CPU `WaitForSingleObject`).

**Approach:**
* On swapchain creation, the service creates an `ID3D11Fence` with `D3D11_FENCE_FLAG_SHARED | D3D11_FENCE_FLAG_SHARED_CROSS_ADAPTER` (test which combination Leia SR's adapter requires).
* Export NT handle, send to client over IPC; client opens via `OpenSharedFence`.
* Client increments fence value on `xrEndFrame` after submitting render commands.
* Service `Wait()`s on the GPU side (queues a wait on the command stream) — this is a non-blocking call from the CPU's perspective.
* Feature-flag the new path: clients/services that don't support it fall back to the existing KeyedMutex path. This keeps WebXR bridge and other legacy IPC clients working unchanged.

**Edge cases:**
* Fence value monotonicity across reconnection / re-creation — restart the fence value at 0 on swapchain re-create.
* GPU adapter mismatch (multi-GPU machines) — `SHARED_CROSS_ADAPTER` flag handles it but verify on a Sparks dev box.
* Cross-process handle leaks — every export needs a `CloseHandle` on teardown.

### Task 2.2 — Per-tile staleness tracking; skip blit for unsignaled tiles

**File:** `src/xrt/compositor/d3d11_service/comp_d3d11_service.cpp`, in the per-frame compose loop.

**Approach:**
* Each client tracks `last_signaled_fence_value` and `last_composed_tile_index` for each view.
* At compose time, query the fence (cheap, on the GPU side) to see if a new value has been signaled. If yes, queue the GPU `Wait` and update `last_composed_tile_index`. If no, reuse the previous tile.
* No CPU-side wait. Ever.

**Verify:** synthetic test where one client deliberately misses every other frame. Service should compose at full rate, alternating between the previous and current tile of the slow client; the other client should be unaffected.

### Task 2.3 — Latest-frame-wins ring or double buffer per client

**Approach:** the simplest viable shape is a 2-slot ring per client. Client writes slot `N+1` while service samples slot `N`. Atomic 32-bit write of the "newest valid slot index" replaces mutex contention entirely.

**Defer to Phase 3 if 2.1 + 2.2 already get us to the Phase 2 acceptance criteria.** Don't over-engineer; if KeyedMutex contention is the only remaining issue and the 2-slot ring isn't strictly necessary after 2.1/2.2, it's not Phase 2 work.

### Phase 2 acceptance criteria

* Service render thread `os_monotonic` measurement: < 1 ms spent in synchronization per client per frame, sustained.
* Synthetic stall test: one client misses every 2nd frame, the others maintain full cadence.
* No CPU `AcquireSync` / `WaitForSingleObject` calls on the service render thread (verified by source grep + ETW trace).

---

## Phase 3 — Per-client frame pacing

**Target:** 1–2 weeks. The biggest architectural change.
**Risk:** high — touches the multi-system render loop that has been load-bearing for the entire IPC path since the Monado fork.

### Task 3.1 — Carve out per-client pacing context

**Files:**
* `src/xrt/compositor/multi/comp_multi_compositor.c` — each client gets its own predict / wait state.
* `src/xrt/compositor/multi/comp_multi_system.c` — render loop becomes a pure consumer (samples freshest tile from each client).
* IPC frame-timing path (`xrWaitFrame` / `xrBeginFrame` IPC calls) — wake time is now per-client, not broadcast.

**Approach:**
* Each client has its own `predict_frame` + `wake_up_time_ns` derived from its own intended cadence (display Hz by default, but a client may want slower).
* The system render loop runs at display Hz, samples the freshest tile from each client (regardless of whether that client just produced a fresh frame), and composes.
* Idle clients consume zero CPU/GPU between their frames — their last tile is just sampled by the service.

### Task 3.2 — Mixed refresh-rate support

A 30 Hz client + a 60 Hz client should coexist. The compose loop runs at 60 Hz; the 30 Hz client's tile is reused on alternate compose frames.

This falls out naturally from 3.1 if 3.1 is done correctly. Validate with a synthetic 30 Hz client.

### Task 3.3 — Backwards compatibility for legacy / IPC apps

The existing broadcast pacing path must remain available for clients that depend on it (legacy apps, WebXR bridge, anything in `feedback_workspace_app_registration.md` scope). Likely we make per-client pacing opt-in via a swapchain creation flag, and migrate clients incrementally.

### Phase 3 acceptance criteria

* 1 idle + 1 active client: idle client consumes < 1% CPU and 0% GPU; active client maintains native cadence.
* 1 fast + 1 slow client: fast client maintains native cadence regardless of slow client's pacing.
* No regressions on legacy / WebXR bridge / `_ipc` cube apps.

---

## Phase 4 — Opportunistic cleanup

No commitments; revisit after Phases 1–3 land.

* Damage tracking — skip per-tile blit if client's tile content unchanged (detected via fence value or content hash).
* Retire `comp_multi_compositor.c` wait thread if it's vestigial post-Phase-2.
* D3D12 service compositor parity — apply the same techniques.

---

## Cross-cutting concerns

### Diagnostics

Every phase adds **one-shot** breadcrumb log lines in `%LOCALAPPDATA%\DisplayXR\` service logs (see `reference_service_log_diagnostics.md` pattern):

* Phase 1: per-client `[ZC] client=N zero_copy=Y/N reason=...` once per session change.
* Phase 1: per-client `[MUTEX] client=N timeouts=K window=10s` rate-limited.
* Phase 2: per-client `[FENCE] client=N value=V signaled_at=T` once per second.
* Phase 3: per-client `[PACE] client=N target_hz=H actual_hz=H actual_ms=M` once per second.

These are how we'll diagnose issues without re-instrumenting every time.

### Memory / context to honour

* `feedback_atlas_stride_invariant.md` — stride invariant must hold across ALL paths. Don't introduce a Phase-2 fast path that recomputes stride differently from the slow path.
* `feedback_mirror_inprocess_arch.md` — for any new tile geometry pushed across IPC, app (or bridge proxy) is source of truth; service does not re-derive.
* `feedback_srgb_blit_paths.md` — non-shell needs shader blit (linearize for DP); shell uses raw copy. Don't unify, even if it looks tempting in Phase 1.
* `feedback_use_build_windows_bat.md` — always build via `scripts\build_windows.bat`. Never invoke cmake/ninja directly.
* `feedback_test_before_ci.md` — wait for the user to test locally before pushing.
* `feedback_dll_version_mismatch.md` — after rebuild, copy runtime binaries to `C:\Program Files\DisplayXR\Runtime\` (registry finds them); installer rebuild is *not* needed unless the installer itself changed.

### Testing matrix

Minimum scenarios to validate at the end of each phase:

| Scenario | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| 1× cube_handle_d3d11_win in shell | smooth | smooth | smooth |
| 2× cube_handle_d3d11_win in shell | smooth | smooth | smooth |
| 4× cube_handle_d3d11_win in shell | acceptable | smooth | smooth |
| 2× clients, one synthetic-slow | one stalls | only slow stalls | only slow stalls |
| 1× idle + 1× active | active smooth | active smooth | active smooth, idle ≈ 0% GPU |
| Legacy `_ipc` cube app | works | works | works |
| WebXR bridge demo | works | works | works |

The legacy + WebXR scenarios are regression gates; they must keep working through every phase.

### What lives in this branch vs `main`

Each phase is a candidate for its own PR back to `main`. Order:
1. Phase 1 PR — small, low-risk, ship first.
2. Phase 2 PR — feature-flagged shared-fence path; ship behind a flag, default-on after a soak.
3. Phase 3 PR — large; may need to land in slices (per-client predict-frame first, then full per-client pacing).

Do not cumulative-PR the whole optimization in one go. Each phase ships independently; the roadmap doc explains the through-line.

---

## Open questions (resolve as you go)

1. Does Leia SR's D3D11 weaver have any sync-point assumptions about when the atlas is GPU-ready that the new fence path could violate? Check `drivers/leia/leiasr_d3d11.cpp` and the DP vtable contract before Phase 2.
2. Does the WebXR bridge currently rely on the broadcast pacing path? See `project_webxr_bridge_v2_phase3.md`. If yes, Phase 3 must keep the broadcast path available behind an opt-in.
3. Is `ID3D11Fence` cross-process `SHARED_NTHANDLE` actually supported on the Leia SR adapter on the dev box? Validate with a tiny standalone proof-of-concept before committing to Phase 2.

## See also

* `shell-optimization.md` — the roadmap / vision.
* `shell-optimization-agent-prompt.md` — agent onboarding.
* `docs/architecture/compositor-pipeline.md`
* `docs/specs/swapchain-model.md`
* `docs/adr/ADR-001-native-compositors-per-graphics-api.md`
* `docs/adr/ADR-007-compositor-never-weaves.md`
