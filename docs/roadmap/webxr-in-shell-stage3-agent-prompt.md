# WebXR-in-Shell Stage 3 — Agent Prompt

Paste this into a fresh Claude Code session to start Stage 3.

---

## Prompt

```
Read docs/roadmap/webxr-in-shell-stage3-plan.md and execute the
sub-stages 3a.0 → 3a.1 → 3b → 3c, pausing after 3c for a visual test.
3d is optional and can run after the visual confirms.

Parent plan: docs/roadmap/webxr-in-shell-plan.md
Stage 2 plan + follow-ups: docs/roadmap/webxr-in-shell-stage2-plan.md

Commit per sub-stage. Don't push. Don't run /ci-monitor.

Work on branch feature/webxr-in-shell (Stage 2 already merged into
that branch). Branch state: 8 commits ahead of origin, all Stage 2
work green, ready for Stage 3 to stack on top.
```

---

## Context to load before starting

The agent should read these files in order before designing or coding:

1. **`docs/roadmap/webxr-in-shell-stage3-plan.md`** — the detailed
   plan with sub-stages, files touched, design rationale.
2. **`docs/roadmap/webxr-in-shell-plan.md`** — parent plan (Stage 3
   is "Path B" therein).
3. **`docs/roadmap/webxr-in-shell-stage2-plan.md`** — Stage 2 plan
   plus the four documented follow-ups (qwerty freeze, color shift,
   launcher empty-state, window pose reset). Stage 3 should NOT fix
   any of these but MUST not regress them.
4. **`docs/specs/multiview-tiling.md`** — the "Shell Mode: Two-Stage
   Atlas Pipeline" section codifies the atlas-stride invariant. Read
   before touching any code that does per-tile math.
5. **Memory entries** (the harness loads MEMORY.md automatically; the
   relevant ones for Stage 3 are):
   - `feedback_atlas_stride_invariant`
   - `feedback_3d_mode_terminology` (multiview-only language)
   - `feedback_dll_version_mismatch` (the four-binary copy dance)
   - `feedback_use_build_windows_bat`
   - `feedback_test_before_ci`
   - `feedback_srgb_blit_paths` (in case any color-path question
     comes up — Stage 3 follow-up has notes too)

## Build / test workflow (must follow exactly)

Per `feedback_use_build_windows_bat` and `feedback_dll_version_mismatch`:

1. **Build:** `scripts\build_windows.bat build` (never cmake/ninja
   directly). If build fails for an unexpected reason, fix the
   script — don't bypass it.
2. **Stop running service + bridge children:**
   ```
   powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -like 'displayxr*' } | Select-Object ProcessId, Name | Format-Table -AutoSize"
   # Kill all listed displayxr processes (taskkill //PID N //F).
   # Bridge is a child of service — kill bridge first to avoid
   # respawn dance, then kill service.
   ```
3. **Refresh ALL FOUR binaries** (the IPC version handshake will
   reject mismatched git_tag — see `feedback_dll_version_mismatch`):
   ```
   mv "/c/Program Files/DisplayXR/Runtime/DisplayXRClient.dll" "/c/Program Files/DisplayXR/Runtime/DisplayXRClient.dll.oldN"
   cp "_package/bin/DisplayXRClient.dll"           "/c/Program Files/DisplayXR/Runtime/"
   cp "_package/bin/displayxr-service.exe"         "/c/Program Files/DisplayXR/Runtime/"
   cp "_package/bin/displayxr-shell.exe"           "/c/Program Files/DisplayXR/Runtime/"
   cp "_package/bin/displayxr-webxr-bridge.exe"    "/c/Program Files/DisplayXR/Runtime/"
   ```
   Increment the `.oldN` suffix; the directory already has `.old` →
   `.old20` from Stage 2 iterations.
4. **Restart the service with the dev-repo env var** so the shell
   launcher discovers test apps:
   ```
   DISPLAYXR_REPO_ROOT="C:\\Users\\Sparks i7 3080\\Documents\\GitHub\\openxr-3d-display" \
     cmd //c start "" "C:\\Program Files\\DisplayXR\\Runtime\\displayxr-service.exe"
   ```
5. **User restarts Chrome** — the agent can't do this. Tell the user
   to close ALL Chrome windows (the OLD `DisplayXRClient.dll.oldN` is
   loaded into the existing Chrome process and won't unload until the
   process exits). Then reopen Chrome and load the test page.

## Test pages

