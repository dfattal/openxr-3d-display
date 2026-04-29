// Copyright 2026, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Shell-side OpenXR scaffolding (Phase 2.I) implementation.
 */

#include "shell_openxr.h"

#define WIN32_LEAN_AND_MEAN
#include <Unknwn.h>
#include <windows.h>
#include <d3d11.h>
#include <dxgi1_2.h>
#include <wrl/client.h>

#define XR_USE_GRAPHICS_API_D3D11
#include <openxr/openxr.h>
#include <openxr/openxr_platform.h>
#include <openxr/XR_EXT_spatial_workspace.h>
#include <openxr/XR_EXT_app_launcher.h>

#include <cstdio>
#include <cstring>

using Microsoft::WRL::ComPtr;

#define P(...)  std::printf(__VA_ARGS__)
#define PE(...) std::fprintf(stderr, __VA_ARGS__)

namespace {

const char *xr_result_str(XrResult r)
{
	switch (r) {
	case XR_SUCCESS: return "XR_SUCCESS";
	case XR_ERROR_VALIDATION_FAILURE: return "XR_ERROR_VALIDATION_FAILURE";
	case XR_ERROR_RUNTIME_FAILURE: return "XR_ERROR_RUNTIME_FAILURE";
	case XR_ERROR_FEATURE_UNSUPPORTED: return "XR_ERROR_FEATURE_UNSUPPORTED";
	case XR_ERROR_FUNCTION_UNSUPPORTED: return "XR_ERROR_FUNCTION_UNSUPPORTED";
	case XR_ERROR_LIMIT_REACHED: return "XR_ERROR_LIMIT_REACHED";
	default: return "(other)";
	}
}

} // namespace

struct shell_openxr
{
	ComPtr<ID3D11Device>        d3d11_device;
	ComPtr<ID3D11DeviceContext> d3d11_context;

	XrInstance  instance = XR_NULL_HANDLE;
	XrSystemId  system_id = XR_NULL_SYSTEM_ID;
	XrSession   session = XR_NULL_HANDLE;

	// All PFNs the shell calls. Unused PFNs (e.g. hit-test, input drain,
	// pointer capture) are intentionally not resolved — the shell does not
	// need them in this migration.
	PFN_xrActivateSpatialWorkspaceEXT      activate = nullptr;
	PFN_xrDeactivateSpatialWorkspaceEXT    deactivate = nullptr;
	PFN_xrGetSpatialWorkspaceStateEXT      get_state = nullptr;
	PFN_xrAddWorkspaceCaptureClientEXT     add_capture = nullptr;
	PFN_xrRemoveWorkspaceCaptureClientEXT  remove_capture = nullptr;
	PFN_xrSetWorkspaceClientWindowPoseEXT  set_pose = nullptr;
	PFN_xrCaptureWorkspaceFrameEXT         capture_frame = nullptr;
	PFN_xrClearLauncherAppsEXT             clear_launcher = nullptr;
	PFN_xrAddLauncherAppEXT                add_launcher_app = nullptr;
	PFN_xrSetLauncherVisibleEXT            set_launcher_visible = nullptr;
	PFN_xrPollLauncherClickEXT             poll_launcher_click = nullptr;
	PFN_xrSetLauncherRunningTileMaskEXT    set_running_tile_mask = nullptr;
	PFN_xrSetWorkspaceFocusedClientEXT     set_focused = nullptr;
	PFN_xrEnumerateWorkspaceClientsEXT     enumerate_clients = nullptr;
	PFN_xrGetWorkspaceClientInfoEXT        get_client_info = nullptr;
};

