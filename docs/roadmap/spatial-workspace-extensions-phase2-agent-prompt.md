# Phase 2.0 Agent Prompt — Workspace Detection + Auth Handshake

Self-contained prompt for a fresh agent session implementing Phase 2.0 of the workspace-extensions effort. Drop this into a new session as the user message after a `/clear`, or use it as a `Task` agent prompt. The agent has no memory of the design conversations — this prompt assumes nothing.

---

## Background you need before touching code

You're picking up Phase 2.0 of the **DisplayXR shell brand separation** effort. Phase 1 finished and merged: a boundary rename so the runtime no longer reads like an SDK for one specific proprietary application. Phase 2.0 is the architectural prep that makes the runtime a *standalone platform* — installable without the proprietary DisplayXR Shell, useful on its own as an OpenXR runtime + WebXR bridge, with the shell adding spatial-desktop features as a separate optional product.

**Read these docs FIRST, in this order, before writing any code:**

1. `docs/roadmap/spatial-workspace-extensions-plan.md` — the master three-phase plan. You're implementing Phase 2.0.
2. `docs/roadmap/spatial-workspace-controller-detection.md` — half of Phase 2.0. The conditional tray UI + sidecar `.controller.json` manifest model.
3. `docs/roadmap/spatial-workspace-auth-handshake.md` — other half of Phase 2.0. Orchestrator-PID match replaces the brand-coupled `application_name == "displayxr-shell"` check.
4. `docs/roadmap/spatial-workspace-extensions-headers-draft.md` — Phase 2.A-onwards extension surfaces. **Reference only — do NOT implement these in Phase 2.0.** The sketch tells you where Phase 2.A picks up after Phase 2.0 lands.
5. `docs/roadmap/spatial-workspace-extensions-phase2-audit.md` — labels every remaining `shell_*` mention in `comp_d3d11_service.cpp` as mechanism / policy / gone. Phase 2.0 doesn't touch this file; the audit is for the migrations after you.

Also pull up `MEMORY.md` and read `project_shell_brand_separation.md` + `reference_workspace_terminology.md` + `feedback_perl_rename_gotchas.md`.

## What Phase 2.0 changes — and what it does NOT

**You touch:**
- `src/xrt/targets/service/service_orchestrator.{c,h}` — add detection state, manifest reader integration, getters, hotkey gating, PID accessor.
- `src/xrt/targets/service/service_workspace_manifest.{c,h}` — **new file** — JSON parser for the `<binary>.controller.json` sidecar.
- `src/xrt/targets/service/service_tray_win.c` — conditional Workspace submenu, dynamic display-name label.
- `src/xrt/ipc/server/ipc_server_handler.c` — wire PID-match auth into `ipc_handle_workspace_activate`; replace the literal `"displayxr-shell"` `application_name` match in the qwerty-routing logic at line ~296.
- `src/xrt/targets/service/CMakeLists.txt` — register the new manifest file.

**You do NOT touch:**
- `src/xrt/compositor/d3d11_service/comp_d3d11_service.cpp` — 162 internal `shell_*` mentions stay as-is. Phase 2.A onwards handles those.
- `src/xrt/compositor/d3d11/comp_d3d11_window.{cpp,h}` — `shell_mode_active`, `set_shell_mode_active`, `set_shell_dp`, `shell_input_event`, `SHELL_INPUT_RING_SIZE` all stay. Phase 2.D / 2.E touches them.
- Any IPC RPC names. Phase 1 finalized them; Phase 2.0 just adds a check inside one existing handler.
- Anything in `proto.json` or `proto.py`.
- The `XR_EXT_spatial_workspace.h` / `XR_EXT_app_launcher.h` extension headers don't exist yet and aren't part of Phase 2.0. Don't write them.
- The extension dispatch table in `xrGetInstanceProcAddr`. Phase 2.A onwards.
- `src/xrt/targets/shell/` — the shell binary. Manifest deployment is the shell's responsibility (the shell installer drops `displayxr-shell.controller.json` next to its binary at install time). For Phase 2.0 you create the manifest in `_package/` for testing, but the shell installer change is a separate Leia-side task.
- `src/xrt/targets/webxr_bridge/main.cpp` — its "shell mode" / "WebXR-in-shell" terminology refers to a named feature, not the boundary concept. Skip per the explicit note in `d4ebf84bd`.

