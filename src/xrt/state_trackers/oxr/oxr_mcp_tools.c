// Copyright 2026, DisplayXR / Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  MCP tool implementations for the OpenXR state tracker.
 *
 * In Phase A the DisplayXR runtime supports exactly one handle-app session
 * at a time, so a single attached @c oxr_session pointer is sufficient.
 * Access is synchronized with a mutex — tool handlers run on the MCP
 * server thread, the session pointer is written from the app thread.
 *
 * Tools are registered in two phases:
 *   @ref oxr_mcp_tools_register_all — called from xrCreateInstance.
 *   @ref oxr_mcp_tools_attach_session — called from xrCreateSession.
 * Handlers read-check the session pointer and return an error result when
 * no session is attached yet.
 *
 * @ingroup oxr_main
 */

#include "oxr_mcp_tools.h"
#include "oxr_objects.h"

#include "util/u_mcp_server.h"

#include "xrt/xrt_compositor.h"
#include "xrt/xrt_limits.h"

#include <cjson/cJSON.h>

#include <pthread.h>
#include <string.h>
#include <unistd.h>

static pthread_mutex_t g_sess_lock = PTHREAD_MUTEX_INITIALIZER;
static struct oxr_session *g_sess = NULL;

static struct oxr_session *
lock_session(void)
{
	pthread_mutex_lock(&g_sess_lock);
	return g_sess;
}

static void
unlock_session(void)
{
	pthread_mutex_unlock(&g_sess_lock);
}

static cJSON *
error_object(const char *message)
{
	cJSON *o = cJSON_CreateObject();
	cJSON_AddStringToObject(o, "error", message);
	return o;
}

static const char *
gfx_api_name(const struct oxr_session *sess)
{
	if (sess->is_d3d11_native_compositor)
		return "d3d11";
	if (sess->is_d3d12_native_compositor)
		return "d3d12";
	if (sess->is_metal_native_compositor)
		return "metal";
	if (sess->is_gl_native_compositor)
		return "opengl";
	if (sess->is_vk_native_compositor)
		return "vulkan";
	return "unknown";
}

// ---------- list_sessions ----------

static cJSON *
tool_list_sessions(const cJSON *params, void *userdata)
{
	(void)params;
	(void)userdata;
	cJSON *result = cJSON_CreateObject();
	cJSON *arr = cJSON_CreateArray();

	struct oxr_session *sess = lock_session();
	if (sess != NULL) {
		cJSON *e = cJSON_CreateObject();
		cJSON_AddNumberToObject(e, "pid", (double)getpid());
		// Phase A is single-session; display_id is 0.
		cJSON_AddNumberToObject(e, "display_id", 0);
		cJSON_AddStringToObject(e, "api", gfx_api_name(sess));
		cJSON_AddNumberToObject(e, "session_state", sess->state);
		cJSON_AddNumberToObject(e, "view_count", sess->sys != NULL ? sess->sys->view_count : 0);
		cJSON_AddItemToArray(arr, e);
	}
	unlock_session();

	cJSON_AddItemToObject(result, "sessions", arr);
	return result;
}

static const struct u_mcp_tool TOOL_LIST_SESSIONS = {
    .name = "list_sessions",
    .description = "List MCP-introspectable DisplayXR sessions visible from this process.",
    .input_schema_json = "{\"type\":\"object\",\"properties\":{}}",
    .fn = tool_list_sessions,
};

// ---------- get_display_info ----------

