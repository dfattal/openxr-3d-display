# Phase 2.K Agent Prompt — Controller-owned interactive layouts

Self-contained prompt for a fresh agent session implementing Phase 2.K of the workspace-extensions effort. Drop into a new session as the user message after `/clear`. The agent has no memory of the prior design conversations — this prompt assumes nothing.

---

## What Phase 2.K is for

You're picking up Phase 2.K — the **controller-owned motion + animation** sub-phase. Phase 2.G migrated layout-preset semantics out of the runtime into the workspace controller (the DisplayXR Shell), but in doing so it dropped the runtime's interactive carousel state machine + slot-animation system. The static-snap output works; smooth transitions, drag-to-rotate, scroll-radius, TAB-snap, and momentum are gone.

Phase 2.K's job: extend the public extension surface so a workspace controller can fully implement **any** 3D-window manipulation (drag, animation, smooth transitions, hover, edge-resize, fullscreen, close) without the runtime knowing what motion policy the controller is implementing. The runtime stays as plumbing.

After 2.K the runtime owns: per-frame compositor render, atlas composition, hit-test geometry, IPC plumbing. The controller owns: every motion policy, every animation curve, every interactive affordance.

## Read these in order before touching code

1. **`docs/roadmap/spatial-workspace-extensions-phase2K-plan.md`** — the design doc. Five deliverables, runtime / shell scope tables, acceptance criteria. **Read it first end-to-end.**
2. **`docs/roadmap/spatial-workspace-extensions-followups.md`** — item #2 is the input-side story; should land closed by Phase 2.K commit 1 (swap "Phase 2.K" → ✅ shipped after the commit).
3. **`docs/roadmap/spatial-workspace-extensions-plan.md`** — master plan; section on Phase 2.K explains why this lands before Phase 2.C.
4. **`docs/roadmap/spatial-workspace-extensions-phase2-audit.md`** — Phase 2.G entry shows what got deleted from the runtime that 2.K is now replacing (in the controller).
5. **Memory file `feedback_controllers_own_motion`** — durable design principle from the user. **Internalise this before designing**: the runtime exposes per-frame primitives, the controller owns all interactive policy, per-frame IPC is acceptable inside a 1% CPU budget. When in doubt, a third-party controller should be able to override the behaviour. If yes, it's policy and goes to the controller.
6. **Phase 2.G branch sequence and the 2.G agent prompt** (`docs/roadmap/spatial-workspace-extensions-phase2G-agent-prompt.md`) — same six-commit shape, gotchas to avoid (see "Phase 2.G hard-won lessons" below).
7. **Code reads (~45 minutes):**
   - `src/xrt/compositor/d3d11/comp_d3d11_window.cpp` lines ~535–620 (KEY public-ring push), ~660–720 (POINTER public-ring push, the `message != WM_MOUSEMOVE` skip you'll change), ~1505–1525 (pointer-capture setter — needs SetCapture/ReleaseCapture).
   - `src/xrt/compositor/d3d11_service/comp_d3d11_service.cpp::multi_compositor_render` — find the per-frame path; the FRAME_TICK push goes at the end of it. Also find the focused-slot tracking to wire FOCUS_CHANGED.
   - `src/xrt/compositor/d3d11_service/comp_d3d11_service.cpp::comp_d3d11_service_set_client_window_pose` (around line 10946) — Phase 2.G already cancels `anim.active` here; mirror the pattern in any other places that snap pose without animation.
   - `src/xrt/state_trackers/oxr/oxr_workspace.c` — dispatch wrappers; the existing `oxr_xrEnumerateWorkspaceInputEventsEXT` is your model for the new dispatch entries.
   - `src/xrt/ipc/shared/proto.json` — wire format definitions; the existing `workspace_enumerate_input_events` entry is your model.
   - `src/external/openxr_includes/openxr/XR_EXT_spatial_workspace.h` — the public surface; `spec_version` bumps from 5 → 6 here.
   - `src/xrt/targets/shell/main.c` — Phase 2.G shell-side preset code. The animation framework + carousel state machine you'll add live here.

## Branch + prerequisites

- **Start from the current tip of `feature/workspace-extensions-2G`**, not main. Phase 2.G isn't merged to main yet — the user is keeping the branch sequence in flight until both 2.G and 2.K are stable. Confirm tip with `git log --oneline -1 feature/workspace-extensions-2G` (should be `2df22dff0 docs: Phase 2.K plan covers smooth transitions too` or later).
- **New branch:** `feature/workspace-extensions-2K` off `feature/workspace-extensions-2G`'s tip.
- Per `feedback_branch_workflow.md`: never work on main directly; new branch off the current development tip is correct here.
- After every build that touches runtime binaries: copy `_package/bin/{DisplayXRClient.dll,displayxr-service.exe,displayxr-shell.exe}` to `C:\Program Files\DisplayXR\Runtime\` per `feedback_dll_version_mismatch.md`. Elevated processes ignore `XR_RUNTIME_JSON`, so the registry-installed runtime is what tests actually load.
- Per `feedback_test_before_ci.md`: build + smoke locally, then ask the user to test, then commit. Don't `/ci-monitor` until the user has signed off.

## Phase 2.G hard-won lessons (apply to 2.K)

These are the failures from 2.G that wasted significant debug time. Do not re-create them in 2.K.

1. **`xrEnumerateWorkspaceClientsEXT` includes the controller's own session** in the list. The shell filters by `cinfo.pid == GetCurrentProcessId()` in `shell_apply_preset` (and the new-client-detection block in main loop). Any new shell-side enumeration code in 2.K must apply the same filter.

2. **Display dimensions** must come from `XR_EXT_display_info` via `xrGetSystemProperties` (the shell already does this; results stored on `shell_openxr_state.display_width_m / display_height_m`). Hardcoded LP-3D fallbacks (0.700 × 0.394 m) are wrong on the actual LP-3D unit (0.344 × 0.194 m). Layout helpers in 2.K must read from `g_xr->display_*_m`, not constants.

3. **Connect-time race**: `xrEnumerateWorkspaceClientsEXT` returns a client ID a few ticks before the per-client compositor slot is bound; `xrSetWorkspaceClientWindowPoseEXT` against an unbound slot returns `XR_ERROR_VALIDATION_FAILURE` (-2). Phase 2.G handles this with a `s_auto_tile_pending` retry flag in the shell main loop. Any new "set pose on first connect" path in 2.K must retry until success.

4. **Slot entry animation overrides set_pose** — the runtime's `multi_compositor_register_client` starts a 300 ms entry animation by setting `anim.active = true`. If the per-frame `slot_animate_tick` runs after a `set_pose` call but before the controller's animation has converged, the entry animation overwrites the controller's pose. Phase 2.G's `comp_d3d11_service_set_client_window_pose` clears `anim.active` to fix this. **For 2.K, the controller's animation framework calls `set_pose` every tick, so each call clears `anim.active` — but be aware that the runtime's entry animation runs for ~300 ms, and during that window the controller's first `set_pose` competes with it. Acceptable behaviour; just be aware.**

5. **Per-process keyboard input does NOT reach the workspace WndProc reliably from `SendInput`** when the workspace doesn't have foreground focus. The shell's `displayxr_preset_{grid,immersive,carousel}` file-trigger mechanism (in `shell_drain_input_events`'s parent block in `main.c`) was added in 2.G as a debug back-door for tests that can't drive Ctrl+1..3 reliably. **Keep it for 2.K smoke tests** — drop a file in `%TEMP%\displayxr_preset_grid` to trigger a grid-preset switch programmatically. Tag it as debug-only (it already is in the comment).

6. **Atlas screenshot trigger**: per `reference_runtime_screenshot.md`, `touch %TEMP%\workspace_screenshot_trigger` produces `%TEMP%\workspace_screenshot_atlas.png` (3840×1080 SBS atlas). Use this for visual verification of orientation rendering, smooth transitions, carousel state. Per `feedback_shell_screenshot_reliability.md`, eye-tracking warmup can affect chrome rendering — wait ~5 seconds after launch before screenshotting.

7. **`feedback_controllers_own_motion`** is the architectural North Star. If implementation pressure tempts you to put motion policy back in the runtime, stop and re-read the memory.

## What ships in Phase 2.K

Five deliverables. The plan doc has the detailed scope tables; this is the execution-order summary.

### Public surface changes (`XR_EXT_spatial_workspace.h`, spec_version 5 → 6)

- New event variant: `XR_WORKSPACE_INPUT_EVENT_POINTER_MOTION_EXT` (or extend POINTER with `isMotion` field; pick during commit 1).
- New event variant: `XR_WORKSPACE_INPUT_EVENT_FRAME_TICK_EXT` (carries timestamp; no other fields).
- New event variant: `XR_WORKSPACE_INPUT_EVENT_FOCUS_CHANGED_EXT` (carries `prevClientId`, `currentClientId`).
- New PFN typedef + prototype: `xrRequestWorkspaceClientExitEXT(session, clientId)`.
- New PFN typedef + prototype: `xrRequestWorkspaceClientFullscreenEXT(session, clientId, XrBool32 fullscreen)`.
- Spec comments: revise the "Per-frame mouse-move events are NOT emitted" line in the PFN_xrEnumerateWorkspaceInputEventsEXT doc comment to describe the new motion gate.

### Runtime additions

- **`comp_d3d11_window.cpp`** — push WM_MOUSEMOVE to public ring under capture. Add `SetCapture` / `ReleaseCapture` to the pointer-capture setter (resolves the residual SetCapture limitation in followups #1).
- **`comp_d3d11_service.cpp`** — push FRAME_TICK at end of `multi_compositor_render`. Track focused-slot deltas, push FOCUS_CHANGED. Implement `comp_d3d11_service_request_client_exit` mirroring DELETE behaviour, `comp_d3d11_service_request_client_fullscreen` calling `toggle_fullscreen`.
- **`oxr_workspace.c`** — dispatch wrappers for the two new requests.
- **`ipc/shared/proto.json`** — wire format for new event variants + new RPCs. Regenerate IPC stubs.

### Shell additions

- **Animation framework** — per-client `slot_anim` struct (start/target pose+size, start_ns, duration_ns, active), tick function called per FRAME_TICK that interpolates and pushes `set_pose`. Mirror the deleted runtime `slot_animate_to` / `slot_animate_tick` design.
- **Smooth preset transitions** — `shell_apply_preset` snapshots current pose via `xrGetWorkspaceClientWindowPoseEXT`, seeds animation framework with start=current, target=new, duration=300 ms, ease-out cubic. The animation tick drives the actual `set_pose` calls.
- **Carousel state machine** — drag-to-rotate / scroll-radius / TAB-snap / momentum, all controller-side. Reads MOTION + SCROLL events from the input drain.
- **Variable poll cadence** — main loop drops `POLL_INTERVAL_MS` from 500 to ~16 ms while any animation is active or carousel is the active preset; returns to 500 ms when idle.
- **Pointer capture toggling** — enable on entering carousel preset (so motion events flow), disable on exit.

### Test app additions

- **Orientation smoke** — push 30° yaw via `xrSetWorkspaceClientWindowPoseEXT` to one client, screenshot the atlas, confirm visible tilt.
- **Lifecycle requests** — call `xrRequestWorkspaceClientExitEXT` and `xrRequestWorkspaceClientFullscreenEXT` against a synthetic capture client, confirm expected runtime behaviour.
- **FRAME_TICK + FOCUS_CHANGED** — drain a few of each, log counts.

## Recommended commit sequence

Six commits. Same shape as 2.A → 2.G.

### Commit 1 — Public surface bump

- `XR_EXT_spatial_workspace.h`: add MOTION + FRAME_TICK + FOCUS_CHANGED event types; add the two new request PFNs. Bump `spec_version` 5 → 6. Document semantics.
- `proto.json`: wire format for new variants + RPCs. Regenerate IPC stubs.
- `oxr_workspace.c`: dispatch entries for the new events + functions (handlers stubbed to return `XR_SUCCESS` and do nothing yet).
- **Acceptance:** Build green. `workspace_minimal_d3d11_win` resolves all PFNs (count goes from 22 → 24). No behaviour change yet — just surface.

### Commit 2 — Runtime emits the new events

- `comp_d3d11_window.cpp`: push WM_MOUSEMOVE to public ring (gated on capture or button-held — pick during commit). Add `SetCapture` / `ReleaseCapture` plumbing in the capture setter.
- `comp_d3d11_service.cpp`: push FRAME_TICK once per `multi_compositor_render`. Push FOCUS_CHANGED on focused-slot delta.
- Drain enrichment: fill `hitClientId` / `hitRegion` / `localUV` per motion event under a short slot-pose snapshot lock.
- **Acceptance:** `workspace_minimal_d3d11_win` (extended) drains MOTION events while pointer is captured, FRAME_TICK at ~60 Hz, FOCUS_CHANGED on TAB cycle. No shell-visible behaviour change yet.

### Commit 3 — Lifecycle request implementations

- `comp_d3d11_service.cpp`: implement `request_client_exit` (mirrors DELETE) and `request_client_fullscreen` (calls existing `toggle_fullscreen`).
- IPC handlers route the new RPCs to the implementations.
- `oxr_workspace.c`: dispatch wrappers replace the stubs from commit 1.
- Test app: drive both requests and confirm behaviour.
- **Acceptance:** Test app prints expected outcomes (target client exits / fullscreens).

### Commit 4 — Shell animation framework + smooth transitions

- `src/xrt/targets/shell/main.c`: add the per-client `slot_anim` struct, the tick function, and the curve helper. Hook the tick into the main loop, driven by FRAME_TICK events from the drain (fall back to the existing `MsgWaitForMultipleObjects` timer when FRAME_TICK isn't enabled).
- `shell_apply_preset` reworks: snapshot current pose per client, seed animation, return immediately. Tick drives the actual set_pose calls over ~300 ms.
- Auto-tile-on-connect (the 2.G fix at end of new-client-detection block) reuses animation framework so connect-time placement glides too.
- Variable poll cadence: 500 ms idle → 16 ms while any client's `slot_anim.active` is true.
- **Acceptance:** Ctrl+1 → Ctrl+2 glides; Ctrl+2 → Ctrl+1 glides; first cube on connect glides from spawn position to grid slot. `tests_pacing` still green.

### Commit 5 — Shell carousel state machine

- `src/xrt/targets/shell/main.c`: replicate the deleted runtime carousel — auto-rotation tick, drag-to-rotate (uses MOTION events while LMB held on a title bar — hit-test the cursor against `xrWorkspaceHitTestEXT` results returned in the MOTION event's `hitRegion`), scroll-radius (consumes SCROLL events), TAB-snap-to-front (consumes the existing TAB KEY event, computes target angle, animates), momentum (track angular velocity through the drag, decay after release).
- Pointer capture: enable on Ctrl+3 entry, disable on switch to other preset.
- N=2 special case: rotate (since it's a real carousel now) so both windows are visible at different ring positions.
- **Acceptance:** Manual smoke per the plan doc — auto-rotation, drag, scroll, TAB-snap all match the pre-Phase-2.G runtime carousel within visible tolerance.

### Commit 6 — Verification + docs

- Test app: orientation smoke (30° yaw, screenshot, verify tilt). Drain FRAME_TICK + FOCUS_CHANGED + MOTION counts and assert > 0 over a 2-second window with cursor activity.
- `docs/roadmap/spatial-workspace-extensions-followups.md`: mark item #2 ✅ shipped.
- `docs/roadmap/spatial-workspace-extensions-plan.md` and `phase2-audit.md`: mark Phase 2.K shipped.
- `docs/specs/XR_EXT_spatial_workspace.md` (if present, otherwise create): document the new event types + request functions.

## Acceptance criteria for the whole phase

(See the plan doc's acceptance section for the full checklist; this is the headline.)

- ✅ Smooth preset transitions between Ctrl+1 / Ctrl+2 / Ctrl+3.
- ✅ Carousel preset is fully interactive: auto-rotation, drag, scroll, TAB-snap, momentum, N=2 visible.
- ✅ FRAME_TICK + FOCUS_CHANGED events fire correctly.
- ✅ `xrRequestWorkspaceClientExitEXT` / `xrRequestWorkspaceClientFullscreenEXT` work end-to-end.
- ✅ Tilted-window smoke confirms orientation rendering.
- ✅ Idle CPU near zero; animation CPU under 1% of one core.
- ✅ Windows MSVC build green; standalone test app smoke + workspace test app smoke + 2-cube interactive smoke all pass.

## Hand-off notes

- **Don't merge to main yet.** The user has explicitly chosen to keep developing on the branch sequence (`feature/workspace-extensions-2G` → `feature/workspace-extensions-2K`) until both 2.G and 2.K are stable. Confirm with the user before opening any PR or rebasing onto main.
- **The orientation-rendering smoke** (deliverable verification) might surface a runtime bug. If `slot_pose_to_pixel_rect` doesn't apply orientation but `project_local_rect_for_eye` does, you may see correct parallax but wrong axis-aligned hit-test. Decide during smoke whether to fix in this phase or file as a 2.K follow-up.
- **Wire format compatibility:** the controller's IPC version must match the runtime's. Don't mix Phase 2.K controller binaries with Phase 2.G runtime binaries — the new event types will be unknown enum values and may panic the dispatch. Bump the workspace-extension `spec_version` in commit 1 and verify both sides advertise the same.
- **Per-frame motion event cost** is the only real perf risk. If profiling shows >1% CPU during cursor activity, consider option (b) from the plan: emit MOTION only while a button is held. That covers carousel drag and most "interesting" use cases.
- **`feedback_test_before_ci.md`**: smoke locally, ask the user to test, then commit. Don't `/ci-monitor` until they've signed off.
- **Always build via `scripts\build_windows.bat`** per `feedback_use_build_windows_bat.md`. Don't invoke cmake / ninja directly on Windows.

## What unblocks once Phase 2.K passes

- **Phase 2.C — chrome rendering migration.** Controllers can submit their own swapchains; runtime composites them alongside client windows. With 2.K's MOTION + FOCUS_CHANGED events flowing, the controller has everything it needs to drive interactive chrome (drag handles, focus rings, snap previews, custom title bars).
- **Phase 2.J — shell repo extraction** can proceed independently; 2.K mostly lives in the shell + a small surface change in the runtime.