## Recommended commit sequence

Five commits. Don't combine — keep them reviewable in isolation.

### Commit 1 — `service_workspace_manifest.{c,h}` (pure addition)

New file. JSON parser via cJSON (already linked, see `service_config.c` for the include pattern). Schema per `spatial-workspace-controller-detection.md`:

```c
struct workspace_manifest {
    char display_name[256];
    char vendor[64];
    char version[32];
    char icon_path[260];
};

// Reads <binary path with .exe stripped>.controller.json next to the binary.
// Returns true on success (manifest found, parsed, schema_version==1).
// On false, *out is zeroed — caller should fall back to defaults.
bool
service_workspace_manifest_load(const char *workspace_binary_path,
                                struct workspace_manifest *out);
```

Implementation tips:
- File-existence check first; don't bother parsing if absent.
- Length-cap reads (`snprintf`) to prevent overflow. The struct sizes are limits.
- `schema_version` MUST equal 1; reject anything else with a one-line warn log.
- Empty/missing optional fields → empty strings (the caller defaults).
- Look at `service_config.c::config_path` and `read_file` for the I/O patterns to follow.

CMakeLists.txt change: add `service_workspace_manifest.c` to the `displayxr-service` target's source list. Keep the new `.h` next to it.

### Commit 2 — Detection + conditional tray + hotkey gating

In `service_orchestrator.{h,c}`:

```c
// New static state
static bool s_workspace_available = false;
static struct workspace_manifest s_workspace_manifest = {0};

// New init helper, called from service_orchestrator_init BEFORE apply_workspace_mode.
static void
detect_workspace_controller(const struct service_config *cfg)
{
    char workspace_path[MAX_PATH];
    if (!sibling_exe_path(cfg->workspace_binary, workspace_path, sizeof(workspace_path))) {
        s_workspace_available = false;
        return;
    }
    if (!file_exists(workspace_path)) {
        s_workspace_available = false;
        OW("Workspace controller not installed (looked for %s)", workspace_path);
        return;
    }
    s_workspace_available = true;
    if (!service_workspace_manifest_load(workspace_path, &s_workspace_manifest)) {
        // Fallback display name when manifest absent / malformed.
        snprintf(s_workspace_manifest.display_name,
                 sizeof(s_workspace_manifest.display_name),
                 "Workspace Controller");
    }
    OW("Workspace controller detected: %s (binary=%s)",
       s_workspace_manifest.display_name, workspace_path);
}

// New public API
bool
service_orchestrator_is_workspace_available(void)
{
    return s_workspace_available;
}

const char *
service_orchestrator_get_workspace_display_name(void)
{
    return s_workspace_manifest.display_name;
}
```

`apply_workspace_mode`: short-circuit when `!s_workspace_available`. Don't register the keyboard hook, don't try to spawn. Log once at startup.

`spawn_workspace`: existing code already file-checks via `sibling_exe_path` failure — but with `s_workspace_available` available, you can early-return without the call.

In `service_tray_win.c`: at the menu-build site (currently around line 117 where the Workspace submenu is appended), wrap in `if (service_orchestrator_is_workspace_available()) { ... }`. Use `service_orchestrator_get_workspace_display_name()` for the parent menu label instead of the hardcoded `L"Workspace Controller"` from commit `4cf3ba93d`. Convert UTF-8 → wide via `MultiByteToWideChar(CP_UTF8, 0, name, -1, wbuf, ARRAYSIZE(wbuf))`.

Test before the next commit:
- `_package/bin/displayxr-shell.exe` present + no manifest → tray says "Workspace Controller".
- Manifest with `display_name: "DisplayXR Shell"` → tray says "DisplayXR Shell".
- Delete `displayxr-shell.exe` (or rename), restart service → tray has no Workspace submenu, Ctrl+Space does nothing.

### Commit 3 — Add `service_orchestrator_get_workspace_pid()` (pure addition)

```c
// In service_orchestrator.h:
unsigned long
service_orchestrator_get_workspace_pid(void);

// In service_orchestrator.c:
unsigned long
service_orchestrator_get_workspace_pid(void)
{
#ifdef XRT_OS_WINDOWS
    if (s_workspace_running) {
        return (unsigned long)s_workspace_pi.dwProcessId;
    }
#endif
    return 0;
}
```

