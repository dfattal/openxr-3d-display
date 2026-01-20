---
name: ci-monitor
description: Automate git commit, push, GitHub Actions build monitoring, and auto-fix common build errors. Use /ci-monitor to commit current changes and monitor the build, or /ci-monitor "message" to specify commit message. This skill launches a subagent to save context.
allowed-tools: Read, Grep, Glob, Bash, Task, Edit, Write
---

# CI-Monitor Skill

This skill automates the complete build workflow for CNSDK-OpenXR (Monado): commit → push → monitor → diagnose/fix errors.

## Architecture

```
Local: commit → push
GitHub Actions: build-windows.yml → CMake/Ninja → Upload artifact → Slack notification
```

**Build Configuration:**
- **Platform:** Windows (windows-2022 runner)
- **Build System:** CMake + Ninja Multi-Config
- **Dependencies:** vcpkg, Vulkan SDK, LeiaSR SDK
- **Artifact:** SRMonado package in `_package/`

## CRITICAL: Launch Subagent to Save Context

**You MUST use the Task tool with `subagent_type="general-purpose"` to execute this workflow.**

The subagent handles all heavy work (git, build monitoring, log parsing, fixes) in its own context.

### How to Invoke

When this skill is triggered, immediately call:

```
Task(
  subagent_type="general-purpose",
  description="Build monitor workflow",
  prompt="[Full workflow prompt below]"
)
```

---

## Subagent Prompt Template

Pass this complete prompt to the subagent:

```
Execute the CNSDK-OpenXR ci-monitor workflow:

## Configuration
- Repository: CNSDK-OpenXR (Monado fork with Leia SDK)
- Workflow: build-windows.yml
- Artifact Name: SRMonado
- Build: CMake + Ninja Multi-Config (Release)

## Commit Message
[USER PROVIDED MESSAGE OR auto-generate from git diff --stat]

## Workflow Steps

### Step 1: Pre-flight Check
Run `git status` to see changes. If no changes, report "Nothing to commit" and stop.

### Step 2: Commit
- Run `git add -A` to stage all changes
- Create commit with provided message (or auto-generate from changes)
- Use this format:
  git commit -m "$(cat <<'EOF'
  [MESSAGE]

  Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
  EOF
  )"

### Step 3: Push
- Run `git push origin HEAD`
- Note the branch name from output

### Step 4: Monitor Build
- Wait 5 seconds for run to start: `sleep 5`
- Get run ID: `gh run list --limit 1 --json databaseId,status,headBranch --jq '.[0]'`
- Verify the run is for our branch
- Watch build: `gh run watch <id> --interval 15` (timeout 600000ms = 10 min)
- If build succeeds: Report success and artifact URL
- If build fails: Go to Step 5

### Step 5: Diagnose Failure
- Get failed logs: `gh run view <id> --log-failed | tail -200`
- Identify the error pattern
- Check if it matches known fixable errors (see table below)
- If fixable: Go to Step 6
- If not fixable: Report error and stop

### Step 6: Auto-Fix (if applicable)
- Apply the fix using Edit tool
- Commit with message: "Fix: [description of fix]"
- Push and return to Step 4
- Maximum 3 fix attempts before giving up

## Common Build Errors and Auto-Fixes

| Error Pattern | Likely Cause | Auto-Fix |
|--------------|--------------|----------|
| `'XYZ' file not found` | Missing include | Check if file exists, fix include path |
| `error C2039: 'X' is not a member of 'Y'` | Wrong struct member | Read struct definition, fix member name |
| `error C2065: 'X': undeclared identifier` | Missing declaration | Add missing declaration or include |
| `error LNK2019: unresolved external symbol` | Missing library or implementation | Check CMakeLists.txt, add missing source |
| `undefined reference to` | Missing implementation | Add function implementation |
| `redefinition of 'X'` | Duplicate definition | Remove duplicate or add include guard |
| `implicit declaration of function` | Missing include | Add the correct header include |

## Files to Check for Fixes

- `src/xrt/include/xrt/*.h` - Core interface headers
- `src/xrt/compositor/main/*.c` - Compositor implementation
- `src/xrt/compositor/multi/*.c` - Multi-client compositor
- `src/xrt/drivers/leiasr/*.cpp` - Leia SR driver
- `src/xrt/state_trackers/oxr/*.c` - OpenXR state tracker
- `CMakeLists.txt` files - Build configuration

## Return Format

SUCCESS:
"Build completed successfully!
- Committed: '[message]' ([N] files changed)
- Pushed to: [branch]
- Build: SUCCEEDED (run #[id], [duration])
- Artifact: [artifact URL from gh run view]"

FAILURE (unfixable):
"Build FAILED
- Committed: '[message]' ([N] files changed)
- Pushed to: [branch]
- Build: FAILED (run #[id])
- Error: [key error message]
- File: [file:line if identifiable]
- Suggestion: [what to investigate]"

FAILURE (after fix attempts):
"Build FAILED after [N] fix attempts
- Original error: [error]
- Fixes attempted: [list of fixes]
- Current error: [remaining error]
- Manual intervention needed"
```

---

## GitHub Actions Workflow Details

The workflow (`build-windows.yml`) does:

1. **Checkout** - Clones repo with submodules and LFS
2. **Download SR SDK** - Gets LeiaSR SDK from internal releases
3. **Setup vcpkg** - Installs dependencies via vcpkg
4. **Install Vulkan SDK** - Version 1.3.283.0
5. **CMake Generate** - Configures with Ninja Multi-Config
6. **Build** - `cmake --build build --config Release --target install`
7. **Upload Artifact** - Uploads `_package/` as SRMonado artifact
8. **Slack Notification** - Posts success/failure to Slack

### Triggers
- Push to `main` branch
- Push to branches ending in `with-ci-build`
- All pull requests
- Tags starting with `v`

---

## Usage Examples

### With commit message:
```
/ci-monitor "Implement XR_EXT_session_target extension"
```

### Without message (auto-generate):
```
/ci-monitor
```

### Just monitor current PR:
```
/ci-monitor --watch-only
```

The skill will find the latest run for the current branch and monitor it.

---

## Local Build Commands (for reference)

If you need to debug locally:

```bash
# Configure
cmake -S . -B build -G "Ninja Multi-Config" \
  -DXRT_HAVE_LEIA_SR=ON \
  -DCMAKE_PREFIX_PATH="/path/to/LeiaSR-SDK" \
  -DCMAKE_TOOLCHAIN_FILE="/path/to/vcpkg/scripts/buildsystems/vcpkg.cmake"

# Build
cmake --build build --config Release

# Install
cmake --build build --config Release --target install
```
