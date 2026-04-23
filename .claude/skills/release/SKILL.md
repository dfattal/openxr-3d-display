---
name: release
description: Create a tagged release and monitor the CI + publish pipeline. Supports per-component tags for decoupled release cadences. Syntax /release [component] <version-spec>, where component is one of `all` (default), `runtime`, `demo-<name>`, and version-spec is vX.Y.Z or patch/minor/major.
allowed-tools: Read, Grep, Glob, Bash, Agent, Edit, Write
---

# Release Skill

Creates a tagged release of DisplayXR, monitors the CI build and publish pipeline, and verifies the affected public repo(s) are updated correctly.

## Syntax

```
/release                               # ask user (component + version)
/release <version-spec>                # component=all, full-stack release
/release <component> <version-spec>    # per-component release

component:
  all                      full-stack  → tag `vX.Y.Z` (every publish-* fires)
  runtime                  runtime+shell only → tag `runtime/vX.Y.Z`
  demo-<name>              one demo only → tag `demo-<name>/vX.Y.Z`
                           (e.g. demo-gaussiansplat)

version-spec:
  vX.Y.Z                   explicit
  patch|minor|major        auto-bump from latest tag in that component's lineage
```

See `docs/roadmap/demo-distribution.md` for the tag scheme rationale.

## Architecture

```
/release demo-gaussiansplat patch
  │   (component=demo-gaussiansplat, bumps from latest demo-gaussiansplat/v*)
  ├─ Pre-flight (clean tree, on main, tag not taken)
  ├─ Create tag `demo-gaussiansplat/vX.Y.Z`, push
  ├─ Monitor build-windows.yml        (artifact producer, always)
  ├─ Monitor ONLY the publish workflow(s) for this component:
  │    all   → publish-public.yml + publish-extensions.yml + every publish-demo-*.yml
  │    runtime → publish-public.yml
  │    demo-X → publish-demo-X.yml
  ├─ Verify ONLY the public repo(s) for this component
  └─ Report
```

For `runtime` and `demo-<name>` components, **CMakeLists.txt is not bumped** — the tag itself is the version (demos don't embed a runtime version number; per-component runtime tags don't need a CMake bump either since the pvt `VERSION` only represents runtime lineage and should stay aligned with the last full-stack or runtime tag).

For `all` (full-stack), CMakeLists.txt `VERSION` is updated to the new semver.

## CRITICAL: Launch Subagent

**You MUST use the Agent tool with `subagent_type="general-purpose"` to execute this workflow.**

### Argument parsing

Parse `[ARGUMENTS]` as up to two whitespace-separated tokens:

1. If zero tokens: ask the user for both component and version.
2. If one token:
   - If it matches `vN.N.N` or is `patch|minor|major` → component=`all`, version-spec=the token.
   - If it matches a component keyword (`runtime` or `demo-<something>`) → ask for version-spec.
   - Else → ask user.
3. If two tokens: first is component, second is version-spec. Validate the component is one of `all`, `runtime`, or a known `demo-<name>` (check `.github/workflows/publish-demo-<name>.yml` exists).

Resolve the component's **tag prefix** and **previous-tag pattern**:

```
component=all            → prefix=""                    previous-pattern="v[0-9]*"
component=runtime        → prefix="runtime/"            previous-pattern="runtime/v[0-9]*"
component=demo-<name>    → prefix="demo-<name>/"        previous-pattern="demo-<name>/v[0-9]*"
```

Resolve the new version:

- If version-spec is `vN.N.N`, use it verbatim.
- If `patch|minor|major`, find the latest tag matching the previous-pattern (`git tag --sort=-v:refname | grep -E '^<previous-pattern>$' | head -1`), strip any prefix, bump the appropriate component.
- If no previous tag exists for this component, start at `v1.0.0` (or `v0.1.0` for `demo-<name>` pre-1.0 demos — ask user if ambiguous).

Construct the **full tag** as `${prefix}${version}` (e.g. `runtime/v1.2.0`, `demo-gaussiansplat/v1.1.0`, or plain `v1.2.0`).

### Subagent Prompt Template

Replace `[COMPONENT]`, `[VERSION]` (the `vX.Y.Z` without prefix), and `[FULL_TAG]` (the tag with prefix):

