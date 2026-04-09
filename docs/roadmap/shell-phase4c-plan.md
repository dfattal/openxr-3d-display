# Shell Phase 4C Plan: Graceful Exit + App Launcher

**Branch:** `feature/shell-phase4c`
**Tracking issues:** #43, #44
**Depends on:** Phase 4A (capture compositor — complete), Phase 4B (window adoption — partial, input parked)

## Overview

Phase 4C resolves two long-deferred features that complete the Spatial Companion:

1. **Graceful Exit (was 4D / Phase 1A)** — When the shell exits, all windows return to their original Windows desktop positions. OpenXR apps switch back to standalone compositing. The desktop looks exactly as it did before the shell was summoned. Re-summoning restores the spatial layout.

2. **App Launcher & System Tray (was 4E)** — System-wide `Ctrl+Space` hotkey to toggle the shell. System tray icon for background residence. Built-in launcher to start new apps from within the shell.

## Prior Art and Existing Infrastructure

These pieces are already in place and will be leveraged:

| Component | Location | What exists |
|-----------|----------|-------------|
| `window_dismissed` flag | `comp_d3d11_service.cpp:587` | ESC sets this, new client connecting clears it and recreates window |
| `saved_placement` / `saved_exstyle` | `comp_d3d11_service.cpp:545-546` | Per-capture-slot `WINDOWPLACEMENT` + style saved on adoption |
| `d3d11_capture_stop()` | `d3d11_capture.cpp:360` | Tears down `GraphicsCaptureSession` and frame pool |
| `multi_compositor_remove_capture_client()` | `comp_d3d11_service.cpp:3632` | Removes a capture slot + stops capture |
| `shell_activate` IPC | `proto.json:59`, handler at `ipc_server_handler.c:1949` | Enters shell mode dynamically |
| `enumerate_and_adopt_windows()` | `shell/main.c:636` | `EnumWindows` + filtering + `shell_add_capture_client` |
| Shell persistence | `shell/main.c` | `%LOCALAPPDATA%\DisplayXR\shell_layout.json` save/restore |
| Animation system | `comp_d3d11_service.cpp` | `slot_animate_to()` + `slot_animate_tick()`, ease-out cubic, 300ms |

---

## Part 1: Graceful Exit (Phase 1A Resolution)

### Design: Option D — Hide Shell, Keep Rendering Standalone-Style

When the shell deactivates:
1. Stop all capture sessions, restore all 2D windows to their original desktop positions
2. For each connected OpenXR app: restore HWND to visible + decorated, switch per-client compositor from "export" to "direct" mode
3. Multi-compositor stops rendering, releases shared DP
4. Shell window hides; shell process stays alive (system tray)

When the shell re-summons:
1. Each per-client compositor switches back to "export" mode
2. Multi-compositor resumes, imports textures, takes over DP
3. HWNDs go back to hidden/borderless
4. Layout restored from persistence JSON

### Tasks

| Task | Size | Repo | Description |
|------|------|------|-------------|
| 4C.1 | S | runtime | **`shell_deactivate` IPC** — Add to `proto.json` and `ipc_server_handler.c`. Handler calls into multi-compositor to begin teardown sequence. |
| 4C.2 | M | runtime | **Capture teardown + 2D window restore** — On deactivate: iterate all `CLIENT_TYPE_CAPTURE` slots, call `d3d11_capture_stop()`, call `SetWindowPlacement(saved_placement)` to restore each 2D window. Remove all capture virtual client slots. |
| 4C.3 | L | runtime | **OpenXR app hot-switch (direct/export mode toggle)** — Add `enum comp_output_mode { COMP_MODE_DIRECT, COMP_MODE_EXPORT }` to the per-client compositor. In `COMP_MODE_EXPORT` (shell active): compositor writes to shared texture for multi-comp. In `COMP_MODE_DIRECT` (shell inactive): compositor creates its own DP instance and presents to its own HWND. The mode switch is triggered by `shell_deactivate` / `shell_activate`. Compositor drains current frame, switches output path, continues. No OpenXR session teardown. |
| 4C.4 | M | runtime | **HWND restore for OpenXR apps** — On deactivate: restore each IPC app's HWND from hidden borderless (`WS_POPUP`) to visible decorated (`WS_OVERLAPPEDWINDOW`). Use saved placement from `oxr_session_create`. On re-activate: reverse the process (hide, make borderless). |
| 4C.5 | S | runtime | **Multi-compositor suspend/resume** — On deactivate: multi-comp stops its render loop, releases shared DP instance, hides shell window (`ShowWindow(SW_HIDE)`). On activate: recreate DP, restart render loop, show window. |
| 4C.6 | S | shell | **Shell-side deactivate flow** — In `main.c`: call `ipc_call_shell_deactivate()`, clear local capture tracking, stop adopt polling. On re-activate: re-enumerate windows, re-adopt, restore layout from persistence JSON. |

