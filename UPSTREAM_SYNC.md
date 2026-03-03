# Upstream Sync Procedure

This branch (`upstream-monado`) tracks the original [Monado](https://gitlab.freedesktop.org/monado/monado) repository's `main` branch. It serves as a clean mirror of upstream commits before they are merged into our fork.

## Setup (one-time)

Add the original Monado repo as a remote:

```bash
git remote add upstream https://gitlab.freedesktop.org/monado/monado.git
```

## Syncing with upstream

```bash
# 1. Fetch latest commits from upstream
git fetch upstream

# 2. Switch to the upstream-monado branch
git checkout upstream-monado

# 3. Merge upstream's main branch
git merge upstream/main

# 4. Push the updated branch to our fork
git push origin upstream-monado
```

## Merging upstream changes into main

After syncing `upstream-monado`, you can merge upstream changes into your working branch:

```bash
git checkout main
git merge upstream-monado
# Resolve any conflicts, then commit and push
```
