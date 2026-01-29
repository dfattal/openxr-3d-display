// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  SR Cube OpenXR Ext D3D12 - OpenXR with XR_EXT_session_target (D3D12)
 *
 * D3D12 port of sr_cube_openxr_ext. Projection layer only, no HUD/quad layer.
 */

#define WIN32_LEAN_AND_MEAN
#define UNICODE
#define _UNICODE
#include <windows.h>

#include "logging.h"
#include "input_handler.h"
#include "xr_session.h"
#include "d3d12_renderer.h"
#include "hud_renderer.h"

#include <atomic>
#include <chrono>
#include <mutex>
#include <string>
#include <thread>
#include <vector>
#include <wrl/client.h>

using namespace DirectX;
using Microsoft::WRL::ComPtr;

static const char* APP_NAME = "sr_cube_openxr_ext_d3d12";

static const wchar_t* WINDOW_CLASS = L"SRCubeOpenXRExtD3D12Class";
static const wchar_t* WINDOW_TITLE = L"SR Cube OpenXR Ext D3D12 (Press ESC to exit)";

// Global state (shared between main thread and render thread)
static InputState g_inputState;
static std::mutex g_inputMutex;
static std::atomic<bool> g_running{true};
static UINT g_windowWidth = 1280;
static UINT g_windowHeight = 720;

LRESULT CALLBACK WindowProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    {
        std::lock_guard<std::mutex> lock(g_inputMutex);
        UpdateInputState(g_inputState, msg, wParam, lParam);
    }

    switch (msg) {
    case WM_SIZE:
        if (wParam != SIZE_MINIMIZED) {
            std::lock_guard<std::mutex> lock(g_inputMutex);
            g_windowWidth = LOWORD(lParam);
            g_windowHeight = HIWORD(lParam);
        }
        return 0;

    case WM_CLOSE:
        g_running.store(false);
        PostQuitMessage(0);
        return 0;

    case WM_KEYDOWN:
        if (wParam == VK_ESCAPE) {
            g_running.store(false);
            PostQuitMessage(0);
            return 0;
        }
        break;
    }

    return DefWindowProc(hwnd, msg, wParam, lParam);
}

static HWND CreateAppWindow(HINSTANCE hInstance, int width, int height) {
    LOG_INFO("Creating application window (%dx%d)", width, height);

    WNDCLASSEX wc = {};
    wc.cbSize = sizeof(WNDCLASSEX);
    wc.style = CS_HREDRAW | CS_VREDRAW | CS_DBLCLKS;
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = hInstance;
    wc.hCursor = LoadCursor(nullptr, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)GetStockObject(BLACK_BRUSH);
    wc.lpszClassName = WINDOW_CLASS;

    if (!RegisterClassEx(&wc)) {
        DWORD err = GetLastError();
        if (err != ERROR_CLASS_ALREADY_EXISTS) {
            LOG_ERROR("Failed to register window class, error: %lu", err);
            return nullptr;
        }
    }

    RECT rect = { 0, 0, width, height };
    AdjustWindowRect(&rect, WS_OVERLAPPEDWINDOW, FALSE);

    HWND hwnd = CreateWindowEx(0, WINDOW_CLASS, WINDOW_TITLE, WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT,
        rect.right - rect.left, rect.bottom - rect.top,
        nullptr, nullptr, hInstance, nullptr);

    if (!hwnd) {
        LOG_ERROR("Failed to create window, error: %lu", GetLastError());
        return nullptr;
    }

    LOG_INFO("Window created: 0x%p", hwnd);
    return hwnd;
}

struct PerformanceStats {
    std::chrono::high_resolution_clock::time_point lastTime;
    float deltaTime = 0.0f;
    float fps = 0.0f;
    float frameTimeMs = 0.0f;
    int frameCount = 0;
    float fpsAccumulator = 0.0f;
};

static void UpdatePerformanceStats(PerformanceStats& stats) {
    auto now = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::microseconds>(now - stats.lastTime);
    stats.deltaTime = duration.count() / 1000000.0f;
    stats.frameTimeMs = duration.count() / 1000.0f;
    stats.lastTime = now;
    stats.fpsAccumulator += stats.deltaTime;
    stats.frameCount++;
    if (stats.fpsAccumulator >= 1.0f) {
        stats.fps = stats.frameCount / stats.fpsAccumulator;
        stats.frameCount = 0;
        stats.fpsAccumulator = 0.0f;
    }
}