### Hot-Switch Detail (4C.3)

This is the hardest piece. Key considerations:

**Per-client compositor changes:**
```c
enum comp_output_mode {
    COMP_MODE_DIRECT,  // standalone: compositor → own DP → own HWND
    COMP_MODE_EXPORT,  // shell: compositor → shared texture → multi-comp
};
```

- When a client connects during shell mode → starts in `COMP_MODE_EXPORT`
- When a client connects outside shell mode → starts in `COMP_MODE_DIRECT` (normal standalone)
- `shell_deactivate` transitions all connected clients: EXPORT → DIRECT
- `shell_activate` transitions all connected clients: DIRECT → EXPORT

**DIRECT mode requirements:**
- Per-client compositor needs its own DP instance (display processor / weaver)
- Per-client HWND must be visible and correctly sized
- This is essentially what already happens in standalone (non-shell) mode — the per-client compositor path already works this way

**EXPORT mode requirements (already implemented):**
- Per-client compositor writes atlas to shared texture
- Multi-comp imports and blits to combined output
- Per-client HWND is hidden

**Simplification opportunity:** If `COMP_MODE_DIRECT` is too complex for the first pass, consider the simpler **SESSION_LOSS** approach: push `XR_SESSION_LOSS_PENDING` to each app on deactivate. Well-behaved apps will destroy and recreate their session, which naturally falls through to standalone mode. This is lossier (apps must handle session loss) but avoids the compositor mode toggle entirely.

### Deactivate Sequence (complete flow)

```
User presses ESC or Ctrl+Space
    │
    ├─ Shell calls ipc_call_shell_deactivate()
    │
    ├─ Server handler:
    │   ├─ 1. Stop all capture sessions (d3d11_capture_stop per slot)
    │   ├─ 2. Restore 2D windows (SetWindowPlacement per capture slot)
    │   ├─ 3. Remove all capture virtual client slots
    │   ├─ 4. For each IPC client:
    │   │   ├─ Switch comp_output_mode → COMP_MODE_DIRECT
    │   │   ├─ Client creates own DP instance
    │   │   ├─ Restore HWND (WS_OVERLAPPEDWINDOW + SetWindowPlacement)
    │   │   └─ Client compositor now presents to own HWND
    │   ├─ 5. Multi-comp stops rendering
    │   ├─ 6. Release shared DP
    │   └─ 7. Hide shell window (ShowWindow SW_HIDE)
    │
    └─ Shell stays alive in system tray (Phase 4C Part 2)
```

### Re-Activate Sequence

```
User presses Ctrl+Space (or Ctrl+Space again)
    │
    ├─ Shell calls ipc_call_shell_activate()
    │
    ├─ Server handler:
    │   ├─ 1. Show shell window (ShowWindow SW_SHOW)
    │   ├─ 2. Create shared DP
    │   ├─ 3. For each IPC client:
    │   │   ├─ Destroy per-client DP
    │   │   ├─ Hide + borderless HWND
    │   │   └─ Switch comp_output_mode → COMP_MODE_EXPORT
    │   └─ 4. Multi-comp starts rendering
    │
    ├─ Shell re-enumerates desktop windows
    ├─ Shell calls shell_add_capture_client() for each
    └─ Shell restores layout from persistence JSON
```

