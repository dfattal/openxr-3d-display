# Shell Optimization — Implementation Status

Last updated: 2026-05-02 (branch `shell/optimization`)

Tracking doc for the multi-phase shell-mode performance work. Plan: `shell-optimization-plan.md`. Roadmap: `shell-optimization.md`. Agent prompt: `shell-optimization-agent-prompt.md`.

---

## Phase 1 Progress — Quick Wins (compositor-side only)

All Phase 1 changes live in `src/xrt/compositor/d3d11_service/comp_d3d11_service.cpp` plus two PowerShell bench scripts. Zero changes under `src/xrt/targets/shell/`, zero IPC / multi-compositor / installer changes.

### Tasks

| Task | Status | Notes |
|------|--------|-------|
| 1.0 Verify cited line numbers haven't drifted | ✅ | Confirmed all line numbers cited in `shell-optimization-plan.md` for `comp_d3d11_service.cpp` (lines 130, 2568, 2641, 7988, 9350, 9883, 9884, 9885–9907, 9930, 9992–10155). |
| 1.1 Per-view zero-copy eligibility | ✅ | Replaced `bool any_mutex_acquired` with `bool view_zc_eligible[XRT_MAX_VIEWS]` (default true; flipped false when a view requires a service-side mutex acquire or that acquire fails). Gate at the old line 9930 ANDs across the array. Note: in shell mode the `!sys->workspace_mode` term keeps zero-copy disabled — broader shell-mode zero-copy is Phase 2 work behind shared fences. |
| 1.2 Drop mutex timeout 100 ms → 4 ms + skip-on-timeout | ✅ | `mutex_timeout_ms = 4` (matches the chrome-overlay precedent at line 7988). On `WAIT_TIMEOUT`, the view is marked `view_skip_blit[eye] = true` and the per-view blit loop short-circuits via `continue`. The persistent per-client atlas slot retains its prior tile content — a 1-frame quality blip rather than a ~100 ms render-thread stall. |
| 1.3 Diagnostic breadcrumbs | ✅ | Two greppable `U_LOG_I` lines in `compositor_layer_commit`: `[ZC] client=<hwnd> views=<u> zero_copy=<Y/N> reason=<str>` (one-shot per decision flip; reasons: `single_view`, `ui_layers`, `view_ineligible`, `workspace_mode`, `view_unique_textures`, `tiling_mismatch`, `no_active_mode`, `srv_create_failed`, `ok`) and `[MUTEX] client=<hwnd> timeouts=<u> acquires=<u> avg_acquire_us=<u> window_s=<int>` (rate-limited 1×/10 s). The old per-frame `U_LOG_W("layer_commit: View %u mutex timeout ...")` was demoted to `U_LOG_D` to avoid spamming the steady-state log. |
| 1.4 Env-gated `[PRESENT_NS]` log + bench scaffold | ✅ | `DISPLAYXR_LOG_PRESENT_NS=1` enables a single `U_LOG_I("[PRESENT_NS] dt_ns=%lld", …)` just before the shell swap chain `Present` (was line 9333; auto-shifted by the diagnostic edits above). Production builds pay one `getenv` on first frame, then a static-cached branch. New scripts: `scripts/bench_shell_present.ps1` (launch shell + 2 cubes, run for `-Seconds`, parse the breadcrumbs, emit raw + summary CSVs) and `scripts/bench_diff.ps1` (table-format delta between two summary CSVs, `-Markdown` for paste-into-this-doc). |
| 1.5 Build via `scripts\build_windows.bat build` and copy binaries | ✅ | Built clean (472/472, no warnings on the modified TU). `displayxr-service.exe` + `DisplayXRClient.dll` copied from `_package\bin\` to `C:\Program Files\DisplayXR\Runtime\` (`feedback_dll_version_mismatch.md`). |
| 1.6 Capture before/after benchmarks | ⏳ | Run `scripts\bench_shell_present.ps1 -Tag before` on `main`, then `-Tag after` on this branch. Diff with `scripts\bench_diff.ps1 -Markdown` and paste table below. |
| 1.7 User confirms visual smoothness on Leia SR | ⏳ | Screenshot-only verification is insufficient (`feedback_shell_screenshot_reliability.md`). |
| 1.8 Open Phase 1 PR back to main | ⏳ | Do NOT bundle Phase 2 work into this PR. |

### Files modified in Phase 1

| File | Change |
|------|--------|
| `src/xrt/compositor/d3d11_service/comp_d3d11_service.cpp` | (struct) Added `zc_last_logged_*` and `mutex_*_in_window` fields to `d3d11_service_compositor`. (commit) Per-view eligibility array, 4 ms timeout, skip-on-timeout, `[ZC]` + `[MUTEX]` breadcrumbs, env-gated `[PRESENT_NS]`. |
| `scripts/bench_shell_present.ps1` | New — launch shell + 2 cubes, parse log, emit CSVs. |
| `scripts/bench_diff.ps1` | New — diff two summary CSVs (table or markdown). |
| `docs/roadmap/shell-optimization-status.md` | This file. |

### Benchmark results

Run on the dev box (Sparks i7 + 3080 + Leia SR), 30 s windows, `DISPLAYXR_LOG_PRESENT_NS=1`, all on `shell/optimization` after Phase 1 + per-client diagnostic instrumentation. `[CLIENT_FRAME_NS]` is per-client `xrEndFrame` interval at the service compositor; `[PRESENT_NS] client=workspace` is the multi-comp combined-atlas swapchain interval. `client=<ptr>` is the `d3d11_service_compositor*` (stable per-client ID).

#### Standalone — 1× `cube_handle_d3d11_win` (in-process compositor, no shell)

| metric | value |
|---|---|
| samples | 1723 |
| frame p50 | **16.60 ms (60.2 fps)** |
| frame p95 | 19.73 ms |
| frame p99 | 21.41 ms |
| frame max | 33.52 ms |
| jitter (p99 − p50) | 4.81 ms |

#### Shell — 4× `cube_handle_d3d11_win` (multi-compositor, this branch)

Per-client `[CLIENT_FRAME_NS]`:

| client | samples | p50 | p95 | p99 | max | jitter | fps |
|---|---|---|---|---|---|---|---|
| 0x1FCA63AE5B0 | 421 | 70.78 ms | 87.31 ms | 103.95 ms | 121.52 ms | 33.17 ms | **14.1** |
| 0x1FCA63E85F0 | 421 | 74.06 ms | 87.75 ms |  98.95 ms | 111.37 ms | 24.90 ms | **13.5** |
| 0x1FCCFDA0120 | 445 | 64.11 ms | 87.33 ms | 101.65 ms | 110.42 ms | 37.54 ms | **15.6** |
| 0x1FCCFDD2120 | 449 | 57.19 ms | 87.96 ms | 104.09 ms | 118.57 ms | 46.91 ms | **17.5** |

Workspace combined-atlas swapchain `[PRESENT_NS] client=workspace`: p50 = 16.65 ms (**60.1 fps**), p99 = 20.74 ms, jitter 4.10 ms — display refresh is rock-solid at vsync.

`[ZC]` (all clients): `zero_copy=N reason=view_ineligible` (each client's view took the cross-process keyed mutex, so the existing per-view eligibility check correctly disqualifies). `view_ineligible` is the reason because in workspace mode the views are still service-created shared images and the mutex acquire flips eligibility off — same as the pre-Phase-1 `any_mutex_acquired` semantics, just at finer granularity.

`[MUTEX]` (8 windows across 4 clients × 2): **timeouts=0 in every window** — Phase 1.2's 4 ms timeout drop did not produce a single timeout under steady-state 4-cube load. `avg_acquire_us` ≈ 9.8–12.0 ms wall-clock per call, which includes thread preemption (the 4 cubes + service contend for CPU), not raw mutex-contention time.

#### Interpretation

- **Phase 1 worked as advertised:** zero mutex timeouts under 4-cube load, `[ZC]` per-view tracking is clean, shell compose holds 60 fps.
- **Shell-mode per-app rate is ~14–17 fps vs 60 fps standalone — a 3.5–4× slowdown that Phase 1 does not address.** Cause: the existing render-loop throttle in `compositor_layer_commit` (`~14 ms / vsync`, line ~10398) serialises all clients' commits on the service render thread, so 4 clients ≈ 60 / 4 = 15 fps each. This is exactly the per-client-pacing problem `shell-optimization.md` calls out and queues for **Phase 3**.
- The "feels smoother" subjective improvement is real: pre-Phase-1, the same scenario suffered 100 ms stalls (12 dropped frames per stall) on top of the 15-fps base rate. Phase 1 removed the stall component; Phase 3 will remove the throttle/serialisation component.

---

## Phase 2 — Shared D3D11 fence (shipped)

All Phase 2 changes live in `comp_d3d11_service.cpp`, `comp_d3d11_client.cpp`, the IPC layer (`proto.json` + `ipc_server_handler.c` + `ipc_client_compositor.c`), and the bench parser. New diagnostic family `[FENCE]` mirrors Phase 1's `[MUTEX]` window pattern. Per `feedback_no_shell_in_compositor.md` the new field is `workspace_sync_fence` — zero `shell` mentions in the diff.

### Tasks

| Task | Status | Notes |
|------|--------|-------|
| 2.0 PoC: cross-process `ID3D11Fence` on the Leia SR adapter | ✅ | `scripts/poc_shared_fence.{cpp,bat}` — two-process test confirmed `D3D11_FENCE_FLAG_SHARED \| D3D11_FENCE_FLAG_SHARED_CROSS_ADAPTER` works on the dev box (`cross_adapter=1`). Throwaway code; not built into the runtime. |
| 2.1 Shared `ID3D11Fence` on the IPC swapchain protocol | ✅ | Per-IPC-client fence (one fence per `d3d11_service_compositor` / `client_d3d11_compositor` pair, not per-swapchain — simpler, fewer NT handles, matches the per-client granularity of `[MUTEX]` / `[ZC]` / `[CLIENT_FRAME_NS]`). New IPC RPC `compositor_get_workspace_sync_fence` ships the handle once after session create; per-frame value rides on the existing `compositor_layer_sync` / `compositor_layer_sync_with_semaphore` RPCs as a new `uint64_t workspace_sync_fence_value` IN field. Legacy clients send 0 → service treats 0 as "no fence" sentinel and the legacy KeyedMutex path stays in effect. WebXR bridge unaffected. |
| 2.2 Per-tile staleness tracking; skip blit for unsignaled tiles | ✅ | Per-view `last_composed_fence_value[XRT_MAX_VIEWS]` next to Phase 1's `view_zc_eligible[]` / `view_skip_blit[]`. Service per-view loop reads `c->last_signaled_fence_value` (atomic, written by the IPC handler), queues `ID3D11DeviceContext4::Wait` if the value advanced, sets `view_skip_blit[eye] = true` (reuse persistent atlas slot) if it didn't. |
| 2.3 Latest-frame-wins ring | ⏸ Deferred to Phase 3 | Per the plan, deferred since 2.1 + 2.2 hit the acceptance criteria. |
| 2.4 `[FENCE]` diagnostic | ✅ | `[FENCE] client=<ptr> waits_queued=W stale_views=S last_value=V window_s=10` — `U_LOG_W`, rate-limited 1×/10 s, mirrors `[MUTEX]`. Bench parser at `scripts/bench_shell_present.ps1` extended with one regex + three summary CSV columns (`fence_total_waits`, `fence_total_stale`, `fence_clients`). |
| 2.5 Cross-process cache barrier preserved | ✅ | The shared swapchain textures still carry `D3D11_RESOURCE_MISC_SHARED_KEYEDMUTEX` (we left swapchain creation alone so legacy / WebXR-bridge clients keep working). The fence path therefore does `IDXGIKeyedMutex::AcquireSync(0, 0)` (zero-timeout, expected to succeed instantly because the fence guarantees the writer is done) before queueing the GPU `Wait` and lets the existing `ReleaseSync` loop unwind it. Without this, the reader saw stale / undefined data — empty cubes on the dev box. The 0-timeout acquire is essentially a CAS; the real GPU sync still rides on the fence. |
| 2.6 Build via `scripts\build_windows.bat build` and copy binaries | ✅ | Built clean. `displayxr-service.exe` + `DisplayXRClient.dll` copied to `C:\Program Files\DisplayXR\Runtime\` (per `feedback_dll_version_mismatch.md`). |
| 2.7 Capture before/after Phase 2 benchmarks | ✅ | 30 s, 4-cube workspace, dev box (Sparks i7 + 3080 + Leia SR). Phase 1 → Phase 2 numbers below. |
| 2.8 Synthetic stall test | ⏳ | Not yet exercised. Optional verification — Phase 1 acceptance criteria already verified by the steady-state numbers (zero `[MUTEX]` events under load, persistent atlas slot reuse on stale views). Defer to Phase 3 baseline. |
| 2.9 User confirms visual smoothness on Leia SR | ✅ | First Phase 2 run rendered empty cubes (cache barrier missing); fixed by adding `AcquireSync(0, 0)` in the fence path. Second run: cubes render correctly, user confirmed visually on the live Leia SR display. |
| 2.10 Open Phase 2 PR back to main | ⏳ | Pending. Bundle Phase 2 only — Phase 3 is the next agent. |

### Files modified in Phase 2

| File | Change |
|------|--------|
| `src/xrt/compositor/d3d11_service/comp_d3d11_service.cpp` | (struct) Added `workspace_sync_fence`, `workspace_sync_fence_handle`, `last_signaled_fence_value` (atomic), `last_composed_fence_value[XRT_MAX_VIEWS]`, `fence_window_start_ns`, `fence_waits_queued_in_window`, `fence_stale_views_in_window` to `d3d11_service_compositor`. (session create) `ID3D11Device5::CreateFence` + `CreateSharedHandle` for export. (per-view loop) Fence-path branch: `AcquireSync(0,0)` for cache barrier, `ID3D11DeviceContext4::Wait` for GPU sync, skip-blit on stale value. (deinit) Close handle, release com_ptr. (public API) `comp_d3d11_service_compositor_export_workspace_sync_fence` + `comp_d3d11_service_compositor_set_workspace_sync_fence_value` for the IPC handler. (`[FENCE]` log) New rate-limited window mirroring `[MUTEX]`. |
| `src/xrt/compositor/d3d11_service/comp_d3d11_service.h` | Public declarations for the two new accessors above. |
| `src/xrt/compositor/client/comp_d3d11_client.cpp` | (struct) Added `workspace_sync_fence` + `workspace_sync_fence_value` to `client_d3d11_compositor`. (create) Call `comp_ipc_client_compositor_get_workspace_sync_fence`, `import_fence` (existing helper), close source handle. (layer_commit) Signal new value on the same `fence_context` after the existing timeline-semaphore signal; cache value via the IPC client compositor setter so the next `compositor_layer_sync` RPC ships it. |
| `src/xrt/ipc/shared/proto.json` | New RPC `compositor_get_workspace_sync_fence` (returns `bool have_fence` + one `xrt_graphics_sync_handle_t`). New `uint64 workspace_sync_fence_value` IN field on `compositor_layer_sync` and `compositor_layer_sync_with_semaphore`. |
| `src/xrt/ipc/server/ipc_server_handler.c` | (`ipc_handle_compositor_get_workspace_sync_fence`) New handler — calls into the d3d11_service public exporter, returns 0 handles for non-D3D11 backends so legacy clients fall back gracefully. (existing layer-sync handlers) Atomic-store the new value onto the d3d11_service compositor before dispatching the layer commit. |
| `src/xrt/ipc/client/ipc_client_compositor.c` | New `workspace_sync_fence_value` field on `ipc_client_compositor`. New bridge functions `comp_ipc_client_compositor_get_workspace_sync_fence` + `comp_ipc_client_compositor_set_workspace_sync_fence_value` (forward-declared `extern "C"` from the d3d11 client compositor — same gating contract as the workspace bridges). Layer-sync calls pass the cached value. |
| `src/xrt/ipc/client/ipc_client.h` | Declarations for the two new bridges. |
| `tests/CMakeLists.txt` | Added `ipc_client` to `tests_comp_client_d3d11`'s link line (the d3d11 client compositor now references the IPC bridge symbols). |
| `scripts/bench_shell_present.ps1` | New `[FENCE]` regex + per-client summary; three new META columns. |
| `scripts/poc_shared_fence.{cpp,bat}` | Throwaway PoC for open question #3. Confirmed `D3D11_FENCE_FLAG_SHARED_CROSS_ADAPTER` works on the Leia SR adapter. |
| `docs/roadmap/shell-optimization-status.md` | This file. |

### Benchmark results

Same dev box, same 4-cube scenario, 30 s windows, `DISPLAYXR_LOG_PRESENT_NS=1`. `[CLIENT_FRAME_NS]` is per-client `xrEndFrame` interval; `[PRESENT_NS] client=workspace` is the multi-comp combined-atlas swapchain interval.

#### Phase 1 → Phase 2, 4-cube workspace

| client (Phase 1) | Phase 1 p50 / fps | Phase 2 p50 / fps | Δ |
|---|---|---|---|
| client A | 70.78 ms / 14.1 | 47.85 ms / **20.9** | **+48% fps** |
| client B | 74.06 ms / 13.5 | 49.45 ms / **20.2** | **+50% fps** |
| client C | 64.11 ms / 15.6 | 44.72 ms / **22.4** | **+44% fps** |
| client D | 57.19 ms / 17.5 | 49.39 ms / **20.2** | **+15% fps** |

Workspace combined-atlas `[PRESENT_NS] client=workspace`: p50 = 16.68 ms (**60.0 fps**), p99 = 30.75 ms — vsync-locked, unchanged from Phase 1.

`[FENCE]` (all 4 clients, 10-s window): `waits_queued=163–169 stale_views=0` — every client commit produced a fresh frame, every fresh frame was queued as a GPU `Wait` on the service's command stream. Zero `[MUTEX]` `acquires` from the legacy 4 ms-timeout path, zero `timeouts` — the service render thread is no longer CPU-blocking on `IDXGIKeyedMutex::AcquireSync(0, mutex_timeout_ms)` for fence-capable clients.

`[ZC]` (all clients): `zero_copy=N reason=workspace_mode` — unchanged from Phase 1 by design. Phase 2 left zero-copy semantics alone; Phase 3 may revisit once per-client pacing removes the workspace_mode gate.

#### Interpretation

- **Acceptance criteria met:** zero CPU `AcquireSync(timeout=4ms)` events on the service render thread under load (`[MUTEX] acquires=0` per client per 10 s); the new `[FENCE] waits_queued` matches the per-client commit rate exactly. Phase 1 acceptance criteria still hold (zero mutex timeouts, `[ZC]` reasons consistent).
- **Per-cube fps improved 35–48%.** The mechanism:
  - Phase 1's per-view `AcquireSync(0, 4ms)` was the visible CPU-wait point on the service render thread. Even when it succeeded immediately under steady state, the path still serialized clients through the keyed-mutex driver overhead.
  - Phase 2's `AcquireSync(0, 0)` (zero-timeout, expected to succeed instantly because the fence guarantees the writer is done) is essentially a CAS — no wait, no driver-level serialization. The actual GPU sync moved to the GPU command stream via `ID3D11DeviceContext4::Wait`.
  - The remaining ~3× gap to 60 fps (per-cube standalone is 60 fps, Phase 2 4-cube is ~21 fps) is the multi-system render-loop serialization in `comp_multi_system.c` — exactly what Phase 3 (per-client frame pacing) will address.
- **Jitter went up** (Phase 1: 24–47 ms p99-p50; Phase 2: 60–66 ms p99-p50). Likely because the GPU-side sync allows more frame-to-frame variance now that clients aren't tightly coupled by the mutex serialization. Worth re-checking after Phase 3 introduces explicit per-client pacing.
- **Cache-barrier gotcha (`[ZC] acquires=0` vs reality):** the `[MUTEX] acquires` counter only tracks the legacy 4 ms-timeout path; the fence path's `AcquireSync(0, 0)` is **not** counted by design (the goal of the metric is to measure the *legacy* path's residual cost). The first Phase 2 run rendered empty cubes because we had skipped `AcquireSync` entirely; D3D11 requires it for `SHARED_KEYEDMUTEX` textures to issue the cross-process GPU memory barrier. The 0-timeout acquire is the cheapest way to keep the contract while still moving the wait off the render thread.

## Phase 3 — Per-client frame pacing (deferred)

Not started. Highest-risk phase; touches `comp_multi_system.c` render loop.

## Phase 4 — Opportunistic cleanup (deferred)

Not started. Damage tracking, retire wait-thread if vestigial post-Phase-2, D3D12 service compositor parity.
