// Copyright 2026, DisplayXR
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Service orchestrator — manages shell and bridge child processes.
 * @ingroup ipc
 */

#pragma once

#include "service_config.h"

#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/*!
 * Initialize the orchestrator. Registers hotkeys and/or spawns children
 * based on the config. Must be called after service_tray_init().
 *
 * @param cfg  Current configuration.
 * @return true on success.
 */
bool
service_orchestrator_init(const struct service_config *cfg);

/*!
 * Called by the tray config-change callback when the user changes
 * shell/bridge mode via the context menu. Starts, stops, or
 * re-registers hotkeys as needed.
 */
void
service_orchestrator_apply_config(const struct service_config *cfg);

/*!
 * Shut down the orchestrator. Terminates managed children, unregisters
 * hotkeys. Must be called before service_tray_cleanup().
 */
void
service_orchestrator_shutdown(void);

/*!
 * Whether a workspace controller binary was found next to the service exe at
 * init time. When false, the tray hides the Workspace submenu and the
 * Ctrl+Space hotkey is a no-op — the runtime is operating as a standalone
 * OpenXR + WebXR platform with no spatial-desktop features.
 *
 * Detection is one-time at init. Reinstalling a controller while the service
 * is running requires a service restart.
 */
bool
service_orchestrator_is_workspace_available(void);

/*!
 * Display name for the installed workspace controller, suitable for tray UI.
 * Reads from the controller's `<binary>.controller.json` sidecar manifest if
 * present; falls back to "Workspace Controller" when the manifest is absent
 * or malformed. Returns an empty string if no controller is installed.
 *
 * The returned pointer is owned by the orchestrator and remains valid for
 * the service's lifetime.
 */
const char *
service_orchestrator_get_workspace_display_name(void);

#ifdef __cplusplus
}
#endif
