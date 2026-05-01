// Copyright 2026, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief Shell-side chrome render module (Phase 2.C).
 *
 * Owns per-workspace-client chrome swapchains. On client connect the module
 * creates an XrSwapchain via xrCreateWorkspaceClientChromeSwapchainEXT,
 * renders the floating-pill design into image[0], and submits the layout
 * (pose-in-client + size + hit regions) via xrSetWorkspaceClientChromeLayoutEXT.
 *
 * Plain-C interface so main.c (compiled as C) can drive it. Implementation
 * is C++ to use D3D11 / DXGI / COM through wil.
 */
#pragma once

#include <openxr/openxr.h>
#include <openxr/XR_EXT_spatial_workspace.h>

#include <stdbool.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

struct shell_openxr_state;
struct shell_chrome;

/*!
 * Allocate the chrome module, bound to the shell's OpenXR state. The shell's
 * D3D11 device must already be live. Returns NULL on init failure (logged).
 */
struct shell_chrome *shell_chrome_create(struct shell_openxr_state *xr);

/*!
 * Tear down all per-client chrome swapchains and free the module. Safe to
 * pass NULL.
 */
void shell_chrome_destroy(struct shell_chrome *sc);

/*!
 * Call once per new workspace client. Creates a chrome swapchain for the
 * client, renders initial chrome state into image[0], and submits the
 * layout. @p win_w_m / @p win_h_m is the client's window size in meters
 * (used to compute pill width as a fraction of window width). Returns true
 * on success; false (with diagnostic) on retryable failure — callers should
 * try again on the next tick (Phase 2.K connect-time race).
 */
bool shell_chrome_on_client_connected(struct shell_chrome *sc,
                                      XrWorkspaceClientId id,
                                      float win_w_m,
                                      float win_h_m);

/*!
 * Call when a client disconnects. Destroys its chrome swapchain.
 */
void shell_chrome_on_client_disconnected(struct shell_chrome *sc, XrWorkspaceClientId id);

/*!
 * Call when a client's window size changes (preset switch, resize, etc.).
 * Re-pushes the layout so the chrome quad scales with the window.
 */
void shell_chrome_on_window_resized(struct shell_chrome *sc,
                                    XrWorkspaceClientId id,
                                    float win_w_m,
                                    float win_h_m);

/*!
 * @return true if a chrome swapchain has been created for the given client.
 * Cheap check (linear scan of internal slot list). main.c calls this from
 * the per-tick lazy retry loop to skip the get_pose IPC round-trip for
 * already-tracked clients — keeps slot-anim set_pose calls smooth.
 */
bool shell_chrome_has(struct shell_chrome *sc, XrWorkspaceClientId id);

#ifdef __cplusplus
}
#endif
