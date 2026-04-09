# Shell Phase 4C: Agent Prompt — Graceful Exit + App Launcher

Use this prompt to start a new Claude Code session for implementing Phase 4C on branch `feature/shell-phase4c`.

---

## Prompt

```
I'm working on the DisplayXR shell — a spatial window manager for 3D displays. We're implementing Phase 4C: Graceful Exit + App Launcher. This combines the previously planned 4D (graceful exit / Phase 1A resolution) and 4E (app launcher / system tray).

## Context

Read these docs first (in order):
1. `CLAUDE.md` — project overview, build commands, architecture
2. `docs/roadmap/shell-phase4c-plan.md` — **the plan you're implementing** (full task list, sequences, design)
3. `docs/roadmap/shell-phase4c-status.md` — current progress (update as you complete tasks)
4. `docs/roadmap/shell-phase4a-status.md` — Phase 4A/4B status (what's already built)
5. `docs/roadmap/shell-runtime-contract.md` — IPC protocol boundary

## Branch

You are on branch `feature/shell-phase4c`. All work goes here. Commits must reference #43 (shell tracking issue).

## What Phase 4C Needs

Two major features:

### Part 1: Graceful Exit (Phase 1A Resolution)

When the shell deactivates (ESC or Ctrl+Space), all windows return to their original desktop positions and OpenXR apps switch back to standalone compositing. When re-summoned, everything restores.

**Implementation order:**

1. **4C.1: `shell_deactivate` IPC** (Small)
   - Add `"shell_deactivate": {}` to `src/xrt/ipc/shared/proto.json` (follow `shell_activate` pattern)
   - Add handler `ipc_handle_shell_deactivate()` in `src/xrt/ipc/server/ipc_server_handler.c`
   - Handler calls a new `comp_d3d11_service_deactivate_shell()` function

2. **4C.2: Capture teardown + 2D window restore** (Medium)
   - In the deactivate handler: iterate all `CLIENT_TYPE_CAPTURE` slots
   - Call `d3d11_capture_stop()` for each (already exists at `d3d11_capture.cpp:360`)
   - Call `SetWindowPlacement(slot->saved_placement)` to restore each 2D window
   - `saved_placement` and `saved_exstyle` are already stored per slot (`comp_d3d11_service.cpp:545-546`)
   - Remove all capture virtual client slots

3. **4C.5: Multi-compositor suspend/resume** (Small)
   - On deactivate: stop the multi-comp render loop, release the shared DP instance, hide shell window (`ShowWindow(SW_HIDE)`)
   - On activate: recreate DP, restart render loop, show window
   - The `window_dismissed` flag (`comp_d3d11_service.cpp:587`) already handles a simpler version of this — extend it

4. **4C.4: HWND restore for OpenXR apps** (Medium)
   - On deactivate: restore each IPC app's HWND from hidden borderless (`WS_POPUP`) back to visible decorated (`WS_OVERLAPPEDWINDOW`)
   - The HWND was originally made borderless in `oxr_session_create` — save the original style there
   - On re-activate: reverse (hide + borderless)

5. **4C.3: OpenXR app hot-switch** (Large — do this last in Part 1)
   - Add `enum comp_output_mode { COMP_MODE_DIRECT, COMP_MODE_EXPORT }` to per-client compositor
   - `COMP_MODE_EXPORT` (current shell behavior): compositor writes to shared texture, multi-comp blits
   - `COMP_MODE_DIRECT`: compositor creates its own DP and presents to its own HWND (standalone behavior)
   - Mode switch triggered by `shell_deactivate` / `shell_activate`
   - Compositor drains current frame, switches output path, continues
   - No OpenXR session teardown — session, swapchains, and app rendering are unaffected
   - **Fallback**: if hot-switch is too complex, push `XR_SESSION_LOSS_PENDING` and let apps recreate sessions naturally

### Part 2: App Launcher & System Tray

6. **4C.7: System-wide hotkey** (Medium)
   - `RegisterHotKey(NULL, HOTKEY_ID, MOD_CONTROL, VK_SPACE)` in shell `main.c`
   - Handle `WM_HOTKEY` in message loop to toggle activate/deactivate
   - Must work when shell window is not focused (that's what RegisterHotKey provides)

7. **4C.8: System tray icon** (Small)
   - `Shell_NotifyIcon` with `NOTIFYICONDATA` in shell `main.c`
   - Show tray icon when shell is deactivated
   - Left-click: activate shell
   - Right-click: context menu (Activate / Exit)
   - On exit: `UnregisterHotKey`, `Shell_NotifyIcon(NIM_DELETE)`, process exit

8. **4C.6: Shell-side deactivate flow** (Small)
   - In shell `main.c`: when deactivating, call `ipc_call_shell_deactivate()`
   - Clear local capture tracking arrays
   - Stop the adopt polling loop
   - On re-activate: call `ipc_call_shell_activate()`, re-enumerate, re-adopt, restore layout from persistence JSON

9. **4C.9: Registered apps config** (Medium)
   - JSON file: `%LOCALAPPDATA%\DisplayXR\registered_apps.json`
   - Format: `[{"name": "Cube D3D11", "exe_path": "path/to/cube.exe", "type": "3d"}]`
   - Load on shell startup, pre-populate with demo apps on first run

10. **4C.10: App launch from shell** (Medium)
    - `Ctrl+L` opens a minimal text prompt (or just reads from registered apps)
    - For "3d" apps: `CreateProcess` with `DISPLAYXR_SHELL_SESSION=1` + `XR_RUNTIME_JSON` env vars
    - For "2d" apps: `CreateProcess` normally, then `shell_add_capture_client(hwnd)` after window appears

11. **4C.11: Auto-detect app type** (Small)
    - After launching unknown app, poll `system_get_clients` for 5 seconds
    - If new IPC client appears → 3D app
    - If no IPC client → find new HWND via enumeration → 2D capture

## Key existing code to understand:

1. **Multi-comp slots**: `struct d3d11_multi_client_slot` at ~line 454 of `comp_d3d11_service.cpp` — `client_type`, `saved_placement`, `capture_ctx`
2. **Shell activate handler**: `ipc_handle_shell_activate()` at `ipc_server_handler.c:1949` — follow this pattern for deactivate
3. **Window dismiss**: `window_dismissed` flag at `comp_d3d11_service.cpp:587` — ESC currently sets this, new client clears it
4. **Shell main**: `src/xrt/targets/shell/main.c` — service auto-start, IPC connect, monitor loop, capture tracking
5. **Capture stop**: `d3d11_capture_stop()` at `d3d11_capture.cpp:360` — tears down capture session cleanly
6. **IPC protocol**: `proto.json` — `shell_activate`, `shell_set_window_pose`, `shell_add_capture_client` show the pattern

## Build and test:

```bash
# Build on Windows (local, no CI needed)
scripts\build_windows.bat build

