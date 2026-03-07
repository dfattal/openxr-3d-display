// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  SR Cube OpenXR D3D12 - Standard OpenXR mode (Monado creates window)
 *
 * This application demonstrates OpenXR with D3D12 without the XR_EXT_win32_window_binding extension.
 * Monado will create its own window for rendering.
 *
 * Input is handled by Monado's qwerty driver:
 * - WASD: Move camera
 * - Mouse drag: Look around
 * - ESC: Close window and exit
 */

#define WIN32_LEAN_AND_MEAN
#define UNICODE
#define _UNICODE
#include <windows.h>
#include <wrl/client.h>

#include "logging.h"
#include "d3d12_renderer.h"
#include "xr_session.h"

#include <chrono>

using Microsoft::WRL::ComPtr;
using namespace DirectX;

static const char* APP_NAME = "cube_d3d12";

static bool g_running = true;

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

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    (void)hInstance;
    (void)hPrevInstance;
    (void)lpCmdLine;
    (void)nCmdShow;

    if (!InitializeLogging(APP_NAME)) {
        MessageBox(nullptr, L"Failed to initialize logging", L"Warning", MB_OK | MB_ICONWARNING);
    }

    LOG_INFO("=== SR Cube OpenXR D3D12 Application ===");
    LOG_INFO("OpenXR standard mode (Monado creates window)");
    LOG_INFO("Input handled by Monado's qwerty driver");

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
    LOG_INFO("Initializing OpenXR...");
    XrSessionManager xr = {};
    if (!InitializeOpenXR(xr)) {
        LOG_ERROR("OpenXR initialization failed");
        MessageBox(nullptr, L"Failed to initialize OpenXR", L"Error", MB_OK | MB_ICONERROR);
        ShutdownLogging();
        return 1;
    }

    // Get the required GPU adapter LUID from OpenXR
    LUID adapterLuid;
    if (!GetD3D12GraphicsRequirements(xr, &adapterLuid)) {
        LOG_ERROR("Failed to get D3D12 graphics requirements");
        CleanupOpenXR(xr);
        ShutdownLogging();
        return 1;
    }

    // Initialize D3D12 on the correct adapter
    LOG_INFO("Initializing D3D12...");
    D3D12Renderer renderer = {};
    if (!InitializeD3D12WithLUID(renderer, adapterLuid)) {
        LOG_ERROR("D3D12 initialization failed");
        MessageBox(nullptr, L"Failed to initialize D3D12", L"Error", MB_OK | MB_ICONERROR);
        CleanupOpenXR(xr);
        ShutdownLogging();
        return 1;
    }

    // Create OpenXR session (Monado creates window)
    LOG_INFO("Creating OpenXR session...");
    if (!CreateSession(xr, renderer.device.Get(), renderer.commandQueue.Get())) {
        LOG_ERROR("OpenXR session creation failed");
        MessageBox(nullptr, L"Failed to create OpenXR session", L"Error", MB_OK | MB_ICONERROR);
        CleanupD3D12(renderer);
        CleanupOpenXR(xr);
        ShutdownLogging();
        return 1;
    }

    // Create reference spaces
    if (!CreateSpaces(xr)) {
        LOG_ERROR("Reference space creation failed");
        CleanupOpenXR(xr);
        CleanupD3D12(renderer);
        ShutdownLogging();
        return 1;
    }

    // Create single swapchain at native display resolution
    if (!CreateSwapchain(xr)) {
        LOG_ERROR("Swapchain creation failed");
        CleanupOpenXR(xr);
        CleanupD3D12(renderer);
        ShutdownLogging();
        return 1;
    }

    // Enumerate D3D12 swapchain images
    std::vector<XrSwapchainImageD3D12KHR> swapchainImages;
    {
        uint32_t count = xr.swapchain.imageCount;
        swapchainImages.resize(count, {XR_TYPE_SWAPCHAIN_IMAGE_D3D12_KHR});
        xrEnumerateSwapchainImages(xr.swapchain.swapchain, count, &count,
            (XrSwapchainImageBaseHeader*)swapchainImages.data());
        LOG_INFO("Enumerated %u D3D12 swapchain images", count);
    }

    // Determine swapchain format for RTV creation
    DXGI_FORMAT rtvFormat = DXGI_FORMAT_R8G8B8A8_UNORM_SRGB;
    if (swapchainImages.size() > 0 && swapchainImages[0].texture != nullptr) {
        D3D12_RESOURCE_DESC desc = swapchainImages[0].texture->GetDesc();
        rtvFormat = desc.Format;
        if (rtvFormat == DXGI_FORMAT_R8G8B8A8_TYPELESS) rtvFormat = DXGI_FORMAT_R8G8B8A8_UNORM_SRGB;
        if (rtvFormat == DXGI_FORMAT_B8G8R8A8_TYPELESS) rtvFormat = DXGI_FORMAT_B8G8R8A8_UNORM_SRGB;
        LOG_INFO("Swapchain resource format: %u, RTV format: %u", (uint32_t)desc.Format, (uint32_t)rtvFormat);
    }

    // Create RTVs for swapchain images
    {
        std::vector<ID3D12Resource*> textures(swapchainImages.size());
        for (size_t i = 0; i < swapchainImages.size(); i++) {
            textures[i] = swapchainImages[i].texture;
        }
        if (!CreateSwapchainRTVs(renderer, textures.data(), (uint32_t)textures.size(),
                                  xr.swapchain.width, xr.swapchain.height, rtvFormat)) {
            LOG_ERROR("Failed to create swapchain RTVs");
            CleanupOpenXR(xr);
            CleanupD3D12(renderer);
            ShutdownLogging();
            return 1;
        }
    }

    PerformanceStats perfStats = {};
    perfStats.lastTime = std::chrono::high_resolution_clock::now();

    LOG_INFO("");
    LOG_INFO("=== Entering main loop ===");
    LOG_INFO("Rendering in Monado's window (input via qwerty driver)");
    LOG_INFO("Controls: WASD=Move, QE=Up/Down, Mouse=Look, ESC=Quit");
    LOG_INFO("");

    while (g_running && !xr.exitRequested) {
        UpdatePerformanceStats(perfStats);
        UpdateScene(renderer, perfStats.deltaTime);
        PollEvents(xr);

        if (xr.sessionRunning) {
            XrFrameState frameState;
            if (BeginFrame(xr, frameState)) {
                XrCompositionLayerProjectionView projectionViews[2] = {};

                if (frameState.shouldRender) {
                    XMMATRIX leftViewMatrix, leftProjMatrix;
                    XMMATRIX rightViewMatrix, rightProjMatrix;

                    if (LocateViews(xr, frameState.predictedDisplayTime,
                        leftViewMatrix, leftProjMatrix,
                        rightViewMatrix, rightProjMatrix,
                        0.0f, 0.0f, 0.0f,
                        0.0f, 0.0f)) {

                        XrViewLocateInfo locateInfo = {XR_TYPE_VIEW_LOCATE_INFO};
                        locateInfo.viewConfigurationType = xr.viewConfigType;
                        locateInfo.displayTime = frameState.predictedDisplayTime;
                        locateInfo.space = xr.localSpace;

                        XrViewState viewState = {XR_TYPE_VIEW_STATE};
                        uint32_t viewCount = 2;
                        XrView rawViews[2] = {{XR_TYPE_VIEW}, {XR_TYPE_VIEW}};
                        xrLocateViews(xr.session, &locateInfo, &viewState, 2, &viewCount, rawViews);

                        uint32_t eyeRenderW = (xr.recommendedViewScaleX > 0.0f && xr.recommendedViewScaleX < 1.0f)
                            ? (uint32_t)(xr.swapchain.width * xr.recommendedViewScaleX)
                            : xr.swapchain.width / 2;
                        uint32_t eyeRenderH = xr.swapchain.height;

                        uint32_t imageIndex;
                        if (AcquireSwapchainImage(xr, imageIndex)) {
                            ID3D12Resource* swapchainTexture = swapchainImages[imageIndex].texture;

                            // Render both eyes with SBS viewports
                            for (int eye = 0; eye < 2; eye++) {
                                XMMATRIX viewMatrix = (eye == 0) ? leftViewMatrix : rightViewMatrix;
                                XMMATRIX projMatrix = (eye == 0) ? leftProjMatrix : rightProjMatrix;

                                RenderScene(renderer, swapchainTexture, (int)imageIndex,
                                    eye * eyeRenderW, 0,
                                    eyeRenderW, eyeRenderH,
                                    viewMatrix, projMatrix,
                                    1.0f, eye == 0);

                                projectionViews[eye].type = XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW;
                                projectionViews[eye].subImage.swapchain = xr.swapchain.swapchain;
                                projectionViews[eye].subImage.imageRect.offset = {
                                    (int32_t)(eye * eyeRenderW), 0
                                };
                                projectionViews[eye].subImage.imageRect.extent = {
                                    (int32_t)eyeRenderW,
                                    (int32_t)eyeRenderH
                                };
                                projectionViews[eye].subImage.imageArrayIndex = 0;
                                projectionViews[eye].pose = rawViews[eye].pose;
                                projectionViews[eye].fov = rawViews[eye].fov;
                            }

                            // Wait for GPU before releasing
                            WaitForGpu(renderer);
                            ReleaseSwapchainImage(xr);
                        }
                    }
                }

                EndFrame(xr, frameState.predictedDisplayTime, projectionViews);
            }
        } else {
            Sleep(100);
        }
    }

    // Cleanup
    LOG_INFO("");
    LOG_INFO("=== Shutting down ===");

    WaitForGpu(renderer);
    CleanupOpenXR(xr);
    CleanupD3D12(renderer);

    LOG_INFO("Application shutdown complete");
    ShutdownLogging();

    return 0;
}
