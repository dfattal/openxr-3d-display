# Shell Phase 4C Status: Graceful Exit + App Launcher

**Branch:** `feature/shell-phase4c`
**Status:** Implementation complete, pending testing
**Date:** 2026-04-09

## Scope

Phase 4C combines the previously numbered 4D (Graceful Exit / Phase 1A resolution) and 4E (App Launcher & System Tray) into a single phase.

**Full plan:** [shell-phase4c-plan.md](shell-phase4c-plan.md)

## Part 1: Graceful Exit

### Task Status

| Status | Task | Description |
|--------|------|-------------|
| [x] | 4C.1 | `shell_deactivate` IPC — proto.json + handler |
| [x] | 4C.2 | Capture teardown + 2D window restore (`SetWindowPlacement`) |
| [x] | 4C.3 | OpenXR app session loss (`XRT_SESSION_EVENT_LOSS_PENDING` on deactivate) |
| [x] | 4C.4 | HWND restore: `oxr_session.c` checks `info.shell_mode` before borderless |
| [x] | 4C.5 | Multi-compositor suspend/resume (stop render loop, release/recreate DP) |
| [x] | 4C.6 | Shell-side deactivate flow (clear capture tracking, re-activate path) |

## Part 2: App Launcher & System Tray

### Task Status

| Status | Task | Description |
|--------|------|-------------|
| [x] | 4C.7 | System-wide hotkey (`Ctrl+Space` via `RegisterHotKey`) |
| [x] | 4C.8 | System tray icon (`Shell_NotifyIcon`) |
| [x] | 4C.9 | Registered apps config (`registered_apps.json`) |
| [x] | 4C.10 | App launch from shell (`Ctrl+L`, process spawn with correct env vars) |
| [x] | 4C.11 | Auto-detect app type (IPC connect timeout → 3D vs 2D) |

## Commits

1. `514e133` — Shell 4C: add shell_deactivate IPC, capture teardown, multi-comp suspend (#43)
2. `4975476` — Shell 4C: system hotkey, tray icon, shell-side deactivate flow (#43)
3. `c306ca5` — Shell 4C: OpenXR session loss on deactivate, shell_mode guard (#43)
4. `b13915e` — Shell 4C: registered apps config, Ctrl+L launcher, auto-detect type (#43)

## Design Decisions

- **Lazy hot-switch (not SESSION_LOSS):** When the shell deactivates, the per-client compositor lazy-creates per-client standalone resources (swap chain + DP) on the app's IPC server thread on the next `layer_commit`. The app's HWND is shown via `ShowWindowAsync`. No session loss — apps keep their session and continue rendering. Reverse hot-switch on re-activate uses the same lazy pattern via a `pending_shell_reentry` flag.
- **`owns_window` fix:** `comp_d3d11_service_owns_window()` now queries the active compositor's `render.owns_window` instead of just checking `shell_mode`. Critical for the IPC view pose path: handle apps with external HWNDs need the display-centric Kooima branch (real eye tracking) not the camera-centric branch (qwerty controller pose).
- **GL Y-flip in standalone path:** `service_crop_atlas_for_dp()` now takes a `flip_y` parameter. When set (GL clients with `atlas_flip_y`), it uses the existing shader blit path with negative source rect height instead of `CopySubresourceRegion`. The crop texture is created with `BIND_RENDER_TARGET`.
- **DXGI frame latency = 1:** Hot-switched swap chains call `IDXGIDevice1::SetMaximumFrameLatency(1)` to minimize the queue depth between Present and DWM cross-process composition.
- **`DwmFlush()` after Present** for cross-process swap chains — blocks until the next composition pass to reduce drag stutter.
- **MsgWaitForMultipleObjects:** Replaced `Sleep(500)` poll loop with `MsgWaitForMultipleObjects` + `PeekMessage` to support `RegisterHotKey` (Ctrl+Space, Ctrl+L) and tray messages alongside the existing poll work.
- **Suspended vs Dismissed:** Added `mc->suspended` flag distinct from `window_dismissed`. Suspended keeps multi-comp structure alive (window hidden, DP released) for fast resume. Dismissed tears down permanently with EXIT_REQUEST.
- **Startup behavior:** With args → activate immediately (unchanged). No args → start deactivated in system tray, await Ctrl+Space.
- **Launcher v1:** Ctrl+L launches first registered app from list. Full spatial launcher panel deferred to Phase 5.

## Known Limitations

- **Drag stutter for hot-switched apps:** When dragging an app's window after shell deactivation, the 3D image may show some stutter or intermittent crosstalk compared to true in-process handle apps. Root causes:
  - **No phase snapping** — In-process handle apps benefit from a vendor-installed `WM_WINDOWPOSCHANGING` hook that snaps the window to lens-aligned pixel positions. The hook is in the same process as the HWND. For our cross-process IPC case, the SR SDK is in the service process and cannot install a hook on the app's HWND without DLL injection.
  - **IPC roundtrip overhead** — Each frame during drag involves an IPC call (~10ms) vs direct function call (~5ms) for in-process apps, halving the effective drag refresh rate.
  - **SDK 2D/3D mode toggling** — During fast window movement, the SR SDK may temporarily fall back to 2D mode (showing raw left/right tiles) as a safety measure when it can't get a stable phase lock.
- **Mitigations applied:** `SetMaximumFrameLatency(1)`, `DwmFlush()` after Present, frame timing logs (removed in final version) confirmed within-frame position stability.
- **Future work:** A vendor-agnostic phase snap query API in the SDK would let the service compositor perform position snapping without DLL injection.

## Known Issues

- **Ctrl+L launcher is minimal:** Currently launches first registered app, no selection UI. A proper spatial launcher panel is Phase 5.
- **Auto-adopt on re-activate:** Desktop window auto-adoption is called on Ctrl+Space activate but filtering may need tuning (IDE windows, system windows).
- **OpenXR app re-enter shell:** After deactivate→activate cycle, apps that survived LOSS_PENDING need to reconnect. Apps that exited need to be relaunched manually (or via Ctrl+L).