---

## Part 2: App Launcher & System Tray

### Tasks

| Task | Size | Repo | Description |
|------|------|------|-------------|
| 4C.7 | M | shell | **System-wide hotkey** — `RegisterHotKey(NULL, HOTKEY_ID, MOD_CONTROL, VK_SPACE)` in shell `main.c`. Message loop handles `WM_HOTKEY` to toggle between activate/deactivate. Works when shell is in background (system tray). |
| 4C.8 | S | shell | **System tray icon** — `Shell_NotifyIcon` with `NOTIFYICONDATA`. Tray icon shows when shell is minimized/deactivated. Left-click re-activates. Right-click shows context menu (Activate / Settings / Exit). |
| 4C.9 | M | shell | **Registered apps config** — JSON file `%LOCALAPPDATA%\DisplayXR\registered_apps.json`: `[{name, exe_path, type: "3d"|"2d"}]`. Pre-populated with demo apps on first run. Shell loads on startup. |
| 4C.10 | M | shell+runtime | **App launch from shell** — Shell receives a launch request (keyboard shortcut or future launcher panel), spawns the process. For "3d" apps: set `DISPLAYXR_SHELL_SESSION=1` + `XR_RUNTIME_JSON` env vars. For "2d" apps: launch normally, auto-capture via `shell_add_capture_client`. |
| 4C.11 | S | shell | **Auto-detect app type** — After launching an unknown app, wait up to 5 seconds. If the app connects via IPC (new client appears in `system_get_clients`), tag as 3D. Otherwise, tag as 2D and capture via HWND. |

### App Launcher UX (minimal viable version)

For the initial implementation, the launcher is **keyboard-driven**, not a spatial panel:

- `Ctrl+L` (while shell is active) opens a text prompt overlay at bottom of screen
- User types app name or path, Enter to launch
- Matches against registered apps first, falls back to raw path
- Launched app appears in next available slot with default pose

A full spatial launcher panel (grid of app tiles with icons) is deferred to Phase 5.

### System Tray Lifecycle

```
Shell starts
    │
    ├─ RegisterHotKey(Ctrl+Space)
    ├─ Create system tray icon (hidden)
    │
    ├─ If launched with apps/capture args:
    │   └─ Activate immediately (current behavior)
    ├─ Else:
    │   └─ Start in tray (deactivated), wait for Ctrl+Space
    │
    ├─ Ctrl+Space pressed:
    │   ├─ If deactivated → activate (enumerate, adopt, show shell window)
    │   └─ If activated → deactivate (restore windows, hide shell, show tray)
    │
    └─ Tray right-click → Exit:
        ├─ Deactivate if active
        ├─ UnregisterHotKey
        ├─ Shell_NotifyIcon(NIM_DELETE)
        └─ Process exits
```

---

## Implementation Order

```
4C.1 (shell_deactivate IPC) ──────────────────────┐
4C.2 (capture teardown + 2D restore) ── needs 4C.1 ┤
4C.5 (multi-comp suspend/resume) ─── needs 4C.1 ───┤
4C.4 (HWND restore for OpenXR) ──── needs 4C.5 ────┤
4C.3 (hot-switch direct/export) ─── needs 4C.4 ────┤──→ Integration test
                                                    │
4C.7 (system hotkey) ────────── independent ────────┤
4C.8 (system tray) ─────────── needs 4C.7 ─────────┤
4C.6 (shell-side deactivate) ── needs 4C.1+4C.7 ───┘
                                                    
4C.9 (registered apps config) ── independent ───────┐
4C.10 (app launch) ─────────── needs 4C.9 ──────────┤
4C.11 (auto-detect type) ──── needs 4C.10 ──────────┘
```

