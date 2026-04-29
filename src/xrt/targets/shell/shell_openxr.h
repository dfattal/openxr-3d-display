// Copyright 2026, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Shell-side OpenXR scaffolding (Phase 2.I).
 *
 * The shell migrates off internal IPC onto the public OpenXR extension
 * surface (XR_EXT_spatial_workspace v5 + XR_EXT_app_launcher v1) over a
 * series of commits. C7 sets up the OpenXR instance + session and
 * resolves PFNs into a struct; C8–C10 replace ipc_call_* sites with
 * PFN dispatch. After C10 the shell drops its internal-IPC includes
 * entirely.
 *
 * The interface here is a thin C facade so main.c (pure C) can drive
 * setup, look up PFNs, and tear down without dragging C++/COM types
 * into the existing translation units.
 */
#pragma once

#include "xrt/xrt_results.h"

#include <stdbool.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

struct shell_openxr;

/*!
 * Initialize the OpenXR scaffolding: create a minimal D3D11 device,
 * xrCreateInstance with XR_EXT_spatial_workspace + XR_EXT_app_launcher
 * + XR_KHR_D3D11_enable enabled, xrGetSystem, xrCreateSession with a
 * D3D11 graphics binding, and resolve every PFN this shell uses into
 * the returned struct.
 *
 * Returns NULL on failure with diagnostics printed via the same
 * P()/PE() helpers main.c uses. Lifetime is owned by the caller; pair
 * with shell_openxr_shutdown.
 */
struct shell_openxr *shell_openxr_init(void);

/*!
 * Tear down the session, instance, and D3D11 device. Safe to pass NULL.
 */
void shell_openxr_shutdown(struct shell_openxr *s);

/*!
 * Direct PFN accessors. Each returns NULL until @ref shell_openxr_init
 * succeeds; after init they are guaranteed non-NULL because the
 * extension declares all functions as required.
 */
void *shell_openxr_session(struct shell_openxr *s);
void *shell_openxr_pfn_activate(struct shell_openxr *s);
void *shell_openxr_pfn_deactivate(struct shell_openxr *s);
void *shell_openxr_pfn_get_state(struct shell_openxr *s);
void *shell_openxr_pfn_add_capture(struct shell_openxr *s);
void *shell_openxr_pfn_remove_capture(struct shell_openxr *s);
void *shell_openxr_pfn_set_pose(struct shell_openxr *s);
void *shell_openxr_pfn_capture_frame(struct shell_openxr *s);
void *shell_openxr_pfn_clear_launcher(struct shell_openxr *s);
void *shell_openxr_pfn_add_launcher_app(struct shell_openxr *s);
void *shell_openxr_pfn_set_launcher_visible(struct shell_openxr *s);
void *shell_openxr_pfn_poll_launcher_click(struct shell_openxr *s);
void *shell_openxr_pfn_set_running_tile_mask(struct shell_openxr *s);
void *shell_openxr_pfn_set_focused(struct shell_openxr *s);
void *shell_openxr_pfn_enumerate_clients(struct shell_openxr *s);
void *shell_openxr_pfn_get_client_info(struct shell_openxr *s);

#ifdef __cplusplus
}
#endif
