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

#ifdef __cplusplus
}
#endif
