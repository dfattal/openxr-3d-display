# Shell / Multi-Compositor Optimization Roadmap

**Branch:** `shell/optimization`
**Created:** 2026-05-02
**Status:** Planning

## Problem statement

Standalone handle apps (each owning their own HWND, rendering directly to a native compositor that hands the atlas to the display processor) feel buttery smooth. The **same** apps running through the shell — i.e. as IPC clients of `displayxr-service`, composed by `comp_multi_compositor` and finalised by `comp_d3d11_service` — degrade to sluggish frame rates as soon as more than one app is present.

This is the single biggest threat to the shell's value proposition: a 3D spatial desktop is only useful if running N apps in it is no worse than running one app standalone. Today, the cost of the multi-compositor is high enough that users will prefer to alt-tab between full-screen handle apps.

**This is not a fundamental limitation of multi-compositing.** Desktop window managers (DWM, Quartz, KDE/Wayland) have solved the same N-producer / 1-consumer problem for over a decade. The DisplayXR shell pipeline currently has design choices that were correct for the Monado VR ancestry but are wrong for a desktop-style spatial shell.

## Goal

The shell experience must be **flawless** — i.e. running N handle apps through the shell should feel indistinguishable from running one app standalone, up to the point where the GPU is genuinely saturated by the apps' own work.

In numbers: at 60 Hz on a typical Leia SR display with 2-3 cube-class apps (low GPU load), the shell should sustain 60 fps with no stutter and no measurable per-frame service-side stall (< 1 ms in `comp_d3d11_service` per client per frame).

## Why it's slow today

Three cross-process serialization points exist in shell mode that don't exist standalone. Detailed file/line citations are in `shell-optimization-plan.md`. Summary:

1. **Cross-process `IDXGIKeyedMutex` with a 100 ms CPU-side timeout per view** — `comp_d3d11_service.cpp:9883–9907`. Service render thread blocks waiting for each client to release its shared-texture mutex. With 2 views the worst case is ~200 ms per frame; at 60 Hz one such stall = 6 dropped frames.
2. **Per-client GPU blit into the shared atlas, with the zero-copy fast path disabled globally as soon as any single client takes the mutex** — `comp_d3d11_service.cpp:9930` and the blit loop at `9992–10130`. One slow client penalizes all clients.
3. **Unified frame pacing across all clients** — `comp_multi_system.c:3048–3109`. A single render thread does one `predict_frame` and broadcasts to all clients. The slowest client drags the whole cadence; mixed refresh rates are impossible.

Plus the wait-thread in `comp_multi_compositor.c:262–350` walks clients sequentially and waits on each GPU fence, so Client B's `xrEndFrame` blocks behind Client A's GPU work.

## Principles

1. **Producer / consumer decoupling.** No client may block the service render loop on the CPU side. Synchronization is GPU-side fences only; if a fence isn't signaled, reuse the last good tile and move on. *Latest-frame-wins, never block.*
2. **One slow client must not penalize others.** Per-client fast paths must be independent: a client missing a deadline only affects its own tile, not the global pipeline.
3. **No CPU-side `AcquireSync` on the render thread, ever.** Move sync to the GPU command stream (`ID3D11DeviceContext4::Wait` on a shared fence) so the render thread queues work and returns immediately.
4. **Per-client pacing.** Each client predicts and waits independently. The system frame loop composes whatever is freshest — it does not gate clients.
5. **No regressions for in-process handle apps.** All optimization work targets the shell / IPC path. Standalone handle apps must not pay a cycle of overhead.
6. **Measure, don't guess.** Every change lands with before/after numbers from a documented benchmark scenario.

## Phased approach

The work is broken into four phases, ordered by impact-per-effort. Phases 1 and 2 are the high-leverage wins; phases 3 and 4 are the architectural cleanup that makes the shell scale to many apps.

### Phase 1 — Quick wins (target: 1-2 days)

