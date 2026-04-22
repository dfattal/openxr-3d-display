// Copyright 2026, DisplayXR
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Service orchestrator configuration (persisted to service.json).
 * @ingroup ipc
 */

#pragma once

#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/*!
 * Lifecycle mode for a managed child process (shell, bridge).
 */
enum service_child_mode
{
	SERVICE_CHILD_ENABLE,  //!< Always running — launched at service startup.
	SERVICE_CHILD_DISABLE, //!< Never running — not launched, hotkeys not registered.
	SERVICE_CHILD_AUTO,    //!< On-demand — launched when triggered (hotkey, client detection).
};

/*!
 * Persisted service configuration.
 *
 * Stored in `%LOCALAPPDATA%\DisplayXR\service.json` on Windows,
 * `~/.config/displayxr/service.json` on Linux/macOS.
 *
 * Missing file or missing keys → defaults (auto/auto/true).
 */
struct service_config
{
	enum service_child_mode shell;  //!< Shell lifecycle mode (default AUTO).
	enum service_child_mode bridge; //!< WebXR bridge lifecycle mode (default AUTO).
	bool start_on_login;            //!< If false, service exits immediately on auto-start.
};

/*!
 * Load configuration from disk. Returns defaults if the file is absent or
 * contains errors — never fails.
 */
void
service_config_load(struct service_config *cfg);

/*!
 * Save configuration to disk.
 * @return true on success.
 */
bool
service_config_save(const struct service_config *cfg);

#ifdef __cplusplus
}
#endif