namespace {

bool resolve_pfn(XrInstance instance, const char *name, PFN_xrVoidFunction *out)
{
	XrResult r = xrGetInstanceProcAddr(instance, name, out);
	if (XR_FAILED(r) || *out == nullptr) {
		PE("shell_openxr: xrGetInstanceProcAddr(%s) failed: %s\n", name, xr_result_str(r));
		return false;
	}
	return true;
}

bool create_d3d11(XrGraphicsRequirementsD3D11KHR &req, ComPtr<ID3D11Device> &device,
                  ComPtr<ID3D11DeviceContext> &ctx)
{
	ComPtr<IDXGIFactory1> factory;
	if (FAILED(CreateDXGIFactory1(IID_PPV_ARGS(factory.GetAddressOf())))) {
		PE("shell_openxr: CreateDXGIFactory1 failed\n");
		return false;
	}

	ComPtr<IDXGIAdapter1> adapter;
	for (UINT i = 0; factory->EnumAdapters1(i, adapter.ReleaseAndGetAddressOf()) == S_OK; ++i) {
		DXGI_ADAPTER_DESC1 desc = {};
		adapter->GetDesc1(&desc);
		if (std::memcmp(&desc.AdapterLuid, &req.adapterLuid, sizeof(LUID)) == 0) {
			break;
		}
		adapter.Reset();
	}
	if (!adapter) {
		factory->EnumAdapters1(0, adapter.ReleaseAndGetAddressOf());
	}

	D3D_FEATURE_LEVEL levels[] = {
	    D3D_FEATURE_LEVEL_11_1, D3D_FEATURE_LEVEL_11_0,
	    D3D_FEATURE_LEVEL_10_1, D3D_FEATURE_LEVEL_10_0,
	};
	D3D_FEATURE_LEVEL got = D3D_FEATURE_LEVEL_11_0;
	HRESULT hr = D3D11CreateDevice(adapter.Get(), adapter ? D3D_DRIVER_TYPE_UNKNOWN : D3D_DRIVER_TYPE_HARDWARE,
	                               nullptr, 0, levels, _countof(levels), D3D11_SDK_VERSION,
	                               device.GetAddressOf(), &got, ctx.GetAddressOf());
	if (FAILED(hr)) {
		PE("shell_openxr: D3D11CreateDevice failed (hr=0x%08lx)\n", (long)hr);
		return false;
	}
	return true;
}

} // namespace

