# MCP Phase B — Shell / Service Mode Plan

**Status:** Proposal (Phase A landed in PR #155; Phase B sequenced next.)
**Branch (proposed):** `feature/mcp-phase-b`
**Worktree (proposed):** `.claude/worktrees/mcp-phase-b`
**Spec:** `docs/roadmap/mcp-spec-v0.2.md` §3.2, §4.B
**Target:** the "Set me up for the 3pm review" user story — an agent arranges spatial-shell windows, switches workspaces, and triggers a recording, all over MCP.

## Goal

Add the second tool surface from the v0.2 spec: window management, workspaces, focus, recording, and a multi-window `capture_frame`. Reuse the Phase A `displayxr-mcp` adapter and `u_mcp_*` infra; add a service-mode server alongside the existing handle-app one. Keep the production service lean — MCP server is opt-in, sandboxable, killable without disturbing apps.

## Scope (exactly this)

### Tools (in addition to Phase A's eight)

| Tool | Action | IPC backing |
|---|---|---|
| `list_windows` | Per-window `{id, title, pose, size_m, focused, visible, app_pid}` | `shell_get_window_pose` (extended for enumeration) |
| `get_window_pose` | 6-DOF pose + size in meters for a single window | `shell_get_window_pose` |
| `set_window_pose` | Move / resize one window | `shell_set_window_pose` |
| `set_focus` | Bring a window to front and raise its OS focus | New `shell_focus_window` IPC |
| `apply_layout_preset` | Trigger Ctrl+1..4 layout | Existing layout-preset IPC |
| `save_workspace` | Capture all current `(id, pose, size)` to a named JSON | New — pure file-side, no IPC |
| `load_workspace` | Apply a saved set of poses by name | Loops `set_window_pose` |
| `start_recording` | Begin SBS atlas → MP4 to a path | Per `docs/roadmap/3d-capture.md` recording API |
| `stop_recording` | Finalize the MP4 | Same |
| `capture_frame` (Phase B variant) | Atlas PNG + per-window bounding-box JSON | shell-phase8's `comp_d3d11_service_capture_frame()` (already lands per #43) + window-bound annotation |

`list_sessions` from Phase A automatically extends to multi-app once the service exposes them — no rewrite needed, just a code path that walks active IPC clients instead of returning the single attached session.

### Out of scope for Phase B

- HTTP/SSE remote transport — stdio-local stays the default. (Phase C-ish.)
- Biometric / viewer-pose tools — privacy-gated, separate proposal.
- App-side spatial UI primitives — that's the shell SDK story, not MCP's.
- Cross-machine multi-display — see `docs/roadmap/multi-display-networked.md`.

## Architecture

```
Claude Code (MCP client)
    ↕ stdio (JSON-RPC 2.0, Content-Length frames)  ← unchanged from Phase A
displayxr-mcp adapter
    ↕ unix socket / named pipe                     ← unchanged from Phase A
       │
       ├─ handle-app session (Phase A) — in-process server inside libopenxr_displayxr
       │
       └─ service session (Phase B) — server inside displayxr-service,
          binding `\\.\pipe\displayxr-mcp-service` (Win) or
          `/tmp/displayxr-mcp-service.sock` (mac).
          Tools call shell IPC (existing `ipc_call_*` API).
```

The adapter keeps its `--pid auto | --pid N | --list` UX. A new `--service` mode targets the well-known service socket.

### Why a separate service-mode server (vs. extending the handle-app one)

- **Lifecycle:** the handle-app server lives inside an OpenXR session and dies when the app exits. The service is long-lived; tools like `list_windows` outlive any single app.
- **Scope:** service-mode tools cross apps and need shell ownership. The handle-app server has no shell IPC binding (and shouldn't get one — that would invert the Phase A handle-app guarantee).
- **Same code, different wiring:** `u_mcp_server`, `u_mcp_transport`, `u_mcp_log_ring` are reusable as-is. Only the tool *registrations* differ.

## Source tree additions

```
src/xrt/
├── ipc/server/
│   └── ipc_server_mcp.{c,h}              # service-mode MCP host
├── ipc/shared/proto.json                 # +shell_focus_window, +list_windows op
├── targets/service/
│   └── displayxr_service_main.c          # spin up u_mcp_server when DISPLAYXR_MCP=1
└── targets/mcp_adapter/
    └── displayxr_mcp.c                   # +`--service` mode flag
```

The `oxr_mcp_tools.c` from Phase A is reused via static link; service-mode adds its own tool table in `ipc_server_mcp.c` for shell-IPC-backed handlers.

## Delivery slices

Each slice = one commit, lands incrementally on `feature/mcp-phase-b`. Mirrors Phase A's slicing.

1. **Service-mode plumbing.** `ipc_server_mcp.{c,h}`. Service spawns `u_mcp_server` on a well-known socket when `DISPLAYXR_MCP=1`. `displayxr-mcp --service` connects to it. `echo` round-trip works. *Test: `tests/mcp/test_service_handshake.sh`.*
2. **Multi-session `list_sessions`.** Service-mode iterates active IPC clients, returns one entry per app. Handle-app mode unchanged.
3. **Window query tools.** `list_windows`, `get_window_pose`. Wraps existing `shell_get_window_pose` IPC; adds enumeration on the IPC server side.
4. **Window mutation tools.** `set_window_pose`, `set_focus`. New IPC op `shell_focus_window` (or reuse hotkey path).
5. **Layout presets + workspaces.** `apply_layout_preset` (existing hotkey IPC), `save_workspace` / `load_workspace` (JSON in `%APPDATA%/DisplayXR/workspaces/`).
6. **Recording.** `start_recording` / `stop_recording`. Wraps the recording surface from `docs/roadmap/3d-capture.md` once it lands; if recording isn't there yet, slice 6 stubs with an `error` and tracks via a follow-up issue.
7. **Phase B `capture_frame`.** Atlas PNG (uses shell-phase8's existing service-side path) plus a `windows[]` array of `{id, bounds_pixels}` so an agent can crop per-window.

## Validation

- Each slice's test under `tests/mcp/` (mirrors Phase A).
- End-to-end: `tests/mcp/demo_studio.sh` — drives the spec §2.2 user story:
  1. Start service + shell + two cube_handle apps.
  2. `list_windows` → expect 2 entries.
  3. `set_window_pose` to a "presentation" layout (left/right halves).
  4. `apply_layout_preset` to one of Ctrl+1..4.
  5. `start_recording` → wait 5 s → `stop_recording` → assert MP4 exists, > 1 MB, plays.
  6. `capture_frame` → assert PNG + windows[] array of length 2.

## Cross-cutting concerns

- **CI cost.** Phase A's pattern (run `scripts/build-mingw-check.sh` locally before pushing, branch ends in non-`-ci` to avoid push triggers; PR triggers still fire). Same applies here. Document any new MSVC-specific shims in CLAUDE.md.
- **Layer rules** (`docs/architecture/separation-of-concerns.md`). Service-mode MCP code lives in `ipc/server/`. It calls existing `ipc_*` APIs; it doesn't reach into `oxr` or `compositor` directly.
- **Shell-phase8 dependency.** Slice 7 (`capture_frame` Phase B variant) blocks on shell-phase8's `comp_d3d11_service_capture_frame()` landing on main. Sequence accordingly.
- **Privacy gate.** Recording / capture tools should respect a per-app opt-out flag once one exists (see `spatial-desktop-prd.md`). Stub the gate now even if it always returns "allowed".

## Open questions

- **`shell_focus_window` IPC op** — does an existing call cover it (e.g. via the launcher) or do we need a new opcode? Check `src/xrt/ipc/shared/proto.json` first.
- **Workspace persistence location** — `%APPDATA%/DisplayXR/workspaces/` (Win) and `~/Library/Application Support/DisplayXR/workspaces/` (mac). Confirm the shell already has a settings-dir helper.
- **Recording API surface** — `docs/roadmap/3d-capture.md` (status: Proposal at the time of Phase A). If still proposal, slice 6 stubs.

## References

- Spec: `docs/roadmap/mcp-spec-v0.2.md`
- Phase A landed: PR #155 (commits squashed into main as of 2026-04-15)
- Phase A status: `docs/roadmap/mcp-phase-a-status.md`
- Shell IPC contract: `docs/roadmap/shell-runtime-contract.md`
- 3D capture: `docs/roadmap/3d-capture.md`
- Spatial OS / shell: `docs/roadmap/spatial-os.md`, `docs/roadmap/3d-shell.md`
