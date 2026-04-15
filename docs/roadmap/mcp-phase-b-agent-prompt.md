# Agent Prompt — MCP Phase B Implementation

You are picking up MCP Phase B (shell/service mode tools) on a fresh branch `feature/mcp-phase-b`, worktree `.claude/worktrees/mcp-phase-b`. Phase A landed in PR #155 (closed/merged 2026-04-15) and is the foundation you build on.

## Context you need before touching code

Read in this order:

1. `docs/roadmap/mcp-spec-v0.2.md` — full v0.2 spec. **§3.2** (shell/service architecture), **§4.B** (Phase B tool list), **§5** (safety model) are authoritative.
2. `docs/roadmap/mcp-phase-b-plan.md` — this plan. Follow the slice sequence; don't merge slices.
3. `docs/roadmap/mcp-phase-a-status.md` — what already exists. **Do not duplicate Phase A's plumbing — reuse `u_mcp_server`, `u_mcp_transport`, `u_mcp_log_ring`, `u_mcp_capture`.**
4. `docs/roadmap/shell-runtime-contract.md` — IPC ops you'll wrap. Note which are "Implemented" vs "Phase 4D" vs future.
5. `CLAUDE.md` — repo conventions. Relevant updates from Phase A:
   - **MinGW cross-check** (`scripts/build-mingw-check.sh`) — run before pushing; mind the MinGW-vs-MSVC delta documented in CLAUDE.md.
   - **Branch naming** — drop the `-ci` suffix on iteration branches; CI still fires on PR open. Close PR if you need to iterate without CI burn.
   - Issue refs in every commit, worktree rule, MSVC shims (`os_monotonic_get_ns`, `_strnicmp`, `long` for pids, `pthread_mutex_t` instead of `_Atomic`).
6. `docs/architecture/separation-of-concerns.md` — service-mode MCP code lives in `ipc/server/`, calls `ipc_*` APIs, doesn't reach into `oxr` or `compositor` directly.
7. `src/xrt/auxiliary/util/u_mcp_server.{h,c}` — the existing server you're reusing. Note the `u_mcp_tool` registration API.
8. `src/xrt/ipc/server/ipc_server_handler.c` — pattern for adding new IPC ops.

## Operating mode

- **Primary platform: Windows.** This is a service-mode feature; the service is much more developed on Windows. Iterate with `scripts\build_windows.bat build` on a Leia SR machine if available, otherwise unit-test what you can on mac.
- **MinGW pre-flight on every push.** `./scripts/build-mingw-check.sh` catches the easy stuff in ~30 s. Don't push without running it.
- **CI is on PR-event triggers.** If you want to iterate without burning CI, close PR until ready.
- **One slice per commit.** Each slice in the plan is its own atomic commit.
- **Commit messages must include `(#XXX)`** — open or find a Phase B tracking issue before first commit.

## Invariants you must preserve

- **Service still works with `DISPLAYXR_MCP` unset.** Like Phase A: no socket bind, no extra threads, zero cost when off.
- **MCP server doesn't crash the service.** Tool handlers must catch their own errors; a malformed JSON-RPC request should return a JSON-RPC error, never tear down the service.
- **No new privileged surface.** All Phase B tools route through existing `ipc_call_*` APIs that the shell already trusts. If a tool needs something the shell doesn't already do, propose a new IPC op explicitly — don't sneak it in.
- **No biometric / viewer-pose data.** Spec §5 is explicit: those are deferred behind a separate privacy-gated proposal. If a tool tempts you toward `get_viewer_pose`, stop.
- **Layer rules** apply. Service-mode MCP code in `ipc/server/`. No `oxr_*` includes from there.

## Slice entry/exit criteria

For each slice in `mcp-phase-b-plan.md` §"Delivery slices":

1. Confirm previous slice dependencies are landed (it's a chain).
2. Implement.
3. Add or update a test under `tests/mcp/`.
4. `scripts/build-mingw-check.sh` from the worktree — must pass.
5. Build on the primary platform (Windows ideally), run the test, capture output.
6. Verify invariants (especially: `DISPLAYXR_MCP=` unset → no MCP socket).
7. Commit with issue ref. Push. If PR is open, expect CI to fire.

## What "ask first" looks like

- **Adding new IPC opcodes.** `proto.json` is a contract. New ops want a quick design check before you wire them.
- **Touching `comp_d3d11_service.cpp`.** It's owned by shell-phase8 right now; coordinate to avoid merge conflicts.
- **Recording API.** If `docs/roadmap/3d-capture.md` is still "Proposal" status, slice 6 stubs and opens a follow-up. Don't invent the recording surface inside MCP.
- **HTTP/SSE transport.** Out of scope for Phase B per spec §4.4. If anyone asks, redirect to a future Phase C.

## Proceed without asking on

- File layout inside `ipc/server/` for the MCP host.
- JSON shape of tool responses (consistent with Phase A's structured replies).
- Test scaffolding choices (Python over the stdio adapter, like Phase A).
- Workspace JSON schema — single-file-per-workspace under user app-data dir.

## What "done" looks like at PR time

- All 7 Phase B slices committed, each with its test green.
- `tests/mcp/demo_studio.sh` end-to-end demo passes on Windows with shell + 2 cube apps.
- `docs/roadmap/mcp-phase-b-status.md` written, mirroring `mcp-phase-a-status.md`.
- PR body links spec, plan, this prompt, and Phase B issue.
- Windows CI green; MinGW check green.
- No new MSVC-specific shims that aren't already in CLAUDE.md's MinGW-vs-MSVC list.
- **No edits to `docs/roadmap/mcp-spec-v0.2.md`** without explicit user discussion. The spec is the contract, not a doc to update as you go.

## Reference flow for the agent

```
1. Make worktree:   git worktree add .claude/worktrees/mcp-phase-b -b feature/mcp-phase-b origin/main
2. Read the docs above.
3. Open Phase B tracking issue.
4. Slice 1: service plumbing → MinGW check → Windows build → commit with (#NNN).
5. Repeat per slice.
6. End: status doc + PR.
```

The Phase A plan + agent prompt are good shape references — Phase B should produce structurally similar artifacts.