extern "C" struct shell_openxr *shell_openxr_init(void)
{
	auto *s = new (std::nothrow) shell_openxr();
	if (s == nullptr) {
		return nullptr;
	}

	// 1. Create instance with the two extensions plus the D3D11 enable.
	const char *exts[] = {
	    XR_EXT_SPATIAL_WORKSPACE_EXTENSION_NAME,
	    XR_EXT_APP_LAUNCHER_EXTENSION_NAME,
	    XR_KHR_D3D11_ENABLE_EXTENSION_NAME,
	};
	XrInstanceCreateInfo ci = {XR_TYPE_INSTANCE_CREATE_INFO};
	std::snprintf(ci.applicationInfo.applicationName, sizeof(ci.applicationInfo.applicationName),
	              "displayxr-shell");
	ci.applicationInfo.applicationVersion = 1;
	std::snprintf(ci.applicationInfo.engineName, sizeof(ci.applicationInfo.engineName), "displayxr-shell");
	ci.applicationInfo.engineVersion = 1;
	ci.applicationInfo.apiVersion = XR_API_VERSION_1_0;
	ci.enabledExtensionCount = (uint32_t)(sizeof(exts) / sizeof(exts[0]));
	ci.enabledExtensionNames = exts;

	XrResult r = xrCreateInstance(&ci, &s->instance);
	if (XR_FAILED(r)) {
		PE("shell_openxr: xrCreateInstance failed: %s\n", xr_result_str(r));
		shell_openxr_shutdown(s);
		return nullptr;
	}

	// 2. Get the system + D3D11 graphics requirements.
	XrSystemGetInfo sgi = {XR_TYPE_SYSTEM_GET_INFO};
	sgi.formFactor = XR_FORM_FACTOR_HEAD_MOUNTED_DISPLAY;
	r = xrGetSystem(s->instance, &sgi, &s->system_id);
	if (XR_FAILED(r)) {
		PE("shell_openxr: xrGetSystem failed: %s\n", xr_result_str(r));
		shell_openxr_shutdown(s);
		return nullptr;
	}

	PFN_xrGetD3D11GraphicsRequirementsKHR pfnGfxReq = nullptr;
	r = xrGetInstanceProcAddr(s->instance, "xrGetD3D11GraphicsRequirementsKHR",
	                          reinterpret_cast<PFN_xrVoidFunction *>(&pfnGfxReq));
	if (XR_FAILED(r) || pfnGfxReq == nullptr) {
		PE("shell_openxr: xrGetD3D11GraphicsRequirementsKHR resolve failed: %s\n", xr_result_str(r));
		shell_openxr_shutdown(s);
		return nullptr;
	}
	XrGraphicsRequirementsD3D11KHR gfxReq = {XR_TYPE_GRAPHICS_REQUIREMENTS_D3D11_KHR};
	r = pfnGfxReq(s->instance, s->system_id, &gfxReq);
	if (XR_FAILED(r)) {
		PE("shell_openxr: get graphics requirements failed: %s\n", xr_result_str(r));
		shell_openxr_shutdown(s);
		return nullptr;
	}

	// 3. Create a minimal D3D11 device. The shell does not render
	//    swapchains; the binding exists only to satisfy
	//    oxr_session_create_impl's validation of createInfo->next.
	if (!create_d3d11(gfxReq, s->d3d11_device, s->d3d11_context)) {
		shell_openxr_shutdown(s);
		return nullptr;
	}

	// 4. Create the session bound to the D3D11 device.
	XrGraphicsBindingD3D11KHR gfxBinding = {XR_TYPE_GRAPHICS_BINDING_D3D11_KHR};
	gfxBinding.device = s->d3d11_device.Get();
	XrSessionCreateInfo sci = {XR_TYPE_SESSION_CREATE_INFO};
	sci.next = &gfxBinding;
	sci.systemId = s->system_id;
	r = xrCreateSession(s->instance, &sci, &s->session);
	if (XR_FAILED(r)) {
		PE("shell_openxr: xrCreateSession failed: %s\n", xr_result_str(r));
		shell_openxr_shutdown(s);
		return nullptr;
	}

	// 5. Resolve the PFNs the shell will dispatch through. Failure of any
	//    is a hard error — the runtime promised these by enabling the
	//    extension.
	struct PfnEntry {
		const char *name;
		PFN_xrVoidFunction *out;
	};
	PfnEntry entries[] = {
	    {"xrActivateSpatialWorkspaceEXT",      reinterpret_cast<PFN_xrVoidFunction *>(&s->activate)},
	    {"xrDeactivateSpatialWorkspaceEXT",    reinterpret_cast<PFN_xrVoidFunction *>(&s->deactivate)},
	    {"xrGetSpatialWorkspaceStateEXT",      reinterpret_cast<PFN_xrVoidFunction *>(&s->get_state)},
	    {"xrAddWorkspaceCaptureClientEXT",     reinterpret_cast<PFN_xrVoidFunction *>(&s->add_capture)},
	    {"xrRemoveWorkspaceCaptureClientEXT",  reinterpret_cast<PFN_xrVoidFunction *>(&s->remove_capture)},
	    {"xrSetWorkspaceClientWindowPoseEXT",  reinterpret_cast<PFN_xrVoidFunction *>(&s->set_pose)},
	    {"xrCaptureWorkspaceFrameEXT",         reinterpret_cast<PFN_xrVoidFunction *>(&s->capture_frame)},
	    {"xrClearLauncherAppsEXT",             reinterpret_cast<PFN_xrVoidFunction *>(&s->clear_launcher)},
	    {"xrAddLauncherAppEXT",                reinterpret_cast<PFN_xrVoidFunction *>(&s->add_launcher_app)},
	    {"xrSetLauncherVisibleEXT",            reinterpret_cast<PFN_xrVoidFunction *>(&s->set_launcher_visible)},
	    {"xrPollLauncherClickEXT",             reinterpret_cast<PFN_xrVoidFunction *>(&s->poll_launcher_click)},
	    {"xrSetLauncherRunningTileMaskEXT",    reinterpret_cast<PFN_xrVoidFunction *>(&s->set_running_tile_mask)},
	    {"xrSetWorkspaceFocusedClientEXT",     reinterpret_cast<PFN_xrVoidFunction *>(&s->set_focused)},
	    {"xrEnumerateWorkspaceClientsEXT",     reinterpret_cast<PFN_xrVoidFunction *>(&s->enumerate_clients)},
	    {"xrGetWorkspaceClientInfoEXT",        reinterpret_cast<PFN_xrVoidFunction *>(&s->get_client_info)},
	};
	for (const auto &e : entries) {
		if (!resolve_pfn(s->instance, e.name, e.out)) {
			shell_openxr_shutdown(s);
			return nullptr;
		}
	}

	P("shell_openxr: instance=%p session=%p (15 PFNs resolved)\n",
	  (void *)s->instance, (void *)s->session);
	return s;
}

