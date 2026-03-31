# Shell Phase 1 — Implementation Status

Last updated: 2026-03-31 (branch `feature/shell-phase1-ci`)

## What Works (from Phase 0)

All Phase 0 features are merged to main and working:
- Multi-app compositor with shader-blit windowed rendering
- Live eye tracking via IPC (display-centric Kooima)
- 2D/3D mode switching via IPC shared memory
- Input forwarding with TAB focus cycling + cyan border
- Two-app slot-based layout: (5%,5%,40%,40%) and (55%,5%,40%,40%)
- ESC dismiss with 2D switch, DELETE close with dark gray clear
- All keys go to both qwerty and app (ADR-014)

See `shell-phase0-status.md` for full details and lessons learned.

## Phase 1 Progress

### Phase 1A: IPC-to-Standalone Hot-Switch
**Status:** Not started

When shell exits (ESC), apps should seamlessly switch from IPC to standalone mode.

| Task | Status | Notes |
|------|--------|-------|
| 1A.1 Detect shell dismiss on client | | |
| 1A.2 Restore app HWND | | |
| 1A.3 Create native compositor in-process | | |
| 1A.4 Migrate swapchains | | |
| 1A.5 Create per-app DP | | |
| 1A.6 Resume rendering | | |

### Phase 1B: Dynamic Window Poses
**Status:** Not started

Shell can reposition 3D windows dynamically via IPC.

| Task | Status | Notes |
|------|--------|-------|
| 1B.1 Per-client window pose storage | | Foundation exists: `window_rect_x/y/w/h` on client slot |
| 1B.2 Shell IPC: `shell_set_window_pose` | | |
| 1B.3 HWND resize on pose change | | Deferred SetWindowPos pattern already works |
| 1B.4 Update shader blit dest rect | | Already dynamic per-slot |
| 1B.5 Eye position transform to window-local | | |

### Phase 1C: Mouse-Ray Hit-Test
**Status:** Not started

Click on shell window → determine which 3D window was hit.

| Task | Status | Notes |
|------|--------|-------|
| 1C.1 Shell sends cursor coords | | |
| 1C.2 Ray construction from eye | | |
| 1C.3 Window quad intersection | | |
| 1C.4 Return hit result | | |
| 1C.5 Map UV to HWND client coords | | |

### Phase 1D: Shell App Skeleton
**Status:** Not started

Minimal `displayxr-shell.exe` that manages window layout.

| Task | Status | Notes |
|------|--------|-------|
| 1D.1 Privileged IPC client | | |
| 1D.2 Auto-start service | | |
| 1D.3 App connect/disconnect events | | |
| 1D.4 Default window placement | | |
| 1D.5 Mouse drag windows | | |
| 1D.6 Scroll wheel Z depth | | |

## Known Issues

### Apps don't survive shell exit
When ESC dismisses the shell, apps are alive but invisible — IPC swapchains render to nowhere. Apps must be restarted standalone. Fix: Phase 1A.

### HWND centered for Kooima offset
App HWNDs are centered on the display so the app computes zero eye offset from HWND position. The actual window-local eye positions come from xrLocateViews. This works but is a workaround — ideally the eye offset computation would use the virtual window pose directly.

## Key Files

See `shell-phase1-plan.md` for the full file reference from Phase 0.