# Test graceful exit:
# 1. Open Notepad + Calculator
# 2. Launch shell:
_package\bin\displayxr-shell.exe --capture-hwnd <notepad> --capture-hwnd <calc> ^
    test_apps\cube_handle_d3d11_win\build\cube_handle_d3d11_win.exe
# 3. Press ESC → verify windows restore to desktop
# 4. Press Ctrl+Space → verify shell re-activates

# Test system tray:
# 1. Launch: _package\bin\displayxr-shell.exe
# 2. Should start in system tray
# 3. Ctrl+Space to activate/deactivate
```

## What NOT to change:

- Display processor / weaver internals
- OpenXR state tracker session lifecycle (no session state changes during hot-switch)
- IPC client compositor transport (shared textures stay alive)
- Capture API internals (`d3d11_capture.cpp`)
- Existing standalone (non-shell) app behavior

## Commit style:

Each meaningful piece of work gets its own commit with issue ref:
- `Shell 4C: add shell_deactivate IPC (#43)`
- `Shell 4C: capture teardown and 2D window restore (#43)`
- etc.

Build locally after each commit: `scripts\build_windows.bat build`
Update `docs/roadmap/shell-phase4c-status.md` as tasks complete.
```

---

## Notes for the developer

- Part 1 (graceful exit) is the harder half. Start with the capture teardown path (4C.1 → 4C.2 → 4C.5) which is straightforward — existing APIs do the heavy lifting. Test that 2D windows restore before tackling the OpenXR hot-switch.
- The hot-switch (4C.3) may require the fallback `SESSION_LOSS` approach. Don't over-invest in the full `COMP_MODE_DIRECT`/`COMP_MODE_EXPORT` toggle if it proves too invasive. The simpler path (apps recreate session) is acceptable for v1.
- Part 2 (launcher/tray) is mostly shell-side code (`main.c`). The Win32 APIs (`RegisterHotKey`, `Shell_NotifyIcon`, `CreateProcess`) are well-documented and straightforward.
- The shell's monitor loop in `main.c` (~line 880) polls every 500ms. The hotkey handling needs a `PeekMessage`/`GetMessage` loop or integration with the existing poll loop.
