// Copyright 2026, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Shell-side OpenXR scaffolding (Phase 2.I) implementation.
 */

// d3d11.h must come before openxr_platform.h so the platform header sees
// ID3D11Device and emits XrGraphicsBindingD3D11KHR / requirements types.
// shell_openxr.h pulls only core + extension headers; the D3D11 bindings
// are private to this TU.
#define WIN32_LEAN_AND_MEAN
#include <Unknwn.h>
#include <windows.h>
#include <d3d11.h>
#include <dxgi1_2.h>
#include <wrl/client.h>

#define XR_USE_GRAPHICS_API_D3D11
#include <openxr/openxr_platform.h>

#include "shell_openxr.h"

#include <cstdio>
#include <cstring>
#include <cstdlib>

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

// Internal owner that combines the public state struct (which the
// caller sees) with the C++ COM smart pointers that hold the D3D11
// device. The two cannot live in shell_openxr_state because that struct
// is referenced from pure-C translation units and ComPtr is C++-only.
struct shell_openxr_owner
{
	shell_openxr_state          state{};
	ComPtr<ID3D11Device>        d3d11_device;
	ComPtr<ID3D11DeviceContext> d3d11_context;
};

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

extern "C" struct shell_openxr_state *shell_openxr_init(void)
{
	auto *owner = new (std::nothrow) shell_openxr_owner();
	if (owner == nullptr) {
		return nullptr;
	}
	shell_openxr_state &s = owner->state;

	// The hybrid runtime auto-selects between in-process native compositor
	// and IPC mode based on env vars (see u_sandbox.c). The workspace
	// extension requires IPC mode — the controller talks to the service
	// over IPC. Force IPC for our own session via XRT_FORCE_MODE because
	// u_sandbox.c reads that one through both getenv() and
	// GetEnvironmentVariableA(), so it sees the value even though the
	// runtime DLL has its own static CRT and would miss SetEnvironmentVariableA
	// updates to DISPLAYXR_WORKSPACE_SESSION via getenv().
	SetEnvironmentVariableA("XRT_FORCE_MODE", "ipc");

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

	XrResult r = xrCreateInstance(&ci, &s.instance);
	if (XR_FAILED(r)) {
		PE("shell_openxr: xrCreateInstance failed: %s\n", xr_result_str(r));
		shell_openxr_shutdown(&s);
		return nullptr;
	}

	XrSystemGetInfo sgi = {XR_TYPE_SYSTEM_GET_INFO};
	sgi.formFactor = XR_FORM_FACTOR_HEAD_MOUNTED_DISPLAY;
	r = xrGetSystem(s.instance, &sgi, &s.system_id);
	if (XR_FAILED(r)) {
		PE("shell_openxr: xrGetSystem failed: %s\n", xr_result_str(r));
		shell_openxr_shutdown(&s);
		return nullptr;
	}

	PFN_xrGetD3D11GraphicsRequirementsKHR pfnGfxReq = nullptr;
	r = xrGetInstanceProcAddr(s.instance, "xrGetD3D11GraphicsRequirementsKHR",
	                          reinterpret_cast<PFN_xrVoidFunction *>(&pfnGfxReq));
	if (XR_FAILED(r) || pfnGfxReq == nullptr) {
		PE("shell_openxr: xrGetD3D11GraphicsRequirementsKHR resolve failed: %s\n", xr_result_str(r));
		shell_openxr_shutdown(&s);
		return nullptr;
	}
	XrGraphicsRequirementsD3D11KHR gfxReq = {XR_TYPE_GRAPHICS_REQUIREMENTS_D3D11_KHR};
	r = pfnGfxReq(s.instance, s.system_id, &gfxReq);
	if (XR_FAILED(r)) {
		PE("shell_openxr: get graphics requirements failed: %s\n", xr_result_str(r));
		shell_openxr_shutdown(&s);
		return nullptr;
	}

	if (!create_d3d11(gfxReq, owner->d3d11_device, owner->d3d11_context)) {
		shell_openxr_shutdown(&s);
		return nullptr;
	}

	XrGraphicsBindingD3D11KHR gfxBinding = {XR_TYPE_GRAPHICS_BINDING_D3D11_KHR};
	gfxBinding.device = owner->d3d11_device.Get();
	XrSessionCreateInfo sci = {XR_TYPE_SESSION_CREATE_INFO};
	sci.next = &gfxBinding;
	sci.systemId = s.system_id;
	r = xrCreateSession(s.instance, &sci, &s.session);
	if (XR_FAILED(r)) {
		PE("shell_openxr: xrCreateSession failed: %s\n", xr_result_str(r));
		shell_openxr_shutdown(&s);
		return nullptr;
	}

	struct PfnEntry {
		const char *name;
		PFN_xrVoidFunction *out;
	};
	PfnEntry entries[] = {
	    {"xrActivateSpatialWorkspaceEXT",      reinterpret_cast<PFN_xrVoidFunction *>(&s.activate)},
	    {"xrDeactivateSpatialWorkspaceEXT",    reinterpret_cast<PFN_xrVoidFunction *>(&s.deactivate)},
	    {"xrGetSpatialWorkspaceStateEXT",      reinterpret_cast<PFN_xrVoidFunction *>(&s.get_state)},
	    {"xrAddWorkspaceCaptureClientEXT",     reinterpret_cast<PFN_xrVoidFunction *>(&s.add_capture)},
	    {"xrRemoveWorkspaceCaptureClientEXT",  reinterpret_cast<PFN_xrVoidFunction *>(&s.remove_capture)},
	    {"xrSetWorkspaceClientWindowPoseEXT",  reinterpret_cast<PFN_xrVoidFunction *>(&s.set_pose)},
	    {"xrCaptureWorkspaceFrameEXT",         reinterpret_cast<PFN_xrVoidFunction *>(&s.capture_frame)},
	    {"xrClearLauncherAppsEXT",             reinterpret_cast<PFN_xrVoidFunction *>(&s.clear_launcher)},
	    {"xrAddLauncherAppEXT",                reinterpret_cast<PFN_xrVoidFunction *>(&s.add_launcher_app)},
	    {"xrSetLauncherVisibleEXT",            reinterpret_cast<PFN_xrVoidFunction *>(&s.set_launcher_visible)},
	    {"xrPollLauncherClickEXT",             reinterpret_cast<PFN_xrVoidFunction *>(&s.poll_launcher_click)},
	    {"xrSetLauncherRunningTileMaskEXT",    reinterpret_cast<PFN_xrVoidFunction *>(&s.set_running_tile_mask)},
	    {"xrSetWorkspaceFocusedClientEXT",     reinterpret_cast<PFN_xrVoidFunction *>(&s.set_focused)},
	    {"xrEnumerateWorkspaceClientsEXT",     reinterpret_cast<PFN_xrVoidFunction *>(&s.enumerate_clients)},
	    {"xrGetWorkspaceClientInfoEXT",        reinterpret_cast<PFN_xrVoidFunction *>(&s.get_client_info)},
	};
	for (const auto &e : entries) {
		if (!resolve_pfn(s.instance, e.name, e.out)) {
			shell_openxr_shutdown(&s);
			return nullptr;
		}
	}

	P("shell_openxr: instance=%p session=%p (15 PFNs resolved)\n",
	  (void *)s.instance, (void *)s.session);
	return &owner->state;
}

extern "C" void shell_openxr_shutdown(struct shell_openxr_state *s)
{
	if (s == nullptr) {
		return;
	}
	// shell_openxr_state is the first field of shell_openxr_owner so the
	// pointer round-trips losslessly.
	auto *owner = reinterpret_cast<shell_openxr_owner *>(s);
	if (s->session != XR_NULL_HANDLE) {
		xrDestroySession(s->session);
		s->session = XR_NULL_HANDLE;
	}
	if (s->instance != XR_NULL_HANDLE) {
		xrDestroyInstance(s->instance);
		s->instance = XR_NULL_HANDLE;
	}
	delete owner;
}
