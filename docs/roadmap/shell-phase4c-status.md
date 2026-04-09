# Shell Phase 4C Status: Graceful Exit + App Launcher

**Branch:** `feature/shell-phase4c`
**Status:** Not started
**Date:** 2026-04-09

## Scope

Phase 4C combines the previously numbered 4D (Graceful Exit / Phase 1A resolution) and 4E (App Launcher & System Tray) into a single phase.

**Full plan:** [shell-phase4c-plan.md](shell-phase4c-plan.md)

## Part 1: Graceful Exit

### Task Status

| Status | Task | Description |
|--------|------|-------------|
| [ ] | 4C.1 | `shell_deactivate` IPC — proto.json + handler |
| [ ] | 4C.2 | Capture teardown + 2D window restore (`SetWindowPlacement`) |
| [ ] | 4C.3 | OpenXR app hot-switch (`COMP_MODE_DIRECT` / `COMP_MODE_EXPORT`) |
| [ ] | 4C.4 | HWND restore for OpenXR apps (hide ↔ show + style toggle) |
| [ ] | 4C.5 | Multi-compositor suspend/resume (stop render loop, release/recreate DP) |
| [ ] | 4C.6 | Shell-side deactivate flow (clear capture tracking, re-activate path) |

## Part 2: App Launcher & System Tray

### Task Status

| Status | Task | Description |
|--------|------|-------------|
| [ ] | 4C.7 | System-wide hotkey (`Ctrl+Space` via `RegisterHotKey`) |
| [ ] | 4C.8 | System tray icon (`Shell_NotifyIcon`) |
| [ ] | 4C.9 | Registered apps config (`registered_apps.json`) |
| [ ] | 4C.10 | App launch from shell (process spawn with correct env vars) |
| [ ] | 4C.11 | Auto-detect app type (IPC connect timeout → 3D vs 2D) |

## Commits

_(none yet)_

## Design Decisions

_(to be filled in during implementation)_

## Known Issues

_(to be filled in during implementation)_
