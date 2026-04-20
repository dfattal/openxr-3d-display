# WebXR Bridge v2 — Phase 5 Agent Prompt

## Task

Fix the windowed-mode (F11) rendering issue in the WebXR Bridge v2 sample. In windowed mode, 3D rendering shows a double image with incorrect disparity because the compositor's `bridge_override` reads a different region of the swapchain than what the sample rendered.

## Background

The WebXR Bridge v2 sample is a reference WebXR app that renders to a 3D display via DisplayXR's compositor. The rendering pipeline is:

```
Sample (JS, browser) → Chrome WebXR → OpenXR swapchain → Service compositor → DP → Display
```

### View-Size Optimization

The sample renders each eye at `pixelSize × viewScale` (e.g., 1920×1080 for stereo SBS on 4K with viewScale 0.5×0.5). The compositor's `bridge_override` reads this same region from the swapchain, crops the atlas, and feeds it to the DP.

This works perfectly at **fullscreen** (window = display = 3840×2160). But in **windowed mode** (e.g., F11 → 1920×1080 window), the values disagree:
- Compositor: `sys->display_width × viewScaleX` where `sys->display_width` tracks the window (1920 → active = 960)
- Sample: `displayPixelSize × viewScaleX` where `displayPixelSize` is fixed (3840 → active = 1920)

### Reference: In-Process Compositor (Works Correctly)

The in-process D3D11 compositor (`comp_d3d11_compositor.cpp`) handles windowed mode by using the actual window dimensions each frame:

```c
// Line ~996: dynamically compute view dims from window size
u_tiling_compute_canvas_view(mode, tgt_width, tgt_height, &new_vw, &new_vh);
```

The native test app (`cube_handle_d3d11_win/main.cpp`) renders at `g_windowWidth * viewScaleX`:
```c
// Line ~600: render dims = window × viewScale
renderW = (uint32_t)(g_windowWidth * xr.recommendedViewScaleX);
renderH = (uint32_t)(g_windowHeight * xr.recommendedViewScaleY);
```

Both use the SAME window size → always agree → windowed mode works.

### Reference: Legacy Service Path (Works Correctly)

When `bridge_override = false` (legacy apps without bridge), Chrome's compromise-scaled subImage rects pass through unchanged. Chrome and compositor always agree because no override happens.

## The Problem

The bridge sample and compositor are in DIFFERENT processes (bridge exe + service exe). The sample gets window size from `windowPixelSize` (polled by bridge from compositor HWND via `GetClientRect`). The compositor uses `sys->display_width` (updated internally on resize). They may not match due to:

1. **Polling delay**: bridge polls every ~500ms
2. **Deferred resize**: compositor defers atlas resize during window drag
3. **Startup timing**: window starts 1920×1080 then goes fullscreen

### HWND Properties (Existing Infrastructure)

The compositor already publishes `DXR_ViewW` and `DXR_ViewH` HWND properties (deferred-resize-aware, exact values used by `bridge_override`). The bridge reads them in `poll_window_metrics`. But in testing, `GetPropW` returned 0 — the props weren't being read. This needs investigation.

If HWND props work, the sample can use `wi.viewWidth × wi.viewHeight` directly — guaranteed to match the compositor's `bridge_override` values since they come from the same computation.

## Key Files

| File | Role |
|------|------|
| `src/xrt/compositor/d3d11_service/comp_d3d11_service.cpp` | `bridge_override` computation (~line 7330), `publish_view_dims_to_hwnd` (~line 826) |
| `src/xrt/compositor/d3d11/comp_d3d11_compositor.cpp` | In-process reference: `u_tiling_compute_canvas_view` (~line 996) |
| `src/xrt/targets/webxr_bridge/main.cpp` | `poll_window_metrics` reads HWND props (~line 490), `WindowMetrics.viewWidth/viewHeight` |
| `webxr-bridge/sample/sample.js` | Tile computation (~line 342), GL viewport Y-flip (~line 428) |
| `test_apps/cube_handle_d3d11_win/main.cpp` | In-process app reference: `renderW = g_windowWidth * viewScaleX` (~line 600) |
| `src/xrt/auxiliary/util/u_tiling.h` | `u_tiling_compute_canvas_view` utility |

## Approach

1. **Debug HWND property reading**: verify `GetPropW` returns non-zero when compositor HWND props are set. Check elevated vs non-elevated process, timing, HWND mismatch.

2. **If props work**: sample uses `wi.viewWidth/viewHeight` for tile dims (guaranteed match with compositor). Falls back to `displayPixelSize × viewScale` before props arrive.

3. **If props don't work**: alternative cross-process mechanism. Options:
   - Named shared memory (already used for HUD — add view dims there)
   - Use the existing `bridge_hud_shared` struct to also carry view dims
   - Have the bridge compute `windowPixelSize × viewScale` and accept brief mismatch during drag (the compositor defers resize too, so the mismatch window is the same)

4. **Test**: fullscreen 3D ✓, windowed 3D ✓, F11 toggle ✓, mode switch in both ✓, resize during drag stable ✓

## Current State

The working tree has uncommitted changes (sample tile computation + compositor bridge_override) from the latest windowed-mode fix attempt. These should be reviewed — the `bridge_override` now uses `sys->display_width * viewScaleX` and the sample uses `windowPixelSize * viewScale` with fallback to `displayPixelSize * viewScale`. This is directionally correct but the values don't match in practice.

## What NOT to Change

- The GL Y-flip (`vpY = fbHeight - tileH - tileY*tileH`) is correct — don't revert
- The `bridge_override` concept is correct — don't remove it
- The app-initiated mode change (HWND property `DXR_RequestMode`) is correct
- The HUD shared memory, T key, C key, status indicators — all working
- The vendor-initiated transition gating (`!g_bridge_relay_active` on hardware state → mode change) is correct
