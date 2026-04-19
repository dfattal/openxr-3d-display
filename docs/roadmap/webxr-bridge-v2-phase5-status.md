# WebXR Bridge v2 — Phase 5 Status

## Summary

Windowed-mode (F11 + arbitrary window size/position) now works end-to-end. The sample renders correct 3D with aspect preserved; the cube stays centered in the window as the window is dragged or resized (matching `cube_handle_d3d11_win`); eye tracking is no longer dropped on fullscreen⇄windowed transitions; mouse drags on the title bar or window borders no longer bleed into the sample as bogus camera input.

Architecturally this settled into the **cube_handle model**: the XR client swapchain is fixed at full-display worst-case, the atlas is fixed at the same size, tiles are always packed at `sys->view_width × sys->view_height` stride, and the per-tile *content* (smaller than the slot) sits in the top-left of each slot. The bridge is the single source of truth for per-tile content dims, pushes them cross-process, and mediates all window metadata between the compositor (HWND owner) and the sample (browser-side renderer).

## What Changed

### Compositor (`src/xrt/compositor/d3d11_service/comp_d3d11_service.cpp`)
- `bridge_override` reads `DXR_BridgeViewW/H` via `GetPropW` on `c->render.hwnd` (current-frame HWND) with `sys->compositor_hwnd` as fallback — the cached handle can go stale when Chrome recreates its compositor window on page reload. Falls back to `display_width × viewScaleX` if props aren't set yet.
- `layout_vw/vh = sys->view_width/view_height` unconditionally for non-shell. The previous bridge-only branch that used `active_vw` broke the atlas-stride invariant shared with `service_crop_atlas_for_dp`.
- Atlas-texture resize is gated off in bridge mode (`!g_bridge_relay_active`). The min-ratio shrink could make the atlas *narrower* than the bridge-computed content (e.g. 881-wide slot vs 944-wide content in a 1888×992 window), clipping the right edge.
- `publish_view_dims_to_hwnd` removed — the compositor no longer publishes view dims, it only consumes them.

### Compositor window (`src/xrt/compositor/d3d11/comp_d3d11_window.cpp`)
- Publishes `DXR_InSizeMove` HWND property on `WM_ENTERSIZEMOVE` / clears on `WM_EXITSIZEMOVE` so cross-process consumers can gate on the authoritative modal-drag state.

### Bridge (`src/xrt/targets/webxr_bridge/main.cpp`)
- `compute_and_push_bridge_view_dims()` computes `viewW/H = windowPxW/H × current mode's viewScale` and pushes to the compositor via `SetPropW(DXR_BridgeViewW/H)` on every `poll_window_metrics` and on mode change.
- `WindowMetrics.viewWidth/viewHeight` are bridge-computed (not read back from the compositor — that was a pointless roundtrip).
- WS client loop: the `MSG_PEEK` clean-close check is now gated by a zero-timeout `select()` before running. The earlier unconditional `MSG_PEEK` blocked the outgoing drain on an accept()ed (blocking) socket whenever the client wasn't talking, silently backing up window-info messages in the queue.
- Mouse hook reads `DXR_InSizeMove` per event and skips forwarding during modal size/move. Replaces the earlier client-rect heuristic; catches keyboard-initiated resize (Alt+Space → Size) as well.
- `log_line()` mirrors output to `%LOCALAPPDATA%/DisplayXR/bridge_debug.log` so `LOG_I` survives headless launches.

### Sample (`webxr-bridge/sample/sample.js`)
- Tile dims: prefer `wi.viewWidth/viewHeight` (bridge-authoritative) over `windowPixelSize × viewScale`. Exact match with the compositor's crop by construction.
- Window-relative Kooima: both the projection frustum (window-frame, eye = `eye_tracker − winOff`) and `camera.position` (= `eyePos × es + rig.pos`, i.e. window-frame scaled eye) follow the reference app. The virtual display moves with the window; the cube stays centered in the frustum.
- `hardwarestatechange` auto-request: debounced 600 ms, with flap-back cancellation. The Leia driver briefly flaps 3D→2D→3D during fullscreen⇄windowed transitions; debouncing avoids real mode changes with their eye-tracking grace period.
- Diag log includes kooima feed dims (`screen=…m winOff=… cam=…`) so future drift is easy to spot.

## Why It Took Several Iterations

Five stacked bugs behind one "windowed mode broken" symptom. Each fix surfaced the next:

1. **Plan drift — compositor computed, bridge re-read.** Initial design had the compositor publish `DXR_ViewW/H` and the bridge read them. That's a roundtrip: the *app* (proxied here by the bridge) is the source of truth for tile geometry, mirroring how `cube_handle_d3d11_win` fills in `XrCompositionLayerProjectionView.subImage.imageRect`. Reversed the arrow: bridge pushes, compositor consumes.

2. **Atlas stride mismatch (the real crop bug).** `bridge_override` set `layout_vw = active_vw` (window-size stride) so tiles were *written* into the atlas at 940-px stride, but `service_crop_atlas_for_dp` always *reads* at `sys->view_width = 1920`-px stride. Right-eye crop overlapped the left tile's content area → "some of left tile in my right eye." Fixed by making `layout_vw = sys->view_width` unconditionally — content sits top-left in the full-sized slot, just like legacy compromise apps.

