// Copyright 2026, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  DisplayXR WebXR Bridge v2 — metadata sideband host (Phase 1).
 *
 * This is a tiny OpenXR client that runs alongside Chrome's built-in WebXR
 * session against the same displayxr-service instance. It enables
 * XR_EXT_display_info and XR_MND_headless, queries the current display info,
 * enumerates the catalogue of rendering modes, and then sits in a poll loop
 * logging every OpenXR event — in particular XrEventDataRenderingModeChangedEXT.
 *
 * Phase 1 does NOT open a WebSocket, does NOT talk to any browser extension,
 * and does NOT touch the frame pipeline. Those come in Phase 2 and Phase 3.
 * See docs/roadmap/webxr-bridge-v2-plan.md.
 */

#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <windows.h>

#include <atomic>
#include <cstdio>
#include <cstdarg>
#include <cstdlib>
#include <cstring>
#include <string>
#include <vector>

#include <openxr/openxr.h>
#include <openxr/XR_EXT_display_info.h>

// ---------------------------------------------------------------------------
// Logging (stdout; plain printf-style — runtime's u_logging is internal).
// ---------------------------------------------------------------------------

static void log_line(const char *level, const char *fmt, ...) {
	std::fprintf(stdout, "[webxr-bridge][%s] ", level);
	va_list ap;
	va_start(ap, fmt);
	std::vfprintf(stdout, fmt, ap);
	va_end(ap);
	std::fputc('\n', stdout);
	std::fflush(stdout);
}

#define LOG_I(...) log_line("info", __VA_ARGS__)
#define LOG_W(...) log_line("warn", __VA_ARGS__)
#define LOG_E(...) log_line("error", __VA_ARGS__)

static const char *xr_result_str(XrInstance inst, XrResult r) {
	static thread_local char buf[XR_MAX_RESULT_STRING_SIZE];
	if (inst != XR_NULL_HANDLE && XR_SUCCEEDED(xrResultToString(inst, r, buf))) {
		return buf;
	}
	std::snprintf(buf, sizeof(buf), "XrResult(%d)", (int)r);
	return buf;
}