```
Execute the DisplayXR release workflow for [COMPONENT] = [VERSION] (tag: [FULL_TAG]).

## Configuration
- Private repo: DisplayXR/displayxr-runtime-pvt
- Public repos (only the ones this release affects):
    all     → displayxr-runtime, displayxr-shell-releases, displayxr-extensions,
              every displayxr-demo-<name>
    runtime → displayxr-runtime, displayxr-shell-releases
    demo-X  → displayxr-demo-X
- Workflows to monitor:
    all     → build-windows.yml, publish-public.yml, publish-extensions.yml,
              every publish-demo-*.yml
    runtime → build-windows.yml, publish-public.yml
    demo-X  → build-windows.yml, publish-demo-X.yml

---

## PHASE 1: PRE-FLIGHT CHECKS

### Step 1.1: Verify clean state
Run: `git status --short`
- If dirty, STOP: "Working tree is not clean. Commit or stash changes first."

### Step 1.2: Verify on main branch
Run: `git branch --show-current`
- If not `main`, STOP: "Must be on main branch to release."

### Step 1.3: Verify tag doesn't exist
Run: `git tag -l "[FULL_TAG]"`
- If non-empty, STOP: "Tag [FULL_TAG] already exists."

### Step 1.4: Previous version for release notes
Compute PREV_TAG from the component's previous-pattern (see Argument parsing above).
If no previous tag in this lineage, PREV_TAG=<empty> → use "Initial release" in notes.

---

## PHASE 2: UPDATE VERSION AND TAG

### Step 2.1: Update CMakeLists.txt version (component=all OR runtime only)
Extract X.Y.Z from [VERSION]. Read top-level CMakeLists.txt line with `VERSION X.Y.Z`, update via Edit tool.
Skip this step for `demo-<name>` releases — demos don't carry runtime CMake version.

### Step 2.2: Commit version bump (skip if no CMakeLists change)
```bash
git add CMakeLists.txt
git commit -m "Release [FULL_TAG]"
```

### Step 2.3: Create tag and push
```bash
# Push main only if Step 2.2 committed something.
git tag [FULL_TAG]
git push origin main        # no-op if nothing new
git push origin [FULL_TAG]
```
Store the commit SHA: `git rev-parse HEAD`.

---

## PHASE 3: MONITOR BUILD

### Step 3.1: Wait for build to register
`sleep 15`

### Step 3.2: Find the build run
```bash
gh run list --workflow build-windows.yml --limit 10 --json databaseId,status,headSha,event
```
Find the run with `headSha == $(git rev-parse HEAD)` and event=push. Retry up to 6 times with 10s waits.

### Step 3.3: Watch build
`gh run watch RUN_ID --interval 15 --exit-status` (timeout 1800000ms — Windows CI can take up to 30 min with test apps).

### Step 3.4: Check result
- Success → Phase 4
- Failure → Phase 6 (Rollback)

---

## PHASE 4: MONITOR PUBLISH PIPELINE

Run **only the workflows relevant to this component** (see Configuration above).

For each relevant workflow:
```bash
gh run list --workflow <workflow>.yml --limit 5 --json databaseId,status,headSha,conclusion
```
Find run for the release commit SHA. Watch with `gh run watch ... --interval 15 --exit-status` (timeout 1800000ms).

If any fails: report error with `gh run view <id> --log-failed | tail -30` but DO NOT rollback — the build succeeded, publish is recoverable.

---

## PHASE 5: VERIFY AND REPORT

For each public repo relevant to this component (see Configuration):

```bash
gh release view [VERSION] --repo <repo> --json tagName,name,assets
```

Verify:
- Tag exists.
- Release was created.
- For `displayxr-shell-releases`: installer + shell exe attached.
- For `displayxr-demo-<name>`: source synced on main (`gh api repos/DisplayXR/displayxr-demo-<name>/commits --jq '.[0].commit.message'` should reference the sync) + binary zip attached.

### Release notes
```bash
if [ -n "$PREV_TAG" ]; then
  git log "$PREV_TAG".."[FULL_TAG]" --oneline --no-merges
else
  git log --oneline --no-merges | head -50
fi
```
Group commits by prefix (Feature, Fix, CI, Docs, etc.). Update release bodies via `gh release edit <VERSION> --repo <repo> --notes "..."` on the affected public repos only.

### Final report
```
Release [FULL_TAG] published successfully!

Component: [COMPONENT]
Build:     Windows CI PASSED (run #RUN_ID)

Published to:
  - <list only the repos relevant to [COMPONENT]>

Notable changes:
  [grouped bullet summary]
```

STOP.

---

## PHASE 6: ROLLBACK (on BUILD failure only)

### Step 6.1: Delete tag
```bash
git tag -d [FULL_TAG]
git push --delete origin [FULL_TAG]
```

### Step 6.2: Revert version bump (if Phase 2 committed one)
```bash
git revert HEAD --no-edit
git push origin main
```

### Step 6.3: Error summary
```bash
gh run view RUN_ID --log-failed | tail -200
```

### Step 6.4: Report
```
Release [FULL_TAG] FAILED — rolled back.

Error from build:
[error summary]

Tag and version bump have been reverted. Fix the issue and retry.
```

STOP.
```

---

## Examples

```
/release v1.2.0
    → full-stack, explicit version
    → tag `v1.2.0`, updates CMakeLists VERSION to 1.2.0
    → fires every publish-* workflow

/release patch
    → full-stack, bumps from latest `v*` tag
    → e.g. latest `v1.1.0` → tag `v1.1.1`

/release runtime minor
    → runtime + shell only
    → latest `runtime/v*` tag (or `v*` if no runtime/ yet) → bump minor
    → tag `runtime/v1.2.0`
    → fires publish-public.yml only

/release demo-gaussiansplat v1.1.0
    → demo only, explicit
    → tag `demo-gaussiansplat/v1.1.0`
    → fires publish-demo-gaussiansplat.yml only
    → CMakeLists NOT touched

/release demo-gaussiansplat patch
    → demo only, auto-bump
    → latest `demo-gaussiansplat/v*` tag → bump patch
    → tag `demo-gaussiansplat/v1.1.3`
```