**Suggested order:**
1. 4C.1 → 4C.2 → 4C.5 (deactivate path, capture teardown, multi-comp suspend — testable: ESC restores 2D windows)
2. 4C.7 → 4C.8 (hotkey + tray — testable: Ctrl+Space toggles shell)
3. 4C.6 (wire up shell-side deactivate — testable: full toggle cycle)
4. 4C.4 → 4C.3 (OpenXR HWND restore + hot-switch — testable: OpenXR apps survive toggle)
5. 4C.9 → 4C.10 → 4C.11 (app launcher — testable: launch apps from within shell)

---

## IPC Additions

| IPC Call | Direction | Args | Returns | Description |
|----------|-----------|------|---------|-------------|
| `shell_deactivate` | shell → runtime | (none) | success/fail | Exit shell mode: teardown captures, restore windows, switch compositors to direct, suspend multi-comp |

Note: `shell_activate` already exists and will be extended to handle re-activation (re-adopt previously connected IPC clients into export mode).

---

## Test Procedure

### Graceful Exit (4C.1–4C.6)
```bash
# 1. Open Notepad, Calculator, and a DisplayXR cube app
# 2. Launch shell:
_package\bin\displayxr-shell.exe --capture-hwnd <notepad_hwnd> --capture-hwnd <calc_hwnd> ^
    test_apps\cube_handle_d3d11_win\build\cube_handle_d3d11_win.exe

# 3. Verify: all 3 windows appear in spatial layout
# 4. Press ESC (or Ctrl+Space when implemented)
# 5. Verify:
#    - Notepad and Calculator return to exact original desktop positions
#    - Cube app continues rendering in its own visible window (standalone mode)
#    - Shell window disappears
# 6. Press Ctrl+Space
# 7. Verify:
#    - All windows re-adopted into spatial layout
#    - Layout restored from persistence JSON
#    - Cube app re-enters shell mode (IPC export)
```

### System Tray (4C.7–4C.8)
```bash
# 1. Launch shell with no args:
_package\bin\displayxr-shell.exe
# 2. Verify: shell starts in system tray (no visible window)
# 3. Press Ctrl+Space
# 4. Verify: shell activates, adopts all desktop windows
# 5. Press Ctrl+Space
# 6. Verify: shell deactivates, windows restored, tray icon visible
# 7. Right-click tray icon → Exit
# 8. Verify: shell process exits cleanly
```

### App Launcher (4C.9–4C.11)
```bash
# 1. Activate shell (Ctrl+Space)
# 2. Press Ctrl+L
# 3. Type "cube_handle_d3d11_win" + Enter
# 4. Verify: cube app launches in shell mode (3D)
# 5. Press Ctrl+L
# 6. Type "notepad" + Enter
# 7. Verify: Notepad launches, auto-captured as 2D panel after 5s timeout
```

---

## Key Files to Modify

| File | Changes |
|------|---------|
| `src/xrt/ipc/shared/proto.json` | Add `shell_deactivate` |
| `src/xrt/ipc/server/ipc_server_handler.c` | Add `ipc_handle_shell_deactivate`, extend `ipc_handle_shell_activate` for re-activation |
| `src/xrt/compositor/d3d11_service/comp_d3d11_service.cpp` | Multi-comp suspend/resume, capture teardown, `comp_output_mode` |
| `src/xrt/compositor/d3d11_service/comp_d3d11_service.h` | Export deactivate API |
| `src/xrt/compositor/d3d11/comp_d3d11_compositor.cpp` | Per-client direct/export mode toggle, per-client DP lifecycle |
| `src/xrt/compositor/d3d11/comp_d3d11_window.cpp` | HWND show/hide/style toggle |
| `src/xrt/targets/shell/main.c` | `RegisterHotKey`, system tray, deactivate flow, app launcher, registered apps |

---

## What NOT to Change

- Display processor / weaver internals — DP is a black box, just create/destroy instances
- OpenXR state tracker session lifecycle — apps see no session state changes during hot-switch
- IPC client compositor transport — shared textures and IPC pipes stay alive during toggle
- Capture API internals — `d3d11_capture.cpp` is stable, just call start/stop
- Existing standalone (non-shell) app behavior — must remain untouched