extern "C" void shell_openxr_shutdown(struct shell_openxr *s)
{
	if (s == nullptr) {
		return;
	}
	if (s->session != XR_NULL_HANDLE) {
		xrDestroySession(s->session);
		s->session = XR_NULL_HANDLE;
	}
	if (s->instance != XR_NULL_HANDLE) {
		xrDestroyInstance(s->instance);
		s->instance = XR_NULL_HANDLE;
	}
	delete s;
}

extern "C" void *shell_openxr_session(struct shell_openxr *s)              { return s ? (void *)s->session : nullptr; }
extern "C" void *shell_openxr_pfn_activate(struct shell_openxr *s)         { return s ? (void *)s->activate : nullptr; }
extern "C" void *shell_openxr_pfn_deactivate(struct shell_openxr *s)       { return s ? (void *)s->deactivate : nullptr; }
extern "C" void *shell_openxr_pfn_get_state(struct shell_openxr *s)        { return s ? (void *)s->get_state : nullptr; }
extern "C" void *shell_openxr_pfn_add_capture(struct shell_openxr *s)      { return s ? (void *)s->add_capture : nullptr; }
extern "C" void *shell_openxr_pfn_remove_capture(struct shell_openxr *s)   { return s ? (void *)s->remove_capture : nullptr; }
extern "C" void *shell_openxr_pfn_set_pose(struct shell_openxr *s)         { return s ? (void *)s->set_pose : nullptr; }
extern "C" void *shell_openxr_pfn_capture_frame(struct shell_openxr *s)    { return s ? (void *)s->capture_frame : nullptr; }
extern "C" void *shell_openxr_pfn_clear_launcher(struct shell_openxr *s)   { return s ? (void *)s->clear_launcher : nullptr; }
extern "C" void *shell_openxr_pfn_add_launcher_app(struct shell_openxr *s) { return s ? (void *)s->add_launcher_app : nullptr; }
extern "C" void *shell_openxr_pfn_set_launcher_visible(struct shell_openxr *s)  { return s ? (void *)s->set_launcher_visible : nullptr; }
extern "C" void *shell_openxr_pfn_poll_launcher_click(struct shell_openxr *s)   { return s ? (void *)s->poll_launcher_click : nullptr; }
extern "C" void *shell_openxr_pfn_set_running_tile_mask(struct shell_openxr *s) { return s ? (void *)s->set_running_tile_mask : nullptr; }
extern "C" void *shell_openxr_pfn_set_focused(struct shell_openxr *s)      { return s ? (void *)s->set_focused : nullptr; }
extern "C" void *shell_openxr_pfn_enumerate_clients(struct shell_openxr *s){ return s ? (void *)s->enumerate_clients : nullptr; }
extern "C" void *shell_openxr_pfn_get_client_info(struct shell_openxr *s)  { return s ? (void *)s->get_client_info : nullptr; }
