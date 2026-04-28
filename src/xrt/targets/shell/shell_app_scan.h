// Copyright 2026, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  DisplayXR shell app-discovery scanner.
 *
 * Walks a fixed set of filesystem locations looking for executables that ship a
 * @c .displayxr.json sidecar. Parses the sidecar, resolves icon paths, and
 * returns an array of scanned apps for the launcher.
 *
 * See docs/specs/displayxr-app-manifest.md for the sidecar contract.
 *
 * @ingroup shell
 */

#pragma once

#ifdef _WIN32
#include <windows.h>
#define SHELL_PATH_MAX MAX_PATH
#else
#define SHELL_PATH_MAX 4096
#endif

#define SHELL_APP_NAME_MAX 128
#define SHELL_APP_TYPE_MAX 8
#define SHELL_APP_CATEGORY_MAX 32
#define SHELL_APP_DESCRIPTION_MAX 256
#define SHELL_APP_DISPLAY_MODE_MAX 16
#define SHELL_APP_ICON_LAYOUT_MAX 8

#ifdef __cplusplus
extern "C" {
#endif

/*!
 * A single app discovered by the scanner. Populated from the manifest plus
 * filesystem resolution. All string fields are NUL-terminated.
 */
struct shell_scanned_app
{
	char name[SHELL_APP_NAME_MAX];                    // manifest "name"
	char exe_path[SHELL_PATH_MAX];                    // absolute path to the .exe
	char manifest_path[SHELL_PATH_MAX];               // absolute path to the .displayxr.json (so the launcher can delete it on remove)
	char type[SHELL_APP_TYPE_MAX];                    // "3d" or "2d"
	char category[SHELL_APP_CATEGORY_MAX];            // manifest "category", default "app"
	char description[SHELL_APP_DESCRIPTION_MAX];      // manifest "description"
	char display_mode[SHELL_APP_DISPLAY_MODE_MAX];    // manifest "display_mode", default "auto"
	char icon_path[SHELL_PATH_MAX];                   // absolute path or "" if none
	char icon_3d_path[SHELL_PATH_MAX];                // absolute path or "" if none
	char icon_3d_layout[SHELL_APP_ICON_LAYOUT_MAX];   // "sbs-lr"|"sbs-rl"|"tb"|"bt", empty if no icon_3d
};

/*!
 * Scan the DisplayXR app-discovery paths and populate @p out.
 *
 * Two manifest modes are walked (see docs/specs/displayxr-app-manifest.md §5):
 *
 *  - **Registered-mode dirs** — `%LOCALAPPDATA%\DisplayXR\apps\` and
 *    `%ProgramData%\DisplayXR\apps\`. Each `*.displayxr.json` carries an
 *    `exe_path` field pointing anywhere on disk.
 *  - **Sidecar-mode dev paths** — `<shell_exe_dir>/../test_apps/*\/build\`,
 *    `<shell_exe_dir>/../demos/*\/build\`, `<shell_exe_dir>/../_package/bin\`,
 *    `%PROGRAMFILES%\DisplayXR\apps\`. The manifest is the sibling
 *    `<basename>.displayxr.json` of each `.exe`.
 *
 * Entries are deduplicated by `exe_path` (registered dirs win over sidecar dirs
 * by walk order; per-user wins over system-wide).
 *
 * Returns the number of apps written to @p out (at most @p max_out). Rejected
 * manifests (missing required fields, schema_version mismatch, missing exe,
 * unreadable icon files) are logged and skipped.
 */
int
shell_scan_apps(const char *shell_exe_dir, struct shell_scanned_app *out, int max_out);

#ifdef __cplusplus
}
#endif
