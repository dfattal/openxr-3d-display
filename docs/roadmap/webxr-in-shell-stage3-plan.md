# WebXR-in-Shell — Stage 3 Detailed Plan

**Parent:** [`webxr-in-shell-plan.md`](./webxr-in-shell-plan.md)
**Predecessor:** [`webxr-in-shell-stage2-plan.md`](./webxr-in-shell-stage2-plan.md) — merged on `feature/webxr-in-shell`.
**Status:** Draft — design locked, awaiting execution.

## Problem (restated against verified code state)

Stage 2 fixed legacy WebXR (Chrome's plain immersive session) by routing
`xrLocateViews` through per-client window metrics over a new IPC method.
Bridge-aware pages (those using `session.displayXR`) take a different
path — they read `displayInfo` directly from the bridge over a
WebSocket and do their own Kooima math. Today the bridge sends
**physical-display** `displayInfo` regardless of whether the page is
hosted in a shell window. Result: a bridge-aware sample in shell
renders perspective for the full display, not the window.

Verified by exploration:

- The bridge (`src/xrt/targets/webxr_bridge/main.cpp`) already builds
  and pushes a JSON `display-info` message on WS `hello`
  (`build_display_info_json`, ~main.cpp:772, sent at ~main.cpp:941).
  The message embeds a nested `window-info` object (~lines 746-762).
- `window-info` today is sourced from `b.compositor_window_metrics`,
  which the bridge polls **globally per compositor HWND** —
  one rect for the whole multi-comp window, not per-shell-window.
- The bridge process is itself a headless IPC client with
  `is_bridge_relay=true` and no graphics binding (no `xc`); it just
  relays. Chrome (the browser running the bridge-aware page) is a
  separate IPC client with its own `xc` and slot rect in the multi-comp.
- The multi-comp tracks per-slot rects per IPC client and exposes them
  via `comp_d3d11_service_get_client_window_metrics(xsysc, xc, &wm)`
  — but that takes the per-client `xc`, which the bridge does NOT
  have (the bridge only has its OWN headless `xc`).
- No existing IPC method takes a `client_id` argument and returns
  per-client window metrics. Templates exist for client-id-keyed
  lookups (`system_get_client_info(id)`, `shell_get_window_pose(client_id)`)
  but not for window metrics.

## Scope

Make a bridge-aware WebXR page hosted in a shell window receive
**window-scoped** `displayInfo` instead of physical-display dims —
matching the contract a handle app gets via `xrt_window_metrics`. The
page's existing per-frame re-read of `session.displayXR.windowInfo`
(`main-world.js:233`) means once the bridge sends correct values, the
page Just Works.

Explicitly out of scope:

- Live resize / pose updates **during** an active session (Stage 4).
- Multiple bridge-aware Chrome windows simultaneously
  (Chrome enforces one immersive session per browser anyway, and the
  bridge today rejects a second WS client at `main.cpp:1110`).
- Persisting drag-customized window pose across session re-create
  (Stage 2 follow-up — separate issue).
- Color shift for bridge-aware in shell mode (Stage 2 follow-up,
  pre-existing — not in this stage).
- Android / macOS.

## Design

### 3a. New IPC method `system_get_client_window_metrics(client_id)`

The bridge calls this on its own IPC connection but passes the **target
Chrome client's** `client_id` (not its own). The server resolves
`client_id` to the corresponding per-client `xrt_compositor *` and
calls the existing `comp_d3d11_service_get_client_window_metrics`.

Reuses 2a.x infrastructure:

- Wire shape mirrors `system_get_client_info` (input `uint32_t id`,
  output struct).
- Server-side: resolve `id` to the matching `ipc_client_state` slot
  (the server already keeps a per-client array indexed by id —
  `s->ics_array[]` or similar), then call the existing
  `comp_d3d11_service_get_client_window_metrics(s->xsysc, ics->xc, &wm)`.
- Returns `xrt_window_metrics` with `valid=false` if `client_id` is
  unknown, the target has no slot, or shell mode is off.

Lives in `system_*` namespace (queries info about another client),
not `compositor_*` (which is per-call-client).

### 3b. Bridge identifies the target Chrome IPC client_id

The bridge knows the page via WebSocket but currently has no link to
the page's OpenXR IPC client_id. Strategy:

1. On WS `hello` (or `bridge-attach`), bridge calls
   `ipc_call_system_get_clients(...)` to enumerate connected clients.
2. For each, calls `ipc_call_system_get_client_info(id)` to get
   `application_name` and `pid`.
3. Selects the **single Chrome client with an active session** —
   filter by `application_name` containing `"chrome"` (or by
   `extensions.ext_win32_appcontainer_compatible_enabled`) and
   `client_state.session_active` flag.
4. Caches the resolved `client_id` for the lifetime of the WS
   connection.
5. Re-resolves on each `bridge-attach` so page reloads pick up
   whatever Chrome client_id is current.

Single-Chrome assumption: per the bridge's existing single-WS-client
guard (`main.cpp:1110`), only one bridge-aware page is live at a time
anyway. If 0 or >1 Chrome clients match, the bridge falls back to
global metrics and logs a warning.

### 3c. Bridge sends window-scoped `display-info`

Replace the global `b.compositor_window_metrics` with the per-client
metrics fetched via 3a. The window-info JSON shape stays the same —
only the source values change. Then:

- `windowPixelSize` = slot pixel rect from `xrt_window_metrics`.
- `windowSizeMeters` = `wm.window_width_m × wm.window_height_m`.
- `windowCenterOffsetMeters` = `wm.window_center_offset_*_m`.
- `viewWidth/viewHeight` = slot per-tile dims (slot_w / tile_columns,
  etc., per Stage 2's atlas-derived invariant).

If the bridge can't resolve a Chrome client_id, fall back to the
existing global metrics path (current behavior) so non-shell
bridge-aware pages stay unaffected.

### 3d. (Optional) Refresh on resize/pose

Today the bridge polls window metrics every ~500 ms
(`main.cpp:1599-1601`). Switch the source to the new per-client IPC
call. This gives the bridge-aware page automatic refresh on the same
cadence — a partial Stage 4 win for free.

True per-frame live updates with event delivery is Stage 4.

## Files touched

| File | Why |
|---|---|
| `src/xrt/ipc/shared/proto.json` | Declare `system_get_client_window_metrics` |
| `src/xrt/ipc/server/ipc_server_handler.c` | Server handler — resolve `client_id` → `xc` → call `comp_d3d11_service_get_client_window_metrics` |
| `src/xrt/targets/webxr_bridge/main.cpp` | Resolve target Chrome client_id; replace global metrics source with per-client IPC call; update `build_display_info_json` window-info section |
| `webxr-bridge/extension/src/main-world.js` | (Likely no change — page already reads `session.displayXR.windowInfo` per-frame, picks up new values automatically.) Verify only. |
| `webxr-bridge/sample/sample.js` | (Likely no change — sample re-reads each frame.) Verify only. |
| `webxr-bridge/DEVELOPER.md` | Document the shell-window-scoped displayInfo contract |

No new headers; `xrt_window_metrics` already lives in `xrt_display_metrics.h`.

## Staging

Commit per sub-stage so regressions are bisectable.

1. **3a.0 — IPC method scaffolding.** Declare in `proto.json`. Add
   stub server handler returning `valid=false`. Build green.
2. **3a.1 — Real server handler.** Resolve `client_id` to per-client
   `ics`, call `comp_d3d11_service_get_client_window_metrics`. Log
   per-resolved-id once. Test by calling the method from a small
   client; verify metrics flow.
3. **3b — Bridge identifies Chrome client_id.** Add the
   `system_get_clients` + filter logic in the bridge. Cache the
   resolved id. Log on WS `hello` / `bridge-attach`. Test: bridge
   log shows the right client_id when Chrome connects.
4. **3c — Bridge sends per-client window metrics.** Wire the new IPC
   call into `build_display_info_json`'s window-info section. Test:
   bridge-aware sample in shell renders with window-scoped Kooima
   (cube perspective matches handle-app behavior in the same slot).
5. **3d (optional) — Re-poll source switched.** Existing 500 ms poll
   loop now sources from the per-client IPC. Test: drag the shell
   window between sessions, re-enter VR, confirm new metrics flow
   (same as Stage 2c verification).

## Verification

| Sub-stage | Test |
|---|---|
| 3a.0 | `scripts\build_windows.bat build` green. New IPC method appears in `ipc_protocol_generated.h`. |
| 3a.1 | Call new method from `displayxr-cli` (or a small test client); confirm `valid=true` for shell-mode Chrome client, `valid=false` for unknown ids. |
| 3b | Service log shows `bridge: resolved Chrome client_id=N` on WS `hello`. |
| 3c | Bridge-aware sample in shell: cube perspective matches a handle app's perspective in the same slot. Compare directly: launch `cube_handle_d3d11_win` and bridge-aware sample side by side, both should "look right" for their respective windows. |
| 3d | Drag bridge-aware page's window, exit VR, re-enter VR. New session uses new metrics (visual confirmation). |

Hardware: Leia SR + dev machine + Chrome with WebXR + bridge process running.

## Risks / gotchas

### Carryover from Stage 2 — DO NOT regress these

1. **DLL git_tag mismatch trap** (`feedback_dll_version_mismatch`).
   Every rebuild re-links every binary; the IPC version handshake
   strncmps `u_git_tag`. Always copy **all four binaries**
   (`displayxr-service.exe`, `DisplayXRClient.dll`,
   `displayxr-shell.exe`, `displayxr-webxr-bridge.exe`) into
   `C:\Program Files\DisplayXR\Runtime\` after every rebuild — not
   just the file you edited. Restart Chrome to unload the old DLL.
2. **Atlas stride invariant** (`feedback_atlas_stride_invariant`).
   Stage 3 doesn't touch the compositor blit, but if you're computing
   per-tile dims for the new window-info JSON, use
   `slot_w = atlas_width / tile_columns` not `sys->view_width`.
3. **Multiview terminology** (`feedback_3d_mode_terminology`). DisplayXR
   is multiview-first. Never write "left/right eye", "stereo", "SBS"
   in new code, comments, log lines, or commit messages. Use tile /
   view / atlas language.
4. **Use `scripts\build_windows.bat`** — never call cmake/ninja
   directly (`feedback_use_build_windows_bat`).
5. **Test before pushing.** User runs visual tests; do not
   `/ci-monitor` or push until they confirm
   (`feedback_test_before_ci`).

### Stage 3-specific

1. **Bridge-Chrome identity is heuristic, not authoritative.**
   Filtering `system_get_clients` by `application_name` works for
   today's single-Chrome-WebXR scenario but is fragile if the user
   runs Chromium-derived browsers under different process names
   (Edge=`msedge.exe`, Brave, etc.). v1 should hard-code Chrome and
   document the limitation. v2 could match by HWND ownership
   (compositor's per-slot HWND → owning PID → IPC client).

2. **Race on bridge startup.** Bridge OpenXR init takes ~500 ms cold
   (per `main-world.js:31-32`). If the page sends `hello` before the
   bridge has resolved a Chrome client_id (which depends on Chrome
   having registered as an IPC client), the first `display-info`
   pushes the old global metrics. Mitigate: lazy-resolve on first
   `bridge-attach` rather than on `hello`. The bridge already has
   `bridge-attach` machinery; piggyback.

3. **Page reload re-resolves client_id.** When the page reloads,
   isolated-world reconnects (`main-world.js:284-296`). Chrome may
   spawn a new IPC client (new PID, new id) for the new tab. Bridge
   must re-resolve on each `bridge-attach`, not cache forever.

4. **Multi-tab Chrome.** If the user opens a bridge-aware page in
   tab A and then tab B in the same Chrome window, only tab A has
   the WS connection (bridge rejects second WS client). Tab B sees
   no `displayXR` extension data — fine for Stage 3 (one page at a
   time) but document the limitation. Stage 4+ may need per-tab
   sessions.

5. **Bridge process is its OWN IPC client.** Don't confuse the bridge
   process's `client_id` with Chrome's. The bridge's `client_id`
   should NEVER be the resolution target. Filter it out (its
   `application_name` is `displayxr-webxr-bridge`).

6. **Headless bridge has no `xc`.** The new IPC method doesn't help
   the bridge query its OWN slot (it has none). It only resolves
   metrics for OTHER clients by id. Server handler should NOT confuse
   "calling client" (bridge) with "target client" (Chrome).

7. **`compositor_get_window_metrics` (Stage 2a) vs
   `system_get_client_window_metrics` (Stage 3a).** The Stage 2 method
   returns metrics for the calling client; the Stage 3 method takes
   an id and returns metrics for an arbitrary client. Don't unify
   them — different security/access semantics, different call paths.

8. **Pre-existing color shift in shell mode bridge-aware**
   (Stage 2 follow-up). Not Stage 3's job to fix, but verify
   Stage 3 doesn't make it worse — compare bridge-aware before and
   after each sub-commit.

9. **Qwerty bridge-relay freeze** (Stage 2 follow-up). Once Stage 3
   makes bridge-aware perspective correct, the qwerty freeze becomes
   visible because the user can now perceive the head pose not
   moving. May warrant prioritising the qwerty fix as part of, or
   immediately after, Stage 3.

10. **Page reload during dev iteration.** When testing, the page's
    `displayXR.ready` Promise hangs until display-info + bridge-ack
    arrive. If the bridge crashes or the new IPC method errors out,
    the page hangs for 3 s then fails. Test the failure path as
    well as the happy path.

## Non-goals

- Live resize / pose during session (Stage 4).
- Persisting window pose across session re-create (separate UX issue).
- Multi-tab bridge-aware (Chrome enforcement + bridge single-WS limit).
- Color shift fix (Stage 2 follow-up — separate issue).
- Qwerty bridge-relay freeze fix (Stage 2 follow-up — separate issue).
- Edge / Brave / non-Chrome browser support.
- Android / macOS.

## Stop point

After 3c (bridge sending per-client window metrics), pause for visual
confirmation: bridge-aware sample in shell should render with correct
per-window perspective. If yes, optionally proceed to 3d. If no,
debug — likely candidates: bridge resolution returning wrong id,
metrics returning `valid=false`, or page-side ready-Promise gate
holding up rendering.
