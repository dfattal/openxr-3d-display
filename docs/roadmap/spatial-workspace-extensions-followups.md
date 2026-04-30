# Workspace-Extensions Follow-ups (post 2.D + 2.I)

Outstanding items left over from the Phase 2.D + 2.I + decoupling work. Each item names a suggested phase to fold the fix into, but agents picking up later phases should re-evaluate scope.

## Functional gaps

### 1. Pointer-capture flag stored but not enforced ✅ shipped (2.G C1)

**Resolution:** Folded into Phase 2.G Commit 1. The WM_*BUTTONUP path in `src/xrt/compositor/d3d11/comp_d3d11_window.cpp` now reads `workspace_pointer_capture_enabled` + `workspace_pointer_capture_button` and bypasses the in-rect / dragging gate when capture is held for the matching button. Controller-driven drag affordances keep receiving the release event when the cursor leaves the content rect.

**Limitation:** if the cursor leaves the workspace window entirely (no SetCapture is in flight), Windows routes the up event to whichever window the cursor is over — the WndProc never sees it. Fixing that needs `SetCapture` plumbing on enable / `ReleaseCapture` on disable, which Commit 1 deliberately did not add. File a follow-up if controller drags past the window border start losing release events.

### 2. Per-frame motion events on the public input drain

**State:** `XR_WORKSPACE_INPUT_EVENT_POINTER_HOVER_EXT` enum value, `XrWorkspaceInputEventEXT.pointerHover` struct variant, and the matching wire-format `ipc_workspace_input_event::u.pointer_hover` are all defined and ship in v4 — but **nothing pushes them**, and per Phase 2.D's design `xrEnumerateWorkspaceInputEventsEXT` only delivers POINTER button-down / button-up events, **not** per-frame `WM_MOUSEMOVE`. The WndProc explicitly skips MOUSEMOVE before pushing to the public ring (`comp_d3d11_window.cpp` ~line 685).

**Why it matters:** A workspace controller cannot replicate the runtime's old interactive layouts (carousel drag-to-rotate, scroll-radius, drag-to-resize, hover-driven chrome highlighting) without per-frame cursor information. The controller has to own those behaviors per the Phase 2.G architectural call ("controllers own all motion logic; runtime is plumbing"), which means the public surface has to deliver motion.

**Where to fix:** Promoted to its own sub-phase — **Phase 2.K — controller-owned interactive layouts**. See `spatial-workspace-extensions-phase2K-plan.md`. The work:
- Push `WM_MOUSEMOVE` cursor positions into the public input ring (gated on a button being held, or always — a controller flag picks). Probably the simplest path is to deliver them whenever any mouse button is held, since the carousel / drag use cases all need that and idle motion would flood IPC.
- Optionally: emit a HOVER variant when the cursor crosses a region boundary (the original design intent of `pointerHover`), to give chrome highlighting cheap fidelity without per-frame drain.
- Restore the carousel, scroll-radius, drag, momentum, TAB-snap behaviours **in the shell**, not the runtime — Phase 2.G deleted them from the runtime in favour of the public surface.

**Suggested phase:** Phase 2.K — must land before Phase 2.C (chrome rendering needs hover too).

### 3. Shell activate-failure no longer auto-reconnects

**State:** Before Phase 2.I C10 the shell maintained its own IPC connection and could tear it down + recreate it when activate failed (service died). After C10 the shell has no IPC connection of its own — the runtime DLL holds it. Activate failure now just bails with a "restart the service and press Ctrl+Space" message.

**Why it matters:** A service crash is recoverable today only by exiting and re-launching the shell. Less polished than the pre-migration UX.

**Where to fix:** Shell-side. The reconnect path now requires `xrDestroySession` + `xrCreateSession` (and probably `xrDestroyInstance` + `xrCreateInstance` since the runtime DLL holds connection state on the instance, not the session). Wrap the existing activate-failure path with that recreate logic.

**Suggested phase:** Phase 2.J (shell repo extraction) — the cleanup naturally happens when the shell is its own repo and can iterate freely. Until then, it's a known UX regression.

### 4. `XRT_FORCE_MODE=ipc` shell workaround

**State:** `shell_openxr.cpp::shell_openxr_init` calls `SetEnvironmentVariableA("XRT_FORCE_MODE", "ipc")` before `xrCreateInstance`. This forces the DisplayXR hybrid runtime to pick the IPC client compositor over the in-process native one. **It's runtime-specific** — a workspace controller running against any other OpenXR runtime wouldn't need it (and wouldn't have an `XRT_FORCE_MODE` env var to set).

**Why it matters:** Once the shell forks to its own repo, this hack is awkward — the shell is supposed to be runtime-agnostic. The cleaner solution is for the runtime to detect a workspace-controller session and pick IPC mode automatically (e.g., when `XR_EXT_spatial_workspace` is in the enabled extension list).

**Where to fix:** `src/xrt/auxiliary/util/u_sandbox.c::u_sandbox_should_use_ipc` — add a check: if the calling instance has `XR_EXT_spatial_workspace` enabled, return `true`. Or hand the decision to `xrt_instance_create` based on the createInfo's enabled-extension list (cleaner but requires more plumbing).

**Suggested phase:** Phase 2.J prequel (before extracting the shell) — once fixed, the shell drops the SetEnvironmentVariableA call and is genuinely runtime-agnostic.

## Repo-extraction residue

These three documented spots in the runtime still mention the shell app by name. They were intentionally left during the Phase 2.I-followup decoupling because the shell directory hasn't physically moved yet. They go away in Phase 2.J.

### 5. `targets/CMakeLists.txt` `add_subdirectory(shell)`

**State:** A comment marks it as the "legacy name" with a TODO to remove when the binary moves. The line itself stays as long as `src/xrt/targets/shell/` exists in this repo.

**Where to fix:** Phase 2.J commit that removes `src/xrt/targets/shell/` entirely.

### 6. `service_config.c` default binary literal `"displayxr-shell.exe"`

**State:** The orchestrator uses this string as the default binary to spawn when no config exists. Once the shell ships from a separate repo, this default either:
- Becomes config-only (no compiled-in default).
- Updates to whatever name the new repo's binary uses.
- Drops to NULL and the orchestrator simply doesn't auto-spawn.

**Where to fix:** Phase 2.J. The decision is partly product (do we want auto-spawn out of the box?).

### 7. Two transitional comments documenting the removed legacy `shell` JSON key

**State:** `src/xrt/targets/service/service_config.c:181` and `src/xrt/targets/service/service_config.h:37` have one-line comments noting that the legacy `"shell"` JSON key was removed in Phase 2.I-followup decoupling. Kept for users discovering the breaking change.

**Where to fix:** Delete after the migration window settles (~3 months post-2.I publication). Tiny commit, can ride with any other cleanup.

## Suggested integration

| Phase | Folds in items |
|---|---|
| **2.G** | ~~#1 (pointer-capture enforcement)~~ ✅ shipped |
| **2.K** | #2 (per-frame motion events + interactive carousel / drag in the shell) |
| **2.J prequel** | #4 (XRT_FORCE_MODE workaround) |
| **2.J** | #3, #5, #6 (shell extraction, residues) |
| **(any time)** | #7 (transitional comments) |

If you're picking up a phase listed above, check this doc and decide whether to fold the relevant item in or defer further. Update this doc when an item lands so the list stays current.
