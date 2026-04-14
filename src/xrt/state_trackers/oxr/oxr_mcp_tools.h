// Copyright 2026, DisplayXR / Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  MCP tool implementations that read OpenXR state tracker state.
 *         Registered from @ref oxr_instance_create alongside
 *         @ref u_mcp_server_maybe_start.
 * @ingroup oxr_main
 */

#pragma once

#ifdef __cplusplus
extern "C" {
#endif

struct oxr_session;

/*!
 * Register the tool table with the MCP server. Idempotent; safe when the
 * MCP server is disabled (registrations are harmless).
 */
void
oxr_mcp_tools_register_all(void);

/*!
 * Publish the current session so tool handlers can read its state.
 * Called from @ref oxr_session_create on success.
 */
void
oxr_mcp_tools_attach_session(struct oxr_session *sess);

/*!
 * Clear the session pointer. Called from @ref oxr_session_destroy before
 * the session backing memory is freed.
 */
void
oxr_mcp_tools_detach_session(struct oxr_session *sess);

#ifdef __cplusplus
}
#endif