- **Bridge-aware sample** (Stage 3's primary subject):
  `webxr-bridge/sample/index.html`. Serve from a local static server
  (the user usually has one running at `http://localhost:8000/sample/`
  or similar — check `webxr-bridge/DEVELOPER.md`).
- **Legacy WebXR** (regression check that Stage 2 still works):
  `https://immersive-web.github.io/webxr-samples/immersive-vr-session.html`.
- **Handle app** (regression check):
  `cube_handle_d3d11_win` from the launcher (Ctrl+L in shell).

## Visual tests on the user

The agent CANNOT see the Leia SR display. All visual verification
goes through the user. Per `feedback_shell_screenshot_reliability`,
PrintWindow / screenshots can miss UI during eye-tracker warmup, so
**ask the user to eyeball the live display** for visual correctness.

The compositor file-trigger atlas screenshot (`reference_runtime_screenshot`)
is useful for non-eye-tracked atlas inspection but only fires when a
client is rendering. Trigger:
```
rm -f "/c/Users/SPARKS~1/AppData/Local/Temp/shell_screenshot.png"
touch "/c/Users/SPARKS~1/AppData/Local/Temp/shell_screenshot_trigger"
sleep 3
# Read /c/Users/SPARKS~1/AppData/Local/Temp/shell_screenshot.png
```

## Pitfalls — pause before each, do not repeat Stage 2 mistakes

These cost real time during Stage 2. If the agent finds itself in
any of these situations, STOP and re-read the relevant memory:

1. **"My code change shouldn't affect this path."** Verify
   empirically with a diagnostic log line printing actual sizes /
   gates. Stage 2 had three rounds of "shouldn't affect → does
   affect" before realizing `sys->view_width` ≠ `atlas_w / tile_columns`
   in shell mode.
2. **"Color is wrong now."** Ask the user whether their reference is
   shell-mode or non-shell-mode. The Stage 2 sweep wasted a round
   chasing a "regression" that turned out to be a pre-existing
   shell-mode-specific color shift comparing against a non-shell
   reference image.
3. **"Build green, but client gets 'session not supported.'"**
   git_tag mismatch on `DisplayXRClient.dll`. Always copy the DLL
   even if the source change was server-only —
   `feedback_dll_version_mismatch` documents the trap.
4. **"DLL won't copy, file in use."** Chrome (or another OpenXR
   client) is still loaded. Use the rename-then-copy trick (Program
   Files dir already has `.old1`-`.old20`).
5. **Multiview language.** No "left/right eye", no "stereo", no
   "SBS" in new code, comments, log lines, OR commit messages. Use
   tile / view / atlas / per-tile.
6. **Atlas-derived stride, not `sys->view_width`.** If Stage 3 needs
   to compute per-tile dims for the JSON window-info, derive from the
   per-client atlas's actual width / `tile_columns`, not
   `sys->view_width` — the spec section in `multiview-tiling.md`
   explains why.

## Stage 2 follow-ups (DO NOT FIX in Stage 3, but be aware)

Documented in `docs/roadmap/webxr-in-shell-stage2-plan.md`:

1. **Qwerty bridge-relay freeze leaks across sessions.**
   `qwerty_device.c:34,350-370` has a global flag that freezes pose
   integration when ANY bridge session is alive. Once Stage 3 makes
   bridge-aware perspective correct, the user will likely also want
   to MOVE the camera in the page — but the freeze prevents qwerty
   pose from updating. May warrant fixing immediately AFTER Stage 3
   so the bridge-aware win is fully usable. Half-day of work; not in
   Stage 3 scope.
2. **Pre-existing bridge-aware color shift in shell.** The deep-navy
   background renders as washed-out indigo. Reverted to pre-2b state
   and confirmed it still happens — so it's a pre-existing
   multi-comp pipeline issue (likely an extra gamma transform in
   the shell-only blit path). Stage 3 should NOT fix it but
   verify it doesn't get WORSE. File as separate issue.
3. **Launcher empty-state on auto-spawn.** Shell launched by service
   in response to incoming IPC client doesn't register Ctrl+L hotkey
   or show "press Ctrl+L" hint.
4. **Window pose resets on session re-create.** Multi-comp slots are
   session-lifetime-scoped. Drag → exit VR → re-enter → window pose
   resets. UX issue; needs slot pose persistence keyed on
   `application_name` or PID.

## Definition of done for Stage 3

- [ ] 3a.0 commit: IPC method scaffolded, build green.
- [ ] 3a.1 commit: server handler returns real per-client metrics
      keyed by client_id.
- [ ] 3b commit: bridge resolves Chrome client_id from
      `system_get_clients`.
- [ ] 3c commit: bridge sends per-client window metrics in
      `display-info` JSON.
- [ ] Visual: bridge-aware sample in shell renders with window-scoped
      Kooima — cube perspective matches a handle app's perspective in
      the same slot. User confirms.
- [ ] Regression: Stage 2 cases (Chrome legacy WebXR in shell, handle
      apps in shell, shell off) all still work.
- [ ] Optional 3d commit if user wants the existing 500ms poll to use
      the new IPC.
- [ ] All commits stacked on `feature/webxr-in-shell`. NOT pushed.
- [ ] Color shift, qwerty freeze, launcher empty-state, window pose
      reset — none of these regressed (still bad, but no worse).

## After Stage 3 ships

The natural next priority is the **qwerty bridge-relay freeze** fix —
it's a quick (half-day) follow-up that completes the "bridge-aware
in shell is fully usable" story by letting the user actually move
the camera. See Stage 2 plan's follow-up section for the analysis.

After that: Stage 4 (live resize during session) is the last big
piece in the parent plan.