Returns 0 if no workspace was orchestrator-spawned (manual mode, or none running). Use `unsigned long` not `DWORD` so the header doesn't need `<windows.h>` — matches the cross-platform discipline elsewhere in `aux/util/`. No callers in this commit; the next one wires it.

### Commit 4 — Wire PID auth into workspace_activate (keeps application_name fallback)

In `ipc_server_handler.c::ipc_handle_workspace_activate`, before the existing "already in workspace mode" check, add:

```c
unsigned long expected_pid = service_orchestrator_get_workspace_pid();
unsigned long caller_pid   = (unsigned long)_ics->client_state.pid;

if (expected_pid != 0) {
    // Service-managed mode: orchestrator spawned a known PID; only that PID may activate.
    if (caller_pid != expected_pid) {
        // BUT keep the legacy application_name match as a fallback for one release,
        // so existing setups (where the shell connects before service rev N+1 is rolled out)
        // don't break mid-upgrade.
        bool legacy_match =
            ics->client_state.info.application_name[0] != '\0' &&
            strcmp((const char *)ics->client_state.info.application_name, "displayxr-shell") == 0;
        if (!legacy_match) {
            IPC_WARN(s, "workspace_activate: PID mismatch (caller=%lu, expected=%lu) — denied",
                     caller_pid, expected_pid);
            return XRT_ERROR_NOT_AUTHORIZED;
        }
        IPC_WARN(s, "workspace_activate: PID mismatch but legacy application_name match accepted (deprecated)");
    }
}
// expected_pid == 0 → manual mode, first-claim wins. Continue.
```

Verify `_ics->client_state.pid` is populated. If not, plumb it through from the IPC connection setup (Windows: `GetNamedPipeClientProcessId`).