* **Decouple zero-copy decision per client.** The current "any mutex acquired ⇒ disable zero-copy for all" branch at `comp_d3d11_service.cpp:9930` is the wrong granularity. Track per-client zero-copy eligibility; clients on the fast path stay on the fast path even if a sibling is slow.
* **Reduce KeyedMutex timeout from 100 ms to a frame-budget value (~4 ms)**, and on timeout reuse the previous tile rather than retry. This converts the pathological 100 ms stall into a 1-frame quality blip.
* **Bench:** 2 cube_handle_d3d11_win clients in shell, before/after `Present`-to-`Present` jitter histogram.

Expected gain: smooth case for 2-3 fast clients restored to near-standalone.

### Phase 2 — Replace CPU mutex with GPU fence wait (target: 3-5 days)

* **Migrate cross-process texture sync from `IDXGIKeyedMutex` to `ID3D11Fence` (shared NT-handle fences).** D3D11.4 / D3D12 shared fences let the service queue a `Wait()` on the GPU command stream and return immediately — no CPU-side block.
* **Per-tile staleness tracking.** If a client's fence isn't yet signaled at composition time, reuse the previous-frame copy of that tile. Compose the rest of the frame on schedule.
* **Latest-wins ring or double buffer per client.** Client writes slot N+1 while service samples slot N; mutex contention disappears entirely. (See DWM's DXGI flip model for the reference shape.)
* **Bench:** 4 mixed clients (one synthetic GPU-heavy, three fast). Confirm fast clients are unaffected by the heavy one.

Expected gain: scaling to 4-6 clients without per-client overhead growth.

### Phase 3 — Per-client frame pacing (target: 1-2 weeks)

* **Decouple `xrt_system_compositor` predict-frame loop from per-client `xrWaitFrame`.** Each client gets its own pacing context — predict, wait, compose — independent of the system frame loop. This is the largest architectural lift; it touches `comp_multi_system.c`, `comp_multi_compositor.c`, and the IPC frame timing path.
* **System loop becomes a pure consumer.** Each frame, sample the freshest tile from each connected client and compose. No client gates the loop.
* **Mixed refresh rates work.** A 30 Hz client and a 60 Hz client can coexist; idle clients cost nothing.
* **Bench:** 1 idle client + 1 active client. Idle client should consume ~0% GPU and not affect the active client's frame time.

Expected gain: shell scales to "many" apps; idle apps cost nothing.

### Phase 4 — Stretch / cleanup (no commitment; opportunistic)

* Investigate whether the per-client `comp_base` chain can short-circuit blits when a client's tile is unchanged frame-over-frame (damage tracking).
* Investigate whether the wait-thread in `comp_multi_compositor.c` can be retired entirely once GPU fences land — it may become vestigial.
* Cross-API parity: the same techniques apply to the D3D12 service compositor; line up similar work there once D3D11 is solid.

## Out of scope

* macOS / Metal multi-compositor — Phase 6 of the shell only ships Windows; metal multi-compositor work is deferred until macOS is back on the roadmap.
* IPC protocol changes that affect non-shell clients (legacy apps, WebXR bridge). Optimizations must be transparent at the IPC layer; if a protocol change is needed for Phase 2/3, it's an additive feature flag.
* Vulkan service compositor — same rationale as Metal; the priority signal is "shell on Windows".

## Success criteria

* **Phase 1 done:** `Present`-to-`Present` jitter for 2 fast clients in shell within 2× of standalone.
* **Phase 2 done:** Service render thread spends < 1 ms per client per frame in synchronization. No CPU-side mutex acquisition on the render thread.
* **Phase 3 done:** N idle clients cost O(1) total per frame. A heavy client cannot drag a light client below its native cadence.
* **Overall:** Subjective smoothness of N apps in shell ≈ N apps standalone, on a representative dev box.

## See also

* `shell-optimization-plan.md` — concrete tasks, file paths, line numbers, code touchpoints.
* `shell-optimization-agent-prompt.md` — onboarding prompt for the agent that will implement this.
* `docs/architecture/compositor-pipeline.md` — pipeline reference.
* `docs/specs/swapchain-model.md` — swapchain / canvas semantics that any sync redesign must preserve.
* `docs/adr/ADR-001-native-compositors-per-graphics-api.md` — why each graphics API has its own native compositor (still holds; this work is *within* the D3D11 path).
