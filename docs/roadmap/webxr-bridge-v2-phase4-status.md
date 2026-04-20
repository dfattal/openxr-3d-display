# WebXR Bridge v2 — Phase 4 Status

## Summary

Phase 4 implemented the full-featured WebXR Bridge v2 sample with display-centric and camera-centric Kooima projection, view-size optimization, app-initiated mode changes, compositor-side HUD overlay, and eye tracking mode toggle. The sample achieves near-complete parity with `cube_handle_d3d11_win`.

## What's Working

### View-Size Optimization (fullscreen)
- Sample renders at `displayPixelSize × viewScale` (e.g., 1920×1080 for stereo SBS on 4K)
- GL viewport Y offset accounts for ANGLE's GL→D3D11 Y-flip (`vpY = fbHeight - tileH - tileY*tileH`)
- Compositor `bridge_override` reads the same active per-view dims from swapchain
- DP receives correctly-cropped atlas and renders without squishing

### App-Initiated Rendering Mode Changes
- Sample → extension → bridge WS → HWND property `DXR_RequestMode` → compositor polls each frame → server-side DP toggle
- Replaces the earlier qwerty V key relay (which was a temporary workaround)
- Qwerty V/0-8 keys disabled when bridge active; all keys consumed in WndProc
- Bridge keyboard hook captures keys → sample handles all input semantics

### Compositor-Side HUD Overlay
- Named shared memory (`DisplayXR_BridgeHUD`) for cross-process text data
- Sample sends `hud-update` WS messages → bridge writes to shared mem → compositor reads and renders via `u_hud` (stb_truetype)
- HUD shows: mode, tile dims, FPS, eye positions, Kooima mode, stereo params
- TAB key toggled independently from u_hud's own visibility

### Camera-Centric Kooima (C key)
- Port of `camera3d_view.c` to JavaScript
- Camera placed at `nominalViewerZ` on mode switch
- Mode-aware wheel tunables: invConvergenceDistance, zoomFactor (camera) vs perspectiveFactor, vHeight (display)

### Eye Tracking Mode (T key)
- `xrRequestEyeTrackingModeEXT` works in IPC mode (not blocked like rendering mode)
- Bridge handles `request-eye-tracking-mode` WS message
- MANAGED ↔ MANUAL toggle

### Landing Page
- DisplayXR logo + clean design with controls reference
- Green/red/gray status dots for WebXR, Extension, Bridge
- Pre-session bridge status detection via `status-request`/`bridge-status` protocol

### Vendor-Initiated Mode Transitions
- When Leia display auto-switches 3D on focus, compositor no longer forces rendering mode change when bridge active (avoids 2D-through-3D-weaver glitch)
- Sample receives `hardwarestatechange` event and auto-requests matching mode

## Current Blocker: Windowed Mode (F11)

### Symptom
In windowed mode (F11 toggles fullscreen ↔ windowed), 3D rendering shows a double image with incorrect disparity. The compositor crops the wrong region of the swapchain.

### Root Cause
The `bridge_override` in the compositor computes active per-view dims from `sys->display_width × viewScaleX`. When the window resizes, `sys->display_width` changes (proportionally scaled). But the sample computes tile dims from either `displayPixelSize` (fixed, correct at fullscreen only) or `windowPixelSize` (delayed, may not match compositor's `sys->display_width` due to timing and resize-during-drag deferrals).

The three values — what the sample renders, what Chrome submits as subImage, and what the compositor reads — must all agree. In fullscreen they agree; in windowed mode they disagree.

### Reference Implementations

**In-process compositor** (`comp_d3d11_compositor.cpp`):
- Uses `u_tiling_compute_canvas_view(mode, tgt_width, tgt_height, &new_vw, &new_vh)` to compute view dims from actual window size each frame (line ~996)
- App renders at `g_windowWidth * viewScaleX` (line ~600 of cube_handle main.cpp)
- Both use the SAME window size → always agree → windowed mode works

**Service compositor legacy path** (bridge_override=false):
- Chrome's compromise-scaled subImage rects pass through unchanged
- The compositor reads exactly what Chrome submitted
- Chrome and compositor always agree → windowed mode works (with oversized tiles)

### Why Bridge Path Differs
The bridge sample and compositor are in DIFFERENT processes. The sample gets window size from `windowPixelSize` (polled by bridge from compositor HWND). The compositor uses `sys->display_width` (updated internally on resize). These may not match due to:
1. **Polling delay**: bridge polls window metrics every ~500ms (or every frame before first detection). The compositor resizes immediately.
2. **Deferred resize**: compositor defers atlas resize during window drag (`in_size_move`). During drag, `sys->display_width` is stale.
3. **Startup timing**: window starts at 1920×1080 then goes fullscreen to 3840×2160. Bridge may poll during the transition.

### Suggested Fix Approach
Use the HWND property `DXR_ViewW`/`DXR_ViewH` which the compositor already publishes (deferred-resize-aware). These are the EXACT values the compositor uses for `bridge_override`. If the sample reads and uses them, both sides are guaranteed to agree.

The issue earlier with HWND props: `GetPropW` returned 0 (props not being read). This needs investigation — possibly an elevated/non-elevated process mismatch, or timing before props are set.

## Files Modified (since Phase 3)

| File | Purpose |
|------|---------|
| `src/xrt/auxiliary/util/u_bridge_hud_shared.h` | Shared memory struct for HUD overlay |
| `src/xrt/auxiliary/util/u_hud.c` | Render bridge HUD lines in u_hud |
| `src/xrt/auxiliary/util/u_hud.h` | bridge_hud field in u_hud_data |
| `src/xrt/compositor/d3d11/comp_d3d11_window.cpp` | Key filtering when bridge active |
| `src/xrt/compositor/d3d11_service/comp_d3d11_service.cpp` | bridge_override, app-initiated mode change, HUD shared mem, vendor transition gating |
| `src/xrt/state_trackers/oxr/oxr_api_session.c` | Allow headless sessions to call xrRequestDisplayRenderingModeEXT |
| `src/xrt/targets/webxr_bridge/main.cpp` | T key, HUD shared mem, app-initiated mode relay, initial mode index |
| `webxr-bridge/extension/src/main-world.js` | requestEyeTrackingMode, sendHudUpdate, bridge-status |
| `webxr-bridge/extension/src/isolated-world.js` | Bridge status, status-request handler |
| `webxr-bridge/sample/sample.js` | Camera-centric Kooima, V/C/T/TAB keys, HUD sender, view-size opt |
| `webxr-bridge/sample/index.html` | Landing page, status dots, controls reference |
| `webxr-bridge/sample/displayxr.png` | Logo |
| `webxr-bridge/PROTOCOL.md` | hud-update, request-eye-tracking-mode docs |