static cJSON *
tool_get_display_info(const cJSON *params, void *userdata)
{
	(void)params;
	(void)userdata;
	struct oxr_session *sess = lock_session();
	if (sess == NULL || sess->sys == NULL || sess->sys->xsysc == NULL) {
		unlock_session();
		return error_object("no active session");
	}
	const struct xrt_system_compositor_info *info = &sess->sys->xsysc->info;
	uint32_t view_count = sess->sys->view_count;

	cJSON *r = cJSON_CreateObject();

	cJSON *phys = cJSON_CreateObject();
	cJSON_AddNumberToObject(phys, "width_m", info->display_width_m);
	cJSON_AddNumberToObject(phys, "height_m", info->display_height_m);
	cJSON_AddItemToObject(r, "physical_size", phys);

	cJSON *panel = cJSON_CreateObject();
	cJSON_AddNumberToObject(panel, "width_pixels", info->display_pixel_width);
	cJSON_AddNumberToObject(panel, "height_pixels", info->display_pixel_height);
	cJSON_AddItemToObject(r, "panel", panel);

	cJSON *atlas = cJSON_CreateObject();
	cJSON_AddNumberToObject(atlas, "width_pixels", info->atlas_width_pixels);
	cJSON_AddNumberToObject(atlas, "height_pixels", info->atlas_height_pixels);
	cJSON_AddItemToObject(r, "atlas", atlas);

	cJSON *nom = cJSON_CreateObject();
	cJSON_AddNumberToObject(nom, "x_m", info->nominal_viewer_x_m);
	cJSON_AddNumberToObject(nom, "y_m", info->nominal_viewer_y_m);
	cJSON_AddNumberToObject(nom, "z_m", info->nominal_viewer_z_m);
	cJSON_AddItemToObject(r, "nominal_viewer", nom);

	cJSON *scale = cJSON_CreateObject();
	cJSON_AddNumberToObject(scale, "x", info->recommended_view_scale_x);
	cJSON_AddNumberToObject(scale, "y", info->recommended_view_scale_y);
	cJSON_AddItemToObject(r, "recommended_view_scale", scale);

	cJSON_AddNumberToObject(r, "view_count", view_count);
	cJSON_AddBoolToObject(r, "hardware_display_3d", sess->hardware_display_3d);

	cJSON *views = cJSON_CreateArray();
	for (uint32_t i = 0; i < view_count && i < XRT_MAX_VIEWS; i++) {
		const XrViewConfigurationView *v = &sess->sys->views[i];
		cJSON *vo = cJSON_CreateObject();
		cJSON_AddNumberToObject(vo, "recommended_width", v->recommendedImageRectWidth);
		cJSON_AddNumberToObject(vo, "recommended_height", v->recommendedImageRectHeight);
		cJSON_AddNumberToObject(vo, "max_width", v->maxImageRectWidth);
		cJSON_AddNumberToObject(vo, "max_height", v->maxImageRectHeight);
		cJSON_AddItemToArray(views, vo);
	}
	cJSON_AddItemToObject(r, "views", views);

	unlock_session();
	return r;
}

static const struct u_mcp_tool TOOL_GET_DISPLAY_INFO = {
    .name = "get_display_info",
    .description =
        "Return the DisplayXR display dimensions, panel size, atlas size, nominal viewer position, "
        "and per-view recommended/max image rects. Wraps XR_EXT_display_info.",
    .input_schema_json = "{\"type\":\"object\",\"properties\":{}}",
    .fn = tool_get_display_info,
};

// ---------- get_runtime_metrics ----------

static cJSON *
tool_get_runtime_metrics(const cJSON *params, void *userdata)
{
	(void)params;
	(void)userdata;
	struct oxr_session *sess = lock_session();
	if (sess == NULL) {
		unlock_session();
		return error_object("no active session");
	}
	cJSON *r = cJSON_CreateObject();
	cJSON_AddStringToObject(r, "gfx_api", gfx_api_name(sess));
	cJSON_AddNumberToObject(r, "session_state", sess->state);
	cJSON_AddNumberToObject(r, "frames_begun", (double)sess->frame_id.begun);
	cJSON_AddNumberToObject(r, "frames_waited", (double)sess->frame_id.waited);
	cJSON_AddNumberToObject(r, "active_wait_frames", sess->active_wait_frames);
	cJSON_AddBoolToObject(r, "compositor_visible", sess->compositor_visible);
	cJSON_AddBoolToObject(r, "compositor_focused", sess->compositor_focused);
	cJSON_AddBoolToObject(r, "has_external_window", sess->has_external_window);
	cJSON_AddNumberToObject(r, "ipd_meters", sess->ipd_meters);
	unlock_session();
	return r;
}

static const struct u_mcp_tool TOOL_GET_RUNTIME_METRICS = {
    .name = "get_runtime_metrics",
    .description =
        "Return cheap runtime counters: frames begun/waited, compositor visibility/focus, "
        "graphics API, current session state.",
    .input_schema_json = "{\"type\":\"object\",\"properties\":{}}",
    .fn = tool_get_runtime_metrics,
};

// ---------- Public API ----------

void
oxr_mcp_tools_register_all(void)
{
	u_mcp_server_register_tool(&TOOL_LIST_SESSIONS);
	u_mcp_server_register_tool(&TOOL_GET_DISPLAY_INFO);
	u_mcp_server_register_tool(&TOOL_GET_RUNTIME_METRICS);
}

void
oxr_mcp_tools_attach_session(struct oxr_session *sess)
{
	pthread_mutex_lock(&g_sess_lock);
	g_sess = sess;
	pthread_mutex_unlock(&g_sess_lock);
}

void
oxr_mcp_tools_detach_session(struct oxr_session *sess)
{
	pthread_mutex_lock(&g_sess_lock);
	if (g_sess == sess) {
		g_sess = NULL;
	}
	pthread_mutex_unlock(&g_sess_lock);
}
