# XR_EXT_session_target - Phase 2 Implementation Summary

## Overview

Phase 2 adds the infrastructure for **per-session rendering**, enabling multiple OpenXR applications to run simultaneously, each with their own window and SR weaver.

## Status: Infrastructure Complete, Full Pipeline Pending

The per-session render resources (comp_target + SR weaver) are now created per-session. However, the full multi-app rendering pipeline requires additional architectural changes to the compositor's render loop.

## What Was Implemented

### 1. Per-Session Render Resources in multi_compositor

Added new fields to `struct multi_compositor` for per-session rendering:

```c
struct {
    void *external_window_handle;    // HWND from XR_EXT_session_target
    struct comp_target *target;       // Per-session VkSwapchain
    struct leiasr *weaver;           // Per-session SR weaver
    bool initialized;                 // Lazy initialization flag
} session_render;
```

### 2. Lazy Initialization of Per-Session Resources

Added `multi_compositor_init_session_render()` function that:
- Creates a `comp_target` from the session's external HWND
- Creates a per-session SR weaver bound to that window
- Allocates necessary Vulkan resources (command pool)
- Called lazily on first frame render

### 3. Per-Session Cleanup

Modified `multi_compositor_end_session()` to clean up:
- Per-session SR weaver
- Per-session comp_target
- Associated Vulkan resources

### 4. Render Loop Integration

Modified `transfer_layers_locked()` to:
- Check for sessions with external window handles
- Lazily initialize per-session resources on first frame
- Maintain backward compatibility with shared rendering

## Files Modified

| File | Change |
|------|--------|
| `src/xrt/compositor/multi/comp_multi_private.h` | Added session_render struct, helper functions |
| `src/xrt/compositor/multi/comp_multi_compositor.c` | Added init/cleanup for per-session resources |
| `src/xrt/compositor/multi/comp_multi_system.c` | Lazy initialization in render loop |

## Architecture

### Current Flow (Phase 1 + Phase 2 Infrastructure)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Session 1 (with external HWND)                                             │
│    - Layers submitted to multi_compositor                                   │
│    - session_render.target created from HWND                                │
│    - session_render.weaver created for windowed mode                        │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Multi-System Compositor (render loop)                                      │
│    - Collects layers from all sessions                                      │
│    - Currently: all layers go to shared native compositor                   │
│    - TODO: Route sessions with own target to per-session pipeline           │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Native Compositor (comp_compositor)                                        │
│    - Renders all layers                                                     │
│    - Uses shared weaver (from Phase 1)                                      │
│    - Outputs to first session's window                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Target Flow (Phase 2 Complete)

```
┌──────────────────────────┐    ┌──────────────────────────┐
│  Session 1               │    │  Session 2               │
│  (external HWND A)       │    │  (external HWND B)       │
│  - session_render.target │    │  - session_render.target │
│  - session_render.weaver │    │  - session_render.weaver │
└────────────┬─────────────┘    └────────────┬─────────────┘
             │                               │
             ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  Per-Session Pipeline    │    │  Per-Session Pipeline    │
│  - Render session layers │    │  - Render session layers │
│  - Weave to HWND A      │    │  - Weave to HWND B      │
└──────────────────────────┘    └──────────────────────────┘
```

## Remaining Work for Full Multi-App Support

### 1. Per-Session Render Pipeline

The main challenge is that `comp_renderer` is tightly coupled to `comp_compositor`. Options:

**Option A: Multiple Native Compositors**
- Create a `comp_compositor` instance per session with external HWND
- Each has its own renderer and weaver
- Pro: Cleaner separation
- Con: Resource duplication, significant refactoring

**Option B: Shared Compositor, Per-Session Output**
- Keep shared layer composition
- After rendering, weave output to each session's window
- Pro: Less duplication
- Con: Requires exposing rendered views from comp_renderer

**Option C: Per-Session Render Pass**
- Factor out render pass code from comp_renderer
- Call it per-session with session's target
- Pro: Most flexible
- Con: Significant refactoring of render code

### 2. Recommended Next Steps

1. **Expose stereo views from comp_renderer** - Add accessor to get rendered left/right views
2. **Add per-session weave pass** - After shared render, weave to each session's window
3. **Handle frame timing** - Each session may have different present timing

### 3. Code Location for Changes

```c
// In comp_multi_system.c, after xrt_comp_layer_commit():

// For each session with per-session rendering:
for (size_t k = 0; k < count; k++) {
    struct multi_compositor *mc = array[k];
    if (mc->session_render.initialized && mc->session_render.weaver) {
        // Get rendered stereo views (need to expose from comp_renderer)
        VkImageView left_view, right_view;
        comp_renderer_get_stereo_views(renderer, &left_view, &right_view);

        // Weave to this session's window
        leiasr_weave(mc->session_render.weaver, ...);

        // Present to session's target
        comp_target_present(mc->session_render.target, ...);
    }
}
```

## Testing

### Current State (Phase 2 Infrastructure)
- Single app with external HWND: Works (Phase 1 behavior)
- Per-session resources created: Yes
- Multiple apps simultaneously: Not yet (renders to first app only)

### To Verify Phase 2 Infrastructure
1. Run app with external HWND
2. Check logs for "Initialized per-session render resources"
3. On session end, check logs for "Cleaned up per-session render resources"

## Backward Compatibility

- Sessions WITHOUT external HWND: Use shared native compositor (unchanged)
- Sessions WITH external HWND: Per-session resources created, but currently still rendered through shared pipeline (Phase 1 behavior preserved)

## Summary

Phase 2 establishes the infrastructure for per-session rendering:
- ✅ Per-session comp_target creation
- ✅ Per-session SR weaver creation
- ✅ Lazy initialization on first frame
- ✅ Proper cleanup on session end
- ⏳ Per-session render pipeline (requires comp_renderer refactoring)
- ⏳ Multiple simultaneous outputs (blocked on above)

The groundwork is in place for true multi-app support. The next step is to refactor the rendering code to support per-session output.
