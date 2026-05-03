// Phase 2 PoC: cross-process ID3D11Fence on the active D3D11 adapter.
//
// Validates the gating assumption for the workspace-sync-fence work in
// docs/roadmap/shell-optimization-plan.md: that ID3D11Device5::CreateFence
// with D3D11_FENCE_FLAG_SHARED produces an NT handle which a separate
// process can OpenSharedFence + observe via GetCompletedValue (and queue
// GPU-side waits on).
//
// Tries D3D11_FENCE_FLAG_SHARED | _SHARED_CROSS_ADAPTER first; if that
// fails (some adapters reject _CROSS_ADAPTER) falls back to plain SHARED
// — same-adapter is fine for this app since service + clients always run
// on the same machine + GPU as the Leia SR display.
//
// Build + run: scripts\poc_shared_fence.bat
//
// Throwaway PoC. Do NOT bundle into the runtime.

#include <windows.h>
#include <d3d11_4.h>
#include <wrl/client.h>
#include <stdio.h>
#include <string.h>

using Microsoft::WRL::ComPtr;

#define CHECK(hr, msg)                                                                                                 \
	do {                                                                                                           \
		if (FAILED(hr)) {                                                                                      \
			fprintf(stderr, "FAIL %s hr=0x%08lX\n", msg, (long)(hr));                                      \
			return 1;                                                                                      \
		}                                                                                                      \
	} while (0)

static int
run_child(HANDLE fence_handle)
{
	ComPtr<ID3D11Device> dev;
	ComPtr<ID3D11DeviceContext> ctx;
	D3D_FEATURE_LEVEL fl;
	D3D_FEATURE_LEVEL want = D3D_FEATURE_LEVEL_11_1;
	HRESULT hr = D3D11CreateDevice(nullptr, D3D_DRIVER_TYPE_HARDWARE, nullptr, 0, &want, 1, D3D11_SDK_VERSION,
	                               dev.GetAddressOf(), &fl, ctx.GetAddressOf());
	CHECK(hr, "child D3D11CreateDevice");

	ComPtr<ID3D11Device5> dev5;
	hr = dev.As(&dev5);
	CHECK(hr, "child QI ID3D11Device5");

	ComPtr<ID3D11Fence> fence;
	hr = dev5->OpenSharedFence(fence_handle, IID_PPV_ARGS(&fence));
	CHECK(hr, "child OpenSharedFence");
	printf("[child] OpenSharedFence OK\n");

	// Spin-poll GetCompletedValue until parent advances past 3.
	for (int i = 0; i < 50; ++i) {
		UINT64 v = fence->GetCompletedValue();
		printf("[child] GetCompletedValue = %llu\n", (unsigned long long)v);
		if (v >= 3) {
			printf("[child] PASS — fence advanced cross-process.\n");
			return 0;
		}
		Sleep(100);
	}
	fprintf(stderr, "[child] TIMEOUT — fence never reached value 3\n");
	return 2;
}

static int
run_parent(void)
{
	ComPtr<ID3D11Device> dev;
	ComPtr<ID3D11DeviceContext> ctx;
	D3D_FEATURE_LEVEL fl;
	D3D_FEATURE_LEVEL want = D3D_FEATURE_LEVEL_11_1;
	HRESULT hr = D3D11CreateDevice(nullptr, D3D_DRIVER_TYPE_HARDWARE, nullptr, 0, &want, 1, D3D11_SDK_VERSION,
	                               dev.GetAddressOf(), &fl, ctx.GetAddressOf());
	CHECK(hr, "parent D3D11CreateDevice");

	ComPtr<ID3D11Device5> dev5;
	hr = dev.As(&dev5);
	CHECK(hr, "parent QI ID3D11Device5");

	// Try _CROSS_ADAPTER first; fall back to plain SHARED.
	ComPtr<ID3D11Fence> fence;
	UINT flags_cross = D3D11_FENCE_FLAG_SHARED | D3D11_FENCE_FLAG_SHARED_CROSS_ADAPTER;
	hr = dev5->CreateFence(0, (D3D11_FENCE_FLAG)flags_cross, IID_PPV_ARGS(&fence));
	bool cross_adapter = SUCCEEDED(hr);
	if (!cross_adapter) {
		printf("[parent] CreateFence(_CROSS_ADAPTER) failed (hr=0x%08lX); retrying SHARED-only.\n", (long)hr);
		hr = dev5->CreateFence(0, D3D11_FENCE_FLAG_SHARED, IID_PPV_ARGS(&fence));
		CHECK(hr, "parent CreateFence(SHARED)");
	}
	printf("[parent] CreateFence OK (cross_adapter=%d)\n", cross_adapter ? 1 : 0);

	SECURITY_ATTRIBUTES sa{};
	sa.nLength = sizeof(sa);
	sa.bInheritHandle = TRUE;
	HANDLE h = nullptr;
	hr = fence->CreateSharedHandle(&sa, GENERIC_ALL, nullptr, &h);
	CHECK(hr, "parent CreateSharedHandle");
	printf("[parent] CreateSharedHandle OK handle=%p\n", h);

	char self_path[MAX_PATH];
	GetModuleFileNameA(nullptr, self_path, MAX_PATH);

	char cmdline[1024];
	snprintf(cmdline, sizeof(cmdline), "\"%s\" --child %llu", self_path, (unsigned long long)(uintptr_t)h);

	STARTUPINFOA si{};
	si.cb = sizeof(si);
	PROCESS_INFORMATION pi{};
	if (!CreateProcessA(nullptr, cmdline, nullptr, nullptr, TRUE, 0, nullptr, nullptr, &si, &pi)) {
		fprintf(stderr, "[parent] CreateProcess failed err=%lu\n", GetLastError());
		return 1;
	}
	printf("[parent] spawned child pid=%lu cmdline='%s'\n", pi.dwProcessId, cmdline);

	ComPtr<ID3D11DeviceContext4> ctx4;
	hr = ctx.As(&ctx4);
	CHECK(hr, "parent QI ID3D11DeviceContext4");

	for (UINT64 v = 1; v <= 3; ++v) {
		Sleep(200);
		hr = ctx4->Signal(fence.Get(), v);
		CHECK(hr, "parent Signal");
		ctx->Flush();
		printf("[parent] Signal(%llu) queued + Flushed.\n", (unsigned long long)v);
	}

	WaitForSingleObject(pi.hProcess, 30000);
	DWORD exit_code = 1;
	GetExitCodeProcess(pi.hProcess, &exit_code);
	CloseHandle(pi.hProcess);
	CloseHandle(pi.hThread);
	CloseHandle(h);

	if (exit_code == 0) {
		printf("[parent] PASS — Phase 2 fence path supported (cross_adapter=%d)\n", cross_adapter ? 1 : 0);
		return 0;
	}
	fprintf(stderr, "[parent] FAIL — child exit=%lu\n", exit_code);
	return (int)exit_code;
}

int
main(int argc, char **argv)
{
	if (argc >= 3 && strcmp(argv[1], "--child") == 0) {
		unsigned long long v = strtoull(argv[2], nullptr, 10);
		return run_child((HANDLE)(uintptr_t)v);
	}
	return run_parent();
}