3. **Atlas min-ratio shrink.** The compositor's atlas resize uses `ratio = min(windowW/dispW, windowH/dispH)` to preserve aspect. This makes the atlas *smaller* than the window whenever window aspect ≠ display aspect, so bridge-computed content overflowed the shrunken slot and got clipped. Fixed by gating the resize on `!g_bridge_relay_active`.

4. **WS send loop blocked by MSG_PEEK on blocking socket.** An earlier fix for extension-reload (detect clean TCP close via `recv(MSG_PEEK)`) called that recv on an accept()ed (blocking) socket with no data present — which is nearly every loop iteration. The recv blocked the outgoing drain, so the bridge queued 26 `window-info` updates on a resize and only 1 went over the wire. Sample's `windowInfo` was stuck at the session-start snapshot — every downstream computation (Kooima, tile dims) silently used fullscreen values even though the user had resized. Fixed by gating the `MSG_PEEK` behind a zero-timeout `select()`: only peek when the socket is actually readable.

5. **Window-relative Kooima — virtual display pose.** First attempt put `camera.position` at `eye_world × es` (anchored scene, cube at world origin, window is an aperture). Conceptually clean, and produces display-drag parallax, but the reference app (`cube_handle_d3d11_win` + `display3d_view.c`) uses `eye_world = (raw_eye − winOff) × es + rig_pos` which places the camera in the **window frame** — cube stays centered in the frustum as the window moves. Matched the reference convention.

## Lessons for Future Agents

- **Mirror the in-process app model.** For any bridge/IPC bug about tile geometry or projection, read `test_apps/common/display3d_view.c` + `test_apps/cube_handle_d3d11_win/main.cpp` first. Those files are the conventions.
- **"Invariant drift" is the usual culprit in cross-process atlas bugs.** The atlas contract has three users (sample writes, compositor copies client-SC→atlas, crop shader reads atlas→DP input). A change in any one must preserve the shared stride invariant. Grep all call sites of `sys->view_width` and `u_tiling_view_origin` before changing tile-layout code.
- **Trace the data flow end-to-end before theorizing.** When Kooima looked wrong, I spent time reasoning about aspect math before checking whether `windowInfo` was even reaching the sample. Adding per-frame diag logs in the sample and per-send logs in the bridge immediately surfaced the blocked WS send loop. Rule: when a subsystem has plausibly-correct code and visibly-wrong output, instrument the boundary first.
- **Cross-check the service log early.** `BRIDGE BLIT` / `BRIDGE DIMS` / `DP HANDOFF` spell out `active_vw/vh`, `sys->view_width/height`, `display_width/height`, `back_buffer`, `content_view_*` in one line. The `bridge_debug.log` in `%LOCALAPPDATA%/DisplayXR/` does the same for the bridge process.
- **Separation of concerns for cross-process state: detection in the owner, enforcement in the gateway.** For "is the compositor in a modal size/move?", the compositor owns `WM_ENTERSIZEMOVE`/`WM_EXITSIZEMOVE` and sets the authoritative `DXR_InSizeMove` prop; the bridge (which gates input forwarding) reads and enforces. Avoids heuristic reimplementations that go stale.
- **Leia SR hardware-state flaps on window-state transitions.** `hardwarestatechange` can fire 3D→2D→3D during fullscreen toggle; acting on each event drops eye tracking for seconds. Debounce with flap-back cancellation.
- **"Atlas resize" is a trap in bridge mode.** The optimization makes sense for legacy apps (client SC tracks window) but not for WebXR (client SC is always max). Until the atlas-resize code is generalized to be content-aware, gate it off for any mode where the client swapchain is fixed-size.

## HWND Properties (Cross-Process Protocol)

| Property | Set By | Read By | Meaning |
|---|---|---|---|
| `DXR_BridgeViewW` / `DXR_BridgeViewH` | bridge | compositor | Per-tile content dims (`windowPx × viewScale`). Updated on every window poll. |
| `DXR_RequestMode` | bridge | compositor | Sample-requested rendering mode (encoded as `modeIdx+1`). |
| `DXR_InSizeMove` | compositor window | bridge (mouse hook) | Present while the window is in the modal size/move loop. Absent otherwise. |

## Known Limits

- 600 ms debounce on `hardwarestatechange`. A legitimate external mode change (e.g., companion app toggling 2D/3D) will follow with that delay. Acceptable for interactive use.
- Atlas stays at full-display size in bridge mode. Memory cost: `3840×2160×4B ≈ 32 MiB` even when the window is tiny. Acceptable today.
- Keyboard input forwarding still passes through during size/move — only mouse is gated on `DXR_InSizeMove`. Safe because keyboard isn't used to steer the modal drag loop's content.
- `DXR_InSizeMove` is only published by the in-process D3D11 compositor window. If bridge sessions ever attach to another window class, the gate falls back to always-forward.