#define XR_CHECK(inst, call)                                                    \
	do {                                                                        \
		XrResult _r = (call);                                                   \
		if (XR_FAILED(_r)) {                                                    \
			LOG_E("%s failed: %s", #call, xr_result_str((inst), _r));           \
			return false;                                                       \
		}                                                                       \
	} while (0)

// ---------------------------------------------------------------------------
// Ctrl+C handling.
// ---------------------------------------------------------------------------

static std::atomic<bool> g_running{true};

static BOOL WINAPI console_ctrl_handler(DWORD type) {
	switch (type) {
	case CTRL_C_EVENT:
	case CTRL_BREAK_EVENT:
	case CTRL_CLOSE_EVENT:
	case CTRL_LOGOFF_EVENT:
	case CTRL_SHUTDOWN_EVENT:
		LOG_I("Ctrl+C / close event received, shutting down");
		g_running.store(false);
		return TRUE;
	default:
		return FALSE;
	}
}

// ---------------------------------------------------------------------------
// Bridge state.
// ---------------------------------------------------------------------------

struct Bridge {
	XrInstance instance = XR_NULL_HANDLE;
	XrSystemId system_id = XR_NULL_SYSTEM_ID;
	XrSession session = XR_NULL_HANDLE;
	bool has_display_info_ext = false;
	bool has_headless_ext = false;
	PFN_xrEnumerateDisplayRenderingModesEXT pfnEnumerateDisplayRenderingModes = nullptr;
};

// ---------------------------------------------------------------------------
// Environment setup — force IPC mode and surface the runtime's hybrid-mode
// decision log. The bridge is only useful as a sideband *to a running
// service*; the in-process native path would give us a private runtime that
// does not share state with Chrome's WebXR session.
// ---------------------------------------------------------------------------

static void force_ipc_mode_env() {
	const char *existing_mode = std::getenv("XRT_FORCE_MODE");
	if (existing_mode != nullptr && std::strlen(existing_mode) > 0) {
		LOG_I("XRT_FORCE_MODE already set to '%s' (leaving as-is)", existing_mode);
	} else {
		_putenv("XRT_FORCE_MODE=ipc");
		LOG_I("XRT_FORCE_MODE=ipc (forced by bridge — IPC to displayxr-service required)");
	}

	// Make sure U_LOG_I from the runtime DLL is visible so we can see the
	// hybrid-mode decision log in target.c:44-50. Default runtime log level
	// filters info messages; surface them unless the user has an override.
	const char *existing_log = std::getenv("XRT_LOG");
	if (existing_log == nullptr || std::strlen(existing_log) == 0) {
		_putenv("XRT_LOG=info");
	}
}

// ---------------------------------------------------------------------------
// Setup helpers.
// ---------------------------------------------------------------------------

static bool create_instance(Bridge &b) {
	uint32_t ext_count = 0;
	XR_CHECK(b.instance, xrEnumerateInstanceExtensionProperties(nullptr, 0, &ext_count, nullptr));

	std::vector<XrExtensionProperties> exts(ext_count, {XR_TYPE_EXTENSION_PROPERTIES});
	XR_CHECK(b.instance,
	         xrEnumerateInstanceExtensionProperties(nullptr, ext_count, &ext_count, exts.data()));

	LOG_I("Runtime exposes %u extensions", ext_count);
	for (const auto &e : exts) {
		if (std::strcmp(e.extensionName, XR_EXT_DISPLAY_INFO_EXTENSION_NAME) == 0) {
			b.has_display_info_ext = true;
		}
		if (std::strcmp(e.extensionName, XR_MND_HEADLESS_EXTENSION_NAME) == 0) {
			b.has_headless_ext = true;
		}
	}
	LOG_I("XR_EXT_display_info: %s", b.has_display_info_ext ? "yes" : "NO");
	LOG_I("XR_MND_headless:     %s", b.has_headless_ext ? "yes" : "NO");

	if (!b.has_display_info_ext) {
		LOG_E("XR_EXT_display_info is required by this bridge; aborting");
		return false;
	}
	if (!b.has_headless_ext) {
		LOG_E("XR_MND_headless is required by this bridge (headless metadata session); aborting");
		return false;
	}

	std::vector<const char *> enabled_exts;
	enabled_exts.push_back(XR_EXT_DISPLAY_INFO_EXTENSION_NAME);
	enabled_exts.push_back(XR_MND_HEADLESS_EXTENSION_NAME);

	XrInstanceCreateInfo ici{XR_TYPE_INSTANCE_CREATE_INFO};
	std::strncpy(ici.applicationInfo.applicationName, "displayxr-webxr-bridge",
	             XR_MAX_APPLICATION_NAME_SIZE - 1);
	ici.applicationInfo.applicationVersion = 1;
	std::strncpy(ici.applicationInfo.engineName, "DisplayXR",
	             XR_MAX_ENGINE_NAME_SIZE - 1);
	ici.applicationInfo.engineVersion = 1;
	ici.applicationInfo.apiVersion = XR_CURRENT_API_VERSION;
	ici.enabledExtensionCount = (uint32_t)enabled_exts.size();
	ici.enabledExtensionNames = enabled_exts.data();

	XR_CHECK(b.instance, xrCreateInstance(&ici, &b.instance));
	LOG_I("xrCreateInstance OK");

	XrInstanceProperties ip{XR_TYPE_INSTANCE_PROPERTIES};
	if (XR_SUCCEEDED(xrGetInstanceProperties(b.instance, &ip))) {
		LOG_I("Runtime: %s v%u.%u.%u", ip.runtimeName,
		      XR_VERSION_MAJOR(ip.runtimeVersion),
		      XR_VERSION_MINOR(ip.runtimeVersion),
		      XR_VERSION_PATCH(ip.runtimeVersion));
	}

	return true;
}

static bool get_system_and_display_info(Bridge &b) {
	XrSystemGetInfo sgi{XR_TYPE_SYSTEM_GET_INFO};
	sgi.formFactor = XR_FORM_FACTOR_HEAD_MOUNTED_DISPLAY;
	XR_CHECK(b.instance, xrGetSystem(b.instance, &sgi, &b.system_id));
	LOG_I("xrGetSystem OK, systemId=%llu", (unsigned long long)b.system_id);

	// System properties + chained XR_EXT_display_info block.
	XrSystemProperties sp{XR_TYPE_SYSTEM_PROPERTIES};
	XrDisplayInfoEXT di{(XrStructureType)XR_TYPE_DISPLAY_INFO_EXT};
	sp.next = &di;
	XR_CHECK(b.instance, xrGetSystemProperties(b.instance, b.system_id, &sp));

	LOG_I("System name: %s", sp.systemName);
	LOG_I("Display info:");
	LOG_I("  displayPixelSize       : %u x %u", di.displayPixelWidth, di.displayPixelHeight);
	LOG_I("  displaySizeMeters      : %.4f x %.4f", di.displaySizeMeters.width,
	      di.displaySizeMeters.height);
	LOG_I("  recommendedViewScale   : %.3f x %.3f", di.recommendedViewScaleX,
	      di.recommendedViewScaleY);
	LOG_I("  nominalViewerPosition  : (%.4f, %.4f, %.4f) m",
	      di.nominalViewerPositionInDisplaySpace.x,
	      di.nominalViewerPositionInDisplaySpace.y,
	      di.nominalViewerPositionInDisplaySpace.z);

	// Default view configuration views (pre-session, no mode context yet).
	uint32_t view_count = 0;
	XR_CHECK(b.instance, xrEnumerateViewConfigurationViews(
	                         b.instance, b.system_id,
	                         XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO, 0,
	                         &view_count, nullptr));
	std::vector<XrViewConfigurationView> views(view_count, {XR_TYPE_VIEW_CONFIGURATION_VIEW});
	XR_CHECK(b.instance, xrEnumerateViewConfigurationViews(
	                         b.instance, b.system_id,
	                         XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO, view_count,
	                         &view_count, views.data()));
	LOG_I("PRIMARY_STEREO view configuration (%u views):", view_count);
	for (uint32_t i = 0; i < view_count; i++) {
		LOG_I("  view[%u] recommended=%ux%u max=%ux%u", i,
		      views[i].recommendedImageRectWidth, views[i].recommendedImageRectHeight,
		      views[i].maxImageRectWidth, views[i].maxImageRectHeight);
	}

	return true;
}

static bool create_session_and_enumerate_modes(Bridge &b) {
	XrSessionCreateInfo sci{XR_TYPE_SESSION_CREATE_INFO};
	sci.systemId = b.system_id;
	// No graphics binding next-chain: headless session via XR_MND_headless.
	XR_CHECK(b.instance, xrCreateSession(b.instance, &sci, &b.session));
	LOG_I("xrCreateSession OK (headless)");
	// xrBeginSession is deferred to the SESSION_STATE_READY event handler —
	// calling it before the runtime has transitioned READY returns
	// XR_ERROR_SESSION_NOT_READY on some implementations.

	// Rendering mode enumeration is session-scoped.
	XrResult r = xrGetInstanceProcAddr(
	    b.instance, "xrEnumerateDisplayRenderingModesEXT",
	    (PFN_xrVoidFunction *)&b.pfnEnumerateDisplayRenderingModes);
	if (XR_FAILED(r) || b.pfnEnumerateDisplayRenderingModes == nullptr) {
		LOG_W("xrEnumerateDisplayRenderingModesEXT not resolved: %s",
		      xr_result_str(b.instance, r));
		return true; // non-fatal for Phase 1 coexistence verification
	}

	uint32_t mode_count = 0;
	r = b.pfnEnumerateDisplayRenderingModes(b.session, 0, &mode_count, nullptr);
	if (XR_FAILED(r) || mode_count == 0) {
		LOG_W("xrEnumerateDisplayRenderingModesEXT(count) returned %s, count=%u",
		      xr_result_str(b.instance, r), mode_count);
		return true;
	}
	std::vector<XrDisplayRenderingModeInfoEXT> modes(mode_count);
	for (auto &m : modes) {
		m.type = XR_TYPE_DISPLAY_RENDERING_MODE_INFO_EXT;
		m.next = nullptr;
	}
	r = b.pfnEnumerateDisplayRenderingModes(b.session, mode_count, &mode_count, modes.data());
	if (XR_FAILED(r)) {
		LOG_W("xrEnumerateDisplayRenderingModesEXT(data) returned %s",
		      xr_result_str(b.instance, r));
		return true;
	}

	LOG_I("Display rendering modes (%u):", mode_count);
	for (uint32_t i = 0; i < mode_count; i++) {
		const auto &m = modes[i];
		LOG_I("  [%u] \"%s\" views=%u tiles=%ux%u viewScale=%.3fx%.3f hw3D=%d",
		      m.modeIndex, m.modeName, m.viewCount, m.tileColumns, m.tileRows,
		      m.viewScaleX, m.viewScaleY, (int)m.hardwareDisplay3D);
	}

	return true;
}

static void log_current_view_config(Bridge &b, const char *reason) {
	uint32_t view_count = 0;
	XrResult r = xrEnumerateViewConfigurationViews(
	    b.instance, b.system_id, XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO, 0,
	    &view_count, nullptr);
	if (XR_FAILED(r)) {
		LOG_W("re-enumerate view config (%s): %s", reason, xr_result_str(b.instance, r));
		return;
	}
	std::vector<XrViewConfigurationView> views(view_count, {XR_TYPE_VIEW_CONFIGURATION_VIEW});
	r = xrEnumerateViewConfigurationViews(
	    b.instance, b.system_id, XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO,
	    view_count, &view_count, views.data());
	if (XR_FAILED(r)) {
		LOG_W("re-enumerate view config data (%s): %s", reason, xr_result_str(b.instance, r));
		return;
	}
	LOG_I("  post-%s view config (%u views):", reason, view_count);
	for (uint32_t i = 0; i < view_count; i++) {
		LOG_I("    view[%u] recommended=%ux%u", i, views[i].recommendedImageRectWidth,
		      views[i].recommendedImageRectHeight);
	}
}

// ---------------------------------------------------------------------------
// Event pump.
// ---------------------------------------------------------------------------

static void handle_event(Bridge &b, const XrEventDataBuffer &evt) {
	switch ((int)evt.type) {
	case XR_TYPE_EVENT_DATA_INSTANCE_LOSS_PENDING: {
		auto *e = reinterpret_cast<const XrEventDataInstanceLossPending *>(&evt);
		LOG_W("INSTANCE_LOSS_PENDING lossTime=%lld", (long long)e->lossTime);
		g_running.store(false);
	} break;

	case XR_TYPE_EVENT_DATA_SESSION_STATE_CHANGED: {
		auto *e = reinterpret_cast<const XrEventDataSessionStateChanged *>(&evt);
		LOG_I("SESSION_STATE_CHANGED state=%d", (int)e->state);
		if (e->state == XR_SESSION_STATE_READY && b.session != XR_NULL_HANDLE) {
			XrSessionBeginInfo sbi{XR_TYPE_SESSION_BEGIN_INFO};
			sbi.primaryViewConfigurationType = XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO;
			XrResult r = xrBeginSession(b.session, &sbi);
			LOG_I("  xrBeginSession on READY: %s", xr_result_str(b.instance, r));
		} else if (e->state == XR_SESSION_STATE_STOPPING) {
			xrEndSession(b.session);
			LOG_I("  xrEndSession on STOPPING");
		} else if (e->state == XR_SESSION_STATE_EXITING ||
		           e->state == XR_SESSION_STATE_LOSS_PENDING) {
			g_running.store(false);
		}
	} break;

	case XR_TYPE_EVENT_DATA_RENDERING_MODE_CHANGED_EXT: {
		auto *e = reinterpret_cast<const XrEventDataRenderingModeChangedEXT *>(&evt);
		LOG_I("RENDERING_MODE_CHANGED previous=%u current=%u", e->previousModeIndex,
		      e->currentModeIndex);
		log_current_view_config(b, "mode-change");
	} break;

	case XR_TYPE_EVENT_DATA_HARDWARE_DISPLAY_STATE_CHANGED_EXT: {
		LOG_I("HARDWARE_DISPLAY_STATE_CHANGED_EXT (physical 3D state flipped)");
	} break;

	default:
		LOG_I("event type=%d (unhandled)", (int)evt.type);
		break;
	}
}

static void run_event_loop(Bridge &b) {
	LOG_I("Entering event loop. Ctrl+C to exit.");
	while (g_running.load()) {
		XrEventDataBuffer evt{XR_TYPE_EVENT_DATA_BUFFER};
		XrResult r = xrPollEvent(b.instance, &evt);
		if (r == XR_SUCCESS) {
			handle_event(b, evt);
		} else if (r == XR_EVENT_UNAVAILABLE) {
			Sleep(10);
		} else {
			LOG_W("xrPollEvent error: %s", xr_result_str(b.instance, r));
			Sleep(100);
		}
	}
}

// ---------------------------------------------------------------------------
// Entry point.
// ---------------------------------------------------------------------------

int main() {
	SetConsoleCtrlHandler(console_ctrl_handler, TRUE);

	LOG_I("=== DisplayXR WebXR Bridge v2 — host (Phase 1) ===");
	LOG_I("Metadata sideband only; frames stay on Chrome's native WebXR path.");

	// Must run before any runtime DLL call so env propagates to the loader.
	force_ipc_mode_env();

	Bridge b;

	if (!create_instance(b)) {
		LOG_E("xrCreateInstance failed in IPC mode — is displayxr-service running?");
		LOG_E("  Start Chrome WebXR (Enter VR) first so the service is up, then re-run.");
		return 1;
	}
	if (!get_system_and_display_info(b)) {
		if (b.instance != XR_NULL_HANDLE)
			xrDestroyInstance(b.instance);
		return 1;
	}
	if (!create_session_and_enumerate_modes(b)) {
		if (b.session != XR_NULL_HANDLE)
			xrDestroySession(b.session);
		if (b.instance != XR_NULL_HANDLE)
			xrDestroyInstance(b.instance);
		return 1;
	}

	run_event_loop(b);

	LOG_I("Shutting down...");
	if (b.session != XR_NULL_HANDLE) {
		xrDestroySession(b.session);
	}
	if (b.instance != XR_NULL_HANDLE) {
		xrDestroyInstance(b.instance);
	}
	LOG_I("Bye.");
	return 0;
}
