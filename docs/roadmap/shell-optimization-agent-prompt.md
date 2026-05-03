# Shell / Multi-Compositor Optimization — Agent Prompt

Use this prompt to start a new Claude Code session on the `shell/optimization` branch (worktree at `../openxr-3d-display-shell-opt`).

---

## Prompt

```
I'm picking up the shell / multi-compositor optimization work on DisplayXR. The shell experience today is much sluggier than running the same handle apps standalone, and the goal is to make the shell experience indistinguishable from standalone for fast clients, and graceful (no global stalls) when one client is slow.

## Context — read these in order

1. `CLAUDE.md` — project overview, build commands, architecture (Windows). Pay special attention to:
   - The shell/multi-compositor architecture sections.
   - The build commands. ALWAYS use `scripts\build_windows.bat`, never invoke cmake/ninja directly (`feedback_use_build_windows_bat.md`).
   - The screenshot trigger mechanism for self-feedback.
2. `docs/roadmap/shell-optimization.md` — **the roadmap.** Why this work exists, principles, phased approach.
3. `docs/roadmap/shell-optimization-plan.md` — **the detailed plan.** Concrete tasks, file paths, line numbers, code touchpoints, testing matrix. This is what you're implementing.
4. `docs/architecture/compositor-pipeline.md` — pipeline reference.
5. `docs/specs/swapchain-model.md` — swapchain / canvas semantics. Any sync redesign in Phase 2/3 must preserve these.
6. `docs/adr/ADR-001-native-compositors-per-graphics-api.md` — why each API has its own compositor (still holds; all this work is *within* the D3D11 path).

## Branch

You are on `shell/optimization`, in a worktree at `../openxr-3d-display-shell-opt` branched from `main` at the time the roadmap was written. All work goes here. Each phase is a candidate for its own PR back to `main` — do NOT bundle multiple phases into a single PR.

Always create commit messages that reference the relevant tracking issue if one exists; if none does, ask the user before creating one.

## Memory files you should rely on

- `feedback_use_build_windows_bat.md` — never run cmake/ninja directly.
- `feedback_test_before_ci.md` — wait for the user to test locally before pushing or running /ci-monitor.
- `feedback_dll_version_mismatch.md` — after each rebuild, copy runtime binaries to `C:\Program Files\DisplayXR\Runtime\` (the registry finds them). The installer is only needed if the installer itself changed.
- `feedback_local_vs_ci_builds.md` — prefer local builds on the dev machine.
- `feedback_branch_workflow.md` — already on a feature branch; don't create new branches inside this one without asking.
- `feedback_atlas_stride_invariant.md` — slot stride invariant must hold across ALL paths; don't break it with a "fast path".
- `feedback_mirror_inprocess_arch.md` — for any new tile geometry that crosses IPC, the app (or bridge proxy) is source of truth; the service does not re-derive.
- `feedback_srgb_blit_paths.md` — non-shell needs shader blit (linearize for DP); shell uses raw copy; never unify.
- `reference_runtime_screenshot.md` — file-trigger atlas screenshot for visual self-feedback.
- `reference_service_log_diagnostics.md` — pattern for one-shot diagnostic breadcrumbs in `%LOCALAPPDATA%\DisplayXR\` logs. Phase 1/2/3 all add new ones; follow this pattern.
- `feedback_shell_screenshot_reliability.md` — the atlas screenshot misses UI during eye-tracking warmup; ask the user to eyeball the live display for visual correctness, don't just trust the screenshot.

## What you're building

Phase 1 first. Phases 2 and 3 only after Phase 1 ships and the user has tested it. Re-read the plan's "Phase 1 acceptance criteria" before claiming done.

Phase 1 summary (from `shell-optimization-plan.md`):

1. **Per-client zero-copy eligibility** in `comp_d3d11_service.cpp` around line 9930. Today a single global flag flips the entire frame to the slow blit path; make it per-client.
2. **Drop the 100 ms KeyedMutex timeout to ~4 ms** at line 9883, and on timeout reuse the previous tile rather than retry. Convert pathological 100 ms stalls into 1-frame quality blips.
3. **Benchmark scaffold** — a script that captures `Present`-to-`Present` jitter so before/after numbers are committed to `shell-optimization-status.md`.

## Tasks (track in shell-optimization-status.md)

Create `docs/roadmap/shell-optimization-status.md` on first run if it doesn't exist. Use the same checklist style as `shell-phase8-status.md`. Tick items as you complete them.

For Phase 1:
- [ ] Read all the linked context docs.
- [ ] Verify the cited line numbers in `comp_d3d11_service.cpp` and `comp_multi_compositor.c` haven't drifted from when the plan was written.
- [ ] Implement Task 1.1 (per-client zero-copy).
- [ ] Implement Task 1.2 (mutex timeout reduction + reuse-on-timeout).
- [ ] Implement Task 1.3 (benchmark script).
- [ ] Add Phase 1 diagnostic log lines per `shell-optimization-plan.md` "Diagnostics" section.
- [ ] Build via `scripts\build_windows.bat build` and copy binaries to `C:\Program Files\DisplayXR\Runtime\`.
- [ ] Capture before/after benchmark, commit numbers to status doc.
- [ ] Wait for the user to test on the Leia SR display before pushing.
- [ ] Open Phase 1 PR back to main.

DO NOT start Phase 2 in the same PR. Phase 2 ships separately.

## How to verify your changes

For Phase 1:
1. Build via `scripts\build_windows.bat build`.
2. Copy `displayxr-service.exe` + `DisplayXRClient.dll` to `C:\Program Files\DisplayXR\Runtime\` (per `feedback_dll_version_mismatch.md`).
3. Launch two cube apps in shell: `_package\bin\displayxr-shell.exe test_apps\cube_handle_d3d11_win\build\cube_handle_d3d11_win.exe test_apps\cube_handle_d3d11_win\build\cube_handle_d3d11_win.exe`
4. Run the new bench script for 60 s, capture CSV.
5. Check `%LOCALAPPDATA%\DisplayXR\` log for the new `[ZC]` and `[MUTEX]` breadcrumbs.
6. Compare to a baseline run on `main`. Commit both CSVs and a brief diff to `shell-optimization-status.md`.
7. **Ask the user to confirm visual smoothness on the Leia SR display.** Screenshot-only verification is insufficient (`feedback_shell_screenshot_reliability.md`).

## Tone

This is performance work. Numbers > opinions. If a change "should" help but the bench shows it doesn't, the change was wrong. Always commit before/after numbers alongside the code.

This is also infrastructure that the rest of the shell depends on. Don't refactor adjacent code "while you're in there" — keep PRs small and focused on the phase's stated tasks.

## Out of scope (don't touch)

- macOS / Metal multi-compositor.
- Vulkan service compositor.
- IPC protocol changes that affect non-shell clients (legacy apps, WebXR bridge) without a feature flag.
- Anything outside the four phases listed in the plan.

## When in doubt

Ask the user. The user has deep context on this project (designed it, knows the SR SDK internals, has the Leia SR hardware). For any architectural decision not explicitly covered in the plan — especially if it could affect WebXR bridge, legacy apps, or the chrome / launcher rendering — ask before committing.
```

---

## How to use this prompt

1. Open a new Claude Code session in the worktree:
   ```
   cd ../openxr-3d-display-shell-opt
   claude
   ```
2. Paste the prompt above.
3. The agent will read context, verify line numbers, and start Phase 1.