`XRT_ERROR_NOT_AUTHORIZED` may not exist as an `xrt_result_t` value yet — add it to the enum if missing (it's a reasonable runtime error code for this case). The user-facing OpenXR error code is `XR_ERROR_FEATURE_UNSUPPORTED`; the `xrt_result_t` is internal.

### Commit 5 — Remove application_name fallback + replace `is_workspace_controller_session` literal match

Drop the `legacy_match` fallback added in commit 4. Workspace activation now strictly requires PID match (or manual mode).

Then update `ipc_server_handler.c:294-296` (the qwerty-routing logic):

```c
unsigned long workspace_pid = service_orchestrator_get_workspace_pid();
bool is_workspace_controller_session =
    workspace_pid != 0 &&
    (unsigned long)ics->client_state.pid == workspace_pid;
```

Remove the `strcmp((const char *)ics->client_state.info.application_name, "displayxr-shell")`. **This is the last literal `"displayxr-shell"` reference in the runtime code** (the only remaining occurrence of `"displayxr-shell"` after this commit is the *default value* of `cfg.workspace_binary` — that's correct since OEMs override via `service.json`).

After this commit, `grep -rn '"displayxr-shell"' src/` should show one match (the config default in `service_config.c`) and zero in any other context.

## Constraints from the user's preferences

- **Branch naming**: do work in `.claude/worktrees/shell-brand-separation-phase2/` on branch `feature/shell-brand-separation-phase2` (NO `-ci` suffix — pushing should not trigger CI per the user's repeated guidance). When ready to validate, rename branch to add `-ci`, push, watch via `/ci-monitor`, rename back.
- **Worktree**: use `git worktree add` from the runtime-pvt root.
- **Commits**: include issue number in commit message if you can identify one from `gh issue list` or context. Otherwise omit.
- **MinGW pre-check**: run `./scripts/build-mingw-check.sh` locally before any CI push. Note that MinGW disables `XRT_MODULE_IPC` and `XRT_MODULE_COMPOSITOR` so it WON'T compile the IPC handler or orchestrator — the check covers `aux_util` and `mcp_adapter` only. CI is the canonical check.
- **Don't touch the shell repo** (still in `targets/shell/` of this repo). Manifest deployment is a future shell-installer change — for testing, drop a manifest manually into `_package/bin/`.

## How to test (the user will run on their Windows box; you set up the cases)

Document in your Phase 2.0 commit messages how to test. Recommended scenarios:

1. **Bare runtime (no shell)**: rename `_package/bin/displayxr-shell.exe` → `_displayxr-shell.exe.bak`. Start service. Tray right-click → no Workspace submenu, only Bridge + Start-on-login + Quit. `Ctrl+Space` does nothing.

2. **Shell present, no manifest**: Restore `displayxr-shell.exe`. Ensure no `displayxr-shell.controller.json` exists. Start service. Tray shows "Workspace Controller" submenu. Ctrl+Space launches the shell.

3. **Shell + manifest**: Drop a `displayxr-shell.controller.json` next to the exe with:
   ```json
   {
     "schema_version": 1,
     "display_name": "DisplayXR Shell",
     "vendor": "Leia Inc.",
     "version": "1.0.0"
   }
   ```
   Restart service. Tray shows "DisplayXR Shell" submenu. Lifecycle (Enable/Auto/Disable) works.

4. **PID auth — happy path**: With service running and shell auto-spawned, shell calls `workspace_activate` and gets `XR_SUCCESS`. Open multiple test apps; they get composited.

5. **PID auth — forged claim**: Build a tiny test program (or modify a cube test app) that sets `applicationName = "displayxr-shell"` in `XrApplicationInfo` and calls into the runtime trying to activate workspace mode. Verify it gets `XR_ERROR_FEATURE_UNSUPPORTED` after commit 5 (and gets a deprecation warning between commits 4 and 5).

6. **service.json backwards-compat**: Create a service.json with the legacy `"shell"` key (no `"workspace"` key). Restart service. Verify orchestrator reads the value correctly. (This was Phase 1 work — verify Phase 2.0 didn't regress it.)

7. **Manual mode**: Start service with `--workspace`. Don't let orchestrator spawn anything. Manually launch shell. Verify it activates (first-claim-wins). This is the developer flow.

## Success criteria for this Phase 2.0 session

- 5 commits land cleanly on the branch.
- Local MinGW check passes (won't catch much; IPC/orchestrator not in scope).
- Windows CI passes after the rename trick.
- All 7 test scenarios pass on the user's Windows box.
- `grep -rn '"displayxr-shell"' src/` shows exactly one occurrence after commit 5: the `service_config.c` default. **This is the final brand-decoupling milestone for the runtime.**
- A short paragraph in your final commit message explains what the next session (Phase 2.A — capture client lifecycle) inherits.

## What "done" looks like

After Phase 2.0:
- The runtime is a real platform: a developer / OEM can build the runtime + service + bridge, install it, and have a working DisplayXR experience for any OpenXR app + Chrome WebXR — with **no shell or workspace controller installed at all**. Tray UI honestly reflects this.
- Installing the DisplayXR Shell adds a branded Workspace submenu and lifecycle controls.
- Installing a different controller (third-party, OEM, vertical) gets the same first-class treatment via its own manifest.
- The runtime grants workspace activation to whoever the orchestrator spawned, regardless of the binary's `applicationName`. No brand coupling.

That unblocks the Phase 2.A-2.H code migrations (described in the audit doc) — those move launcher / chrome / capture / hit-test policy into the workspace controller process behind the as-yet-unwritten `XR_EXT_spatial_workspace.h` / `XR_EXT_app_launcher.h` extensions. But Phase 2.0 itself doesn't write any extensions — it's pure orchestrator + tray + IPC-handler work, and it's the prerequisite for everything else.

## If you get stuck

- The auth handshake doc has explicit code sketches for the orchestrator getter and the activate-handler check.
- The detection doc has the manifest schema and the menu shape diagrams.
- The audit doc tells you what NOT to touch (everything in `comp_d3d11_service.cpp`).
- `feedback_perl_rename_gotchas.md` in memory captures lessons from Phase 1 — read it if you find yourself doing perl renames.
- The user is available for design questions but is not blocking on this work — they expect you to make judgment calls when the docs are ambiguous, then call out the choice in your commit message.

Stop and ask the user before:
- Adding new IPC RPCs (Phase 2.A onwards).
- Touching `comp_d3d11_service.cpp` for any reason.
- Designing the actual extension headers (Phase 2.A onwards needs them; Phase 2.0 doesn't).
- Modifying the launcher's `.displayxr.json` app-manifest format (different concept; don't conflate).