static void RenderThreadFunc(
    HWND hwnd,
    XrSessionManager* xr,
    D3D12Renderer* renderer,
    std::vector<XrSwapchainImageD3D12KHR>* swapchainImages,
    int* rtvBaseIndex,
    HudRenderer* hud,
    uint32_t hudWidth,
    uint32_t hudHeight,
    ID3D12Resource* hudUploadBuffer,
    uint32_t hudUploadRowPitch)
{
    LOG_INFO("[RenderThread] Started");

    PerformanceStats perfStats = {};
    perfStats.lastTime = std::chrono::high_resolution_clock::now();

    while (g_running.load() && !xr->exitRequested) {
        InputState inputSnapshot;
        bool resetRequested = false;
        {
            std::lock_guard<std::mutex> lock(g_inputMutex);
            inputSnapshot = g_inputState;
            resetRequested = g_inputState.resetViewRequested;
            g_inputState.resetViewRequested = false;
            g_inputState.fullscreenToggleRequested = false;
        }

        UpdatePerformanceStats(perfStats);
        UpdateCameraMovement(inputSnapshot, perfStats.deltaTime);

        {
            std::lock_guard<std::mutex> lock(g_inputMutex);
            g_inputState.cameraPosX = inputSnapshot.cameraPosX;
            g_inputState.cameraPosY = inputSnapshot.cameraPosY;
            g_inputState.cameraPosZ = inputSnapshot.cameraPosZ;
            if (resetRequested) {
                g_inputState.yaw = inputSnapshot.yaw;
                g_inputState.pitch = inputSnapshot.pitch;
                g_inputState.zoomScale = inputSnapshot.zoomScale;
            }
        }

        UpdateScene(*renderer, perfStats.deltaTime);
        PollEvents(*xr);

        if (xr->sessionRunning) {
            XrFrameState frameState;
            if (BeginFrame(*xr, frameState)) {
                XrCompositionLayerProjectionView projectionViews[2] = {};

                if (frameState.shouldRender) {
                    XMMATRIX leftViewMatrix, leftProjMatrix;
                    XMMATRIX rightViewMatrix, rightProjMatrix;

                    if (LocateViews(*xr, frameState.predictedDisplayTime,
                        leftViewMatrix, leftProjMatrix,
                        rightViewMatrix, rightProjMatrix,
                        inputSnapshot.cameraPosX, inputSnapshot.cameraPosY, inputSnapshot.cameraPosZ,
                        inputSnapshot.yaw, inputSnapshot.pitch)) {

                        // Get raw view poses for projection views
                        XrViewLocateInfo locateInfo = {XR_TYPE_VIEW_LOCATE_INFO};
                        locateInfo.viewConfigurationType = xr->viewConfigType;
                        locateInfo.displayTime = frameState.predictedDisplayTime;
                        locateInfo.space = xr->localSpace;

                        XrViewState viewState = {XR_TYPE_VIEW_STATE};
                        uint32_t viewCount = 2;
                        XrView rawViews[2] = {{XR_TYPE_VIEW}, {XR_TYPE_VIEW}};
                        xrLocateViews(xr->session, &locateInfo, &viewState, 2, &viewCount, rawViews);

                        for (int eye = 0; eye < 2; eye++) {
                            uint32_t imageIndex;
                            if (AcquireSwapchainImage(*xr, eye, imageIndex)) {
                                ID3D12Resource* swapchainTexture = swapchainImages[eye][imageIndex].texture;

                                XMMATRIX viewMatrix = (eye == 0) ? leftViewMatrix : rightViewMatrix;
                                XMMATRIX projMatrix = (eye == 0) ? leftProjMatrix : rightProjMatrix;

                                int rtvIdx = rtvBaseIndex[eye] + (int)imageIndex;

                                RenderScene(*renderer, swapchainTexture, rtvIdx, eye,
                                    xr->swapchains[eye].width, xr->swapchains[eye].height,
                                    viewMatrix, projMatrix,
                                    inputSnapshot.zoomScale);

                                // Screen-space HUD: render text on eye 0, copy to both eyes
                                if (inputSnapshot.hudVisible && hud) {
                                    if (eye == 0) {
                                        std::wstring sessionText = L"Session: ";
                                        sessionText += FormatSessionState((int)xr->sessionState);
                                        std::wstring modeText = xr->hasSessionTargetExt ?
                                            L"XR_EXT_session_target: ACTIVE (D3D12)" :
                                            L"XR_EXT_session_target: NOT AVAILABLE (D3D12)";
                                        std::wstring perfText = FormatPerformanceInfo(perfStats.fps, perfStats.frameTimeMs,
                                            xr->swapchains[0].width, xr->swapchains[0].height);
                                        std::wstring eyeText = FormatEyeTrackingInfo(xr->eyePosX, xr->eyePosY, xr->eyePosZ, xr->eyeTrackingActive);

                                        uint32_t srcRowPitch = 0;
                                        const void* pixels = RenderHudAndMap(*hud, &srcRowPitch, sessionText, modeText, perfText, eyeText);
                                        if (pixels) {
                                            // Copy row-by-row to upload buffer (respect D3D12 alignment)
                                            uint8_t* dst = nullptr;
                                            D3D12_RANGE readRange = {0, 0};
                                            hudUploadBuffer->Map(0, &readRange, (void**)&dst);
                                            if (dst) {
                                                const uint8_t* src = (const uint8_t*)pixels;
                                                for (uint32_t row = 0; row < hudHeight; row++) {
                                                    memcpy(dst + row * hudUploadRowPitch, src + row * srcRowPitch, hudWidth * 4);
                                                }
                                                D3D12_RANGE writeRange = {0, (SIZE_T)(hudUploadRowPitch * hudHeight)};
                                                hudUploadBuffer->Unmap(0, &writeRange);
                                            }
                                            UnmapHud(*hud);
                                        }
                                    }

                                    // Copy upload buffer to swapchain texture top-left region
                                    // We need a separate command list for this copy
                                    renderer->commandAllocator->Reset();
                                    renderer->commandList->Reset(renderer->commandAllocator.Get(), nullptr);

                                    // Barrier: swapchain COMMON -> COPY_DEST
                                    D3D12_RESOURCE_BARRIER barrier = {};
                                    barrier.Type = D3D12_RESOURCE_BARRIER_TYPE_TRANSITION;
                                    barrier.Transition.pResource = swapchainTexture;
                                    barrier.Transition.StateBefore = D3D12_RESOURCE_STATE_COMMON;
                                    barrier.Transition.StateAfter = D3D12_RESOURCE_STATE_COPY_DEST;
                                    barrier.Transition.Subresource = D3D12_RESOURCE_BARRIER_ALL_SUBRESOURCES;
                                    renderer->commandList->ResourceBarrier(1, &barrier);

                                    // CopyTextureRegion from upload buffer to swapchain
                                    D3D12_TEXTURE_COPY_LOCATION srcLoc = {};
                                    srcLoc.pResource = hudUploadBuffer;
                                    srcLoc.Type = D3D12_TEXTURE_COPY_TYPE_PLACED_FOOTPRINT;
                                    srcLoc.PlacedFootprint.Offset = 0;
                                    srcLoc.PlacedFootprint.Footprint.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
                                    srcLoc.PlacedFootprint.Footprint.Width = hudWidth;
                                    srcLoc.PlacedFootprint.Footprint.Height = hudHeight;
                                    srcLoc.PlacedFootprint.Footprint.Depth = 1;
                                    srcLoc.PlacedFootprint.Footprint.RowPitch = hudUploadRowPitch;

                                    D3D12_TEXTURE_COPY_LOCATION dstLoc = {};
                                    dstLoc.pResource = swapchainTexture;
                                    dstLoc.Type = D3D12_TEXTURE_COPY_TYPE_SUBRESOURCE_INDEX;
                                    dstLoc.SubresourceIndex = 0;

                                    D3D12_BOX srcBox = {0, 0, 0, hudWidth, hudHeight, 1};
                                    renderer->commandList->CopyTextureRegion(&dstLoc, 0, 0, 0, &srcLoc, &srcBox);

                                    // Barrier: COPY_DEST -> COMMON
                                    barrier.Transition.StateBefore = D3D12_RESOURCE_STATE_COPY_DEST;
                                    barrier.Transition.StateAfter = D3D12_RESOURCE_STATE_COMMON;
                                    renderer->commandList->ResourceBarrier(1, &barrier);

                                    renderer->commandList->Close();
                                    ID3D12CommandList* cmdLists[] = {renderer->commandList.Get()};
                                    renderer->commandQueue->ExecuteCommandLists(1, cmdLists);

                                    // Wait for GPU
                                    WaitForGpu(*renderer);
                                }

                                ReleaseSwapchainImage(*xr, eye);

                                projectionViews[eye].type = XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW;
                                projectionViews[eye].subImage.swapchain = xr->swapchains[eye].swapchain;
                                projectionViews[eye].subImage.imageRect.offset = {0, 0};
                                projectionViews[eye].subImage.imageRect.extent = {
                                    (int32_t)xr->swapchains[eye].width,
                                    (int32_t)xr->swapchains[eye].height
                                };
                                projectionViews[eye].subImage.imageArrayIndex = 0;
                                projectionViews[eye].pose = rawViews[eye].pose;
                                projectionViews[eye].fov = rawViews[eye].fov;
                            }
                        }
                    }
                }

                EndFrame(*xr, frameState.predictedDisplayTime, projectionViews);
            }
        } else {
            Sleep(100);
        }
    }

    if (xr->exitRequested && g_running.load()) {
        PostMessage(hwnd, WM_CLOSE, 0, 0);
    }

    LOG_INFO("[RenderThread] Exiting");
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    (void)hPrevInstance;
    (void)lpCmdLine;

    if (!InitializeLogging(APP_NAME)) {
        MessageBox(nullptr, L"Failed to initialize logging", L"Warning", MB_OK | MB_ICONWARNING);
    }

    LOG_INFO("=== SR Cube OpenXR Ext D3D12 Application ===");

    HWND hwnd = CreateAppWindow(hInstance, g_windowWidth, g_windowHeight);
    if (!hwnd) {
        LOG_ERROR("Failed to create window");
        ShutdownLogging();
        return 1;
    }

    // Add SRMonado to DLL search path
    {
        HKEY hKey;
        char installPath[MAX_PATH] = {0};
        DWORD pathSize = sizeof(installPath);
        if (RegOpenKeyExA(HKEY_LOCAL_MACHINE, "Software\\LeiaSR\\SRMonado", 0, KEY_READ, &hKey) == ERROR_SUCCESS) {
            if (RegQueryValueExA(hKey, "InstallPath", nullptr, nullptr, (LPBYTE)installPath, &pathSize) == ERROR_SUCCESS) {
                LOG_INFO("Adding SRMonado install path to DLL search: %s", installPath);
                SetDllDirectoryA(installPath);
            }
            RegCloseKey(hKey);
        }
    }

    // Initialize OpenXR
    XrSessionManager xr = {};
    if (!InitializeOpenXR(xr)) {
        LOG_ERROR("OpenXR initialization failed");
        ShutdownLogging();
        return 1;
    }

    // Get D3D12 graphics requirements
    LUID adapterLuid;
    if (!GetD3D12GraphicsRequirements(xr, &adapterLuid)) {
        LOG_ERROR("Failed to get D3D12 graphics requirements");
        CleanupOpenXR(xr);
        ShutdownLogging();
        return 1;
    }

    // Initialize D3D12
    D3D12Renderer renderer = {};
    if (!InitializeD3D12WithLUID(renderer, adapterLuid)) {
        LOG_ERROR("D3D12 initialization failed");
        CleanupOpenXR(xr);
        ShutdownLogging();
        return 1;
    }

    // Create session
    if (!CreateSession(xr, renderer.device.Get(), renderer.commandQueue.Get(), hwnd)) {
        LOG_ERROR("OpenXR session creation failed");
        CleanupD3D12(renderer);
        CleanupOpenXR(xr);
        ShutdownLogging();
        return 1;
    }

    if (!CreateSpaces(xr)) {
        LOG_ERROR("Reference space creation failed");
        CleanupOpenXR(xr);
        CleanupD3D12(renderer);
        ShutdownLogging();
        return 1;
    }

    if (!CreateSwapchains(xr)) {
        LOG_ERROR("Swapchain creation failed");
        CleanupOpenXR(xr);
        CleanupD3D12(renderer);
        ShutdownLogging();
        return 1;
    }

    // Enumerate D3D12 swapchain images
    std::vector<XrSwapchainImageD3D12KHR> swapchainImages[2];
    int rtvBaseIndex[2] = {0, 0};
    for (int eye = 0; eye < 2; eye++) {
        uint32_t count = xr.swapchains[eye].imageCount;
        swapchainImages[eye].resize(count, {XR_TYPE_SWAPCHAIN_IMAGE_D3D12_KHR});
        xrEnumerateSwapchainImages(xr.swapchains[eye].swapchain, count, &count,
            (XrSwapchainImageBaseHeader*)swapchainImages[eye].data());
        LOG_INFO("Eye %d: enumerated %u D3D12 swapchain images", eye, count);

        // Collect ID3D12Resource pointers for RTV creation
        std::vector<ID3D12Resource*> textures(count);
        for (uint32_t i = 0; i < count; i++) {
            textures[i] = swapchainImages[eye][i].texture;
        }

        rtvBaseIndex[eye] = (int)renderer.rtvCount;
        if (!CreateSwapchainRTVs(renderer, textures.data(), count, eye,
            xr.swapchains[eye].width, xr.swapchains[eye].height)) {
            LOG_ERROR("Failed to create RTVs for eye %d", eye);
            CleanupOpenXR(xr);
            CleanupD3D12(renderer);
            ShutdownLogging();
            return 1;
        }
    }

    ShowWindow(hwnd, nCmdShow);
    UpdateWindow(hwnd);

    // Initialize HUD renderer for screen-space text overlay
    const float HUD_WIDTH_PERCENT = 0.30f;
    const float HUD_HEIGHT_PERCENT = 0.35f;
    uint32_t hudWidth = (uint32_t)(xr.swapchains[0].width * HUD_WIDTH_PERCENT);
    uint32_t hudHeight = (uint32_t)(xr.swapchains[0].height * HUD_HEIGHT_PERCENT);

    HudRenderer hudRenderer = {};
    bool hudOk = InitializeHudRenderer(hudRenderer, hudWidth, hudHeight);
    if (!hudOk) {
        LOG_WARN("HUD renderer init failed - HUD will not be displayed");
    }

    // D3D12 upload buffer for HUD pixels (aligned row pitch)
    ComPtr<ID3D12Resource> hudUploadBuffer;
    uint32_t hudUploadRowPitch = ((hudWidth * 4 + D3D12_TEXTURE_DATA_PITCH_ALIGNMENT - 1)
        / D3D12_TEXTURE_DATA_PITCH_ALIGNMENT) * D3D12_TEXTURE_DATA_PITCH_ALIGNMENT;
    if (hudOk) {
        D3D12_HEAP_PROPERTIES heapProps = {};
        heapProps.Type = D3D12_HEAP_TYPE_UPLOAD;
        D3D12_RESOURCE_DESC bufDesc = {};
        bufDesc.Dimension = D3D12_RESOURCE_DIMENSION_BUFFER;
        bufDesc.Width = (UINT64)hudUploadRowPitch * hudHeight;
        bufDesc.Height = 1;
        bufDesc.DepthOrArraySize = 1;
        bufDesc.MipLevels = 1;
        bufDesc.SampleDesc.Count = 1;
        bufDesc.Layout = D3D12_TEXTURE_LAYOUT_ROW_MAJOR;

        HRESULT hr = renderer.device->CreateCommittedResource(
            &heapProps, D3D12_HEAP_FLAG_NONE, &bufDesc,
            D3D12_RESOURCE_STATE_GENERIC_READ, nullptr,
            IID_PPV_ARGS(&hudUploadBuffer));
        if (FAILED(hr)) {
            LOG_WARN("Failed to create HUD upload buffer: 0x%08X", hr);
            hudOk = false;
        }
    }

    LOG_INFO("");
    LOG_INFO("=== Entering main loop ===");
    LOG_INFO("Controls: WASD=Fly, QE=Up/Down, Mouse=Look, Space/DblClick=Reset, TAB=HUD, ESC=Quit");
    LOG_INFO("");

    std::thread renderThread(RenderThreadFunc, hwnd, &xr, &renderer,
        swapchainImages, rtvBaseIndex,
        hudOk ? &hudRenderer : nullptr, hudWidth, hudHeight,
        hudUploadBuffer.Get(), hudUploadRowPitch);

    MSG msg = {};
    while (GetMessage(&msg, nullptr, 0, 0) > 0) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    g_running.store(false);
    LOG_INFO("Main thread: waiting for render thread...");
    renderThread.join();
    LOG_INFO("Main thread: render thread joined");

    LOG_INFO("");
    LOG_INFO("=== Shutting down ===");

    if (hudOk) CleanupHudRenderer(hudRenderer);

    CleanupOpenXR(xr);
    CleanupD3D12(renderer);

    DestroyWindow(hwnd);
    UnregisterClass(WINDOW_CLASS, hInstance);

    LOG_INFO("Application shutdown complete");
    ShutdownLogging();

    return 0;
}
