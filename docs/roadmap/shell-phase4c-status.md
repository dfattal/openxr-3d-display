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

- **SESSION_LOSS approach for v1:** Instead of full `COMP_MODE_DIRECT`/`COMP_MODE_EXPORT` hot-switch, push `XR_SESSION_EVENT_LOSS_PENDING` to IPC clients on deactivate. Apps destroy and recreate sessions, naturally falling back to standalone mode since `info.shell_mode` is now false. Simpler, avoids per-client DP lifecycle management.
- **MsgWaitForMultipleObjects:** Replaced `Sleep(500)` poll loop with `MsgWaitForMultipleObjects` + `PeekMessage` to support `RegisterHotKey` (Ctrl+Space, Ctrl+L) and tray messages alongside the existing poll work.
- **Suspended vs Dismissed:** Added `mc->suspended` flag distinct from `window_dismissed`. Suspended keeps multi-comp structure alive (window hidden, DP released) for fast resume. Dismissed tears down permanently with EXIT_REQUEST.
- **Startup behavior:** With args → activate immediately (unchanged). No args → start deactivated in system tray, await Ctrl+Space.
- **Launcher v1:** Ctrl+L launches first registered app from list. Full spatial launcher panel deferred to Phase 5.

## Known Issues

- **Ctrl+L launcher is minimal:** Currently launches first registered app, no selection UI. A proper spatial launcher panel is Phase 5.
- **Auto-adopt on re-activate:** Desktop window auto-adoption is called on Ctrl+Space activate but filtering may need tuning (IDE windows, system windows).
- **OpenXR app re-enter shell:** After deactivate→activate cycle, apps that survived LOSS_PENDING need to reconnect. Apps that exited need to be relaunched manually (or via Ctrl+L).
