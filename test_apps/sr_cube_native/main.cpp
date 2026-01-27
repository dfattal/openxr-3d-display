// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  SR Cube Native - Direct SR SDK test without OpenXR
 *
 * This application demonstrates direct SR SDK usage with D3D11.
 * It uses Kooima projection for off-axis stereo rendering.
 */

#define WIN32_LEAN_AND_MEAN
#define UNICODE
#define _UNICODE
#include <windows.h>
#include <wrl/client.h>
#include <d3d11.h>
#include <dxgi1_4.h>

#include "logging.h"
#include "input_handler.h"
#include "d3d11_renderer.h"
#include "text_overlay.h"
#include "window_manager.h"
#include "leia_math.h"

#include <chrono>
#include <string>
#include <sstream>

// SR SDK headers (CNSDK)
#ifdef XRT_HAVE_CNSDK
#include <SR/SR.h>
#include <SR/dx11weaver.h>
#endif

using Microsoft::WRL::ComPtr;
using namespace DirectX;

// Application name for logging
static const char* APP_NAME = "sr_cube_native";

// Window settings
static const wchar_t* WINDOW_CLASS = L"SRCubeNativeClass";
static const wchar_t* WINDOW_TITLE = L"SR Cube (Native SDK)";

// Global state
static InputState g_inputState;
static WindowInfo g_windowInfo;
static bool g_running = true;
static UINT g_windowWidth = 2560;   // Stereo width
static UINT g_windowHeight = 1600;  // SR display height
static bool g_windowResized = false;

// Window procedure
LRESULT CALLBACK WindowProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    UpdateInputState(g_inputState, msg, wParam, lParam);

    switch (msg) {
    case WM_SIZE:
        if (wParam != SIZE_MINIMIZED) {
            g_windowWidth = LOWORD(lParam);
            g_windowHeight = HIWORD(lParam);
            g_windowResized = true;
        }
        return 0;

    case WM_CLOSE:
        g_running = false;
        PostQuitMessage(0);
        return 0;

    case WM_KEYDOWN:
        if (wParam == VK_ESCAPE) {
            g_running = false;
            PostQuitMessage(0);
            return 0;
        }
        break;
    }

    return DefWindowProc(hwnd, msg, wParam, lParam);
}

// Performance tracking
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

#ifdef XRT_HAVE_CNSDK

// SR SDK context
struct SRContext {
    SR::SRContext* context = nullptr;
    SR::DisplayManager* displayManager = nullptr;
    SR::DX11Weaver* weaver = nullptr;

    float displayWidthM = 0.355f;   // Default ~14" display
    float displayHeightM = 0.222f;
    float defaultViewingDistance = 0.6f;  // 60cm

    bool ready = false;
};

static bool InitializeSR(SRContext& sr, ID3D11Device* device, ID3D11DeviceContext* context,
                         HWND hwnd, uint32_t viewWidth, uint32_t viewHeight) {
    LOG_INFO("Initializing SR SDK...");

    // Create SR context
    sr.context = SR::SRContext::create("sr_cube_native");
    if (!sr.context) {
        LOG_ERROR("Failed to create SR context");
        return false;
    }
    LOG_INFO("SR context created");

    // Get display manager
    sr.displayManager = sr.context->getDisplayManager();
    if (!sr.displayManager) {
        LOG_ERROR("Failed to get display manager");
        return false;
    }

    // Get display properties
    auto displays = sr.displayManager->getDisplays();
    if (!displays.empty()) {
        auto& display = displays[0];
        sr.displayWidthM = display.getPhysicalWidth() / 1000.0f;  // mm to m
        sr.displayHeightM = display.getPhysicalHeight() / 1000.0f;
        LOG_INFO("SR display: %.3fm x %.3fm", sr.displayWidthM, sr.displayHeightM);
    }

    // Create D3D11 weaver
    sr.weaver = SR::DX11Weaver::create(sr.context, device, context, hwnd,
                                        viewWidth, viewHeight);
    if (!sr.weaver) {
        LOG_ERROR("Failed to create D3D11 weaver");
        return false;
    }
    LOG_INFO("D3D11 weaver created");

    sr.ready = true;
    LOG_INFO("SR SDK initialization complete");
    return true;
}

static void CleanupSR(SRContext& sr) {
    if (sr.weaver) {
        delete sr.weaver;
        sr.weaver = nullptr;
    }
    if (sr.context) {
        sr.context->destroy();
        sr.context = nullptr;
    }
    sr.displayManager = nullptr;
    sr.ready = false;
}

#endif // XRT_HAVE_CNSDK

// Main entry point
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    (void)hPrevInstance;
    (void)lpCmdLine;

    // Initialize logging
    if (!InitializeLogging(APP_NAME)) {
        MessageBox(nullptr, L"Failed to initialize logging", L"Warning", MB_OK | MB_ICONWARNING);
    }

    LOG_INFO("=== SR Cube Native Application ===");
    LOG_INFO("Direct SR SDK rendering without OpenXR");

#ifndef XRT_HAVE_CNSDK
    LOG_ERROR("CNSDK not available - this application requires the SR SDK");
    MessageBox(nullptr,
        L"This application requires the Leia SR SDK (CNSDK).\n\n"
        L"Please ensure CNSDK is installed and the project was built with XRT_HAVE_CNSDK=ON.",
        L"SR SDK Required", MB_OK | MB_ICONERROR);
    ShutdownLogging();
    return 1;
#else

    // Find SR display
    int srMonitor = FindSRDisplayMonitor();
    LOG_INFO("Using monitor %d for SR display", srMonitor);

    // Create window on SR display
    if (!CreateAppWindow(g_windowInfo, hInstance, WINDOW_CLASS, WINDOW_TITLE,
                         g_windowWidth, g_windowHeight, WindowProc, srMonitor)) {
        LOG_ERROR("Failed to create window");
        ShutdownLogging();
        return 1;
    }

    // Initialize D3D11
    LOG_INFO("Initializing D3D11...");
    D3D11Renderer renderer = {};
    if (!InitializeD3D11(renderer)) {
        LOG_ERROR("D3D11 initialization failed");
        MessageBox(g_windowInfo.hwnd, L"Failed to initialize D3D11", L"Error", MB_OK | MB_ICONERROR);
        DestroyAppWindow(g_windowInfo);
        ShutdownLogging();
        return 1;
    }
    LOG_INFO("D3D11 initialized");

    // Initialize text overlay
    LOG_INFO("Initializing text overlay...");
    TextOverlay textOverlay = {};
    if (!InitializeTextOverlay(textOverlay)) {
        LOG_ERROR("Text overlay initialization failed");
        CleanupD3D11(renderer);
        DestroyAppWindow(g_windowInfo);
        ShutdownLogging();
        return 1;
    }

    // Initialize SR SDK
    uint32_t viewWidth = g_windowWidth / 2;  // Half width for each eye
    uint32_t viewHeight = g_windowHeight;

    SRContext sr = {};
    if (!InitializeSR(sr, renderer.device.Get(), renderer.context.Get(),
                      g_windowInfo.hwnd, viewWidth, viewHeight)) {
        LOG_ERROR("SR SDK initialization failed");
        MessageBox(g_windowInfo.hwnd, L"Failed to initialize SR SDK", L"Error", MB_OK | MB_ICONERROR);
        CleanupTextOverlay(textOverlay);
        CleanupD3D11(renderer);
        DestroyAppWindow(g_windowInfo);
        ShutdownLogging();
        return 1;
    }

    // Create stereo render target (side-by-side: 2x view width)
    ComPtr<ID3D11Texture2D> stereoTexture;
    ComPtr<ID3D11RenderTargetView> stereoRTV;
    ComPtr<ID3D11ShaderResourceView> stereoSRV;
    ComPtr<ID3D11Texture2D> depthTexture;
    ComPtr<ID3D11DepthStencilView> depthDSV;

    LOG_INFO("Creating stereo render target (%ux%u per eye)...", viewWidth, viewHeight);
    {
        D3D11_TEXTURE2D_DESC texDesc = {};
        texDesc.Width = viewWidth * 2;  // Side-by-side
        texDesc.Height = viewHeight;
        texDesc.MipLevels = 1;
        texDesc.ArraySize = 1;
        texDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
        texDesc.SampleDesc.Count = 1;
        texDesc.Usage = D3D11_USAGE_DEFAULT;
        texDesc.BindFlags = D3D11_BIND_RENDER_TARGET | D3D11_BIND_SHADER_RESOURCE;

        HRESULT hr = renderer.device->CreateTexture2D(&texDesc, nullptr, &stereoTexture);
        if (FAILED(hr)) {
            LOG_ERROR("Failed to create stereo texture");
            CleanupSR(sr);
            CleanupTextOverlay(textOverlay);
            CleanupD3D11(renderer);
            DestroyAppWindow(g_windowInfo);
            ShutdownLogging();
            return 1;
        }

        hr = renderer.device->CreateRenderTargetView(stereoTexture.Get(), nullptr, &stereoRTV);
        if (FAILED(hr)) {
            LOG_ERROR("Failed to create stereo RTV");
            CleanupSR(sr);
            CleanupTextOverlay(textOverlay);
            CleanupD3D11(renderer);
            DestroyAppWindow(g_windowInfo);
            ShutdownLogging();
            return 1;
        }

        hr = renderer.device->CreateShaderResourceView(stereoTexture.Get(), nullptr, &stereoSRV);
        if (FAILED(hr)) {
            LOG_ERROR("Failed to create stereo SRV");
            CleanupSR(sr);
            CleanupTextOverlay(textOverlay);
            CleanupD3D11(renderer);
            DestroyAppWindow(g_windowInfo);
            ShutdownLogging();
            return 1;
        }

        // Create depth buffer
        ID3D11Texture2D* depthTex = nullptr;
        ID3D11DepthStencilView* dsv = nullptr;
        if (!CreateDepthStencilView(renderer, viewWidth * 2, viewHeight, &depthTex, &dsv)) {
            LOG_ERROR("Failed to create depth buffer");
            CleanupSR(sr);
            CleanupTextOverlay(textOverlay);
            CleanupD3D11(renderer);
            DestroyAppWindow(g_windowInfo);
            ShutdownLogging();
            return 1;
        }
        depthTexture.Attach(depthTex);
        depthDSV.Attach(dsv);
    }
    LOG_INFO("Stereo render target created");

    // Show window
    ShowWindow(g_windowInfo.hwnd, nCmdShow);
    UpdateWindow(g_windowInfo.hwnd);

    // Performance tracking
    PerformanceStats perfStats = {};
    perfStats.lastTime = std::chrono::high_resolution_clock::now();

    // Eye tracking state
    float eyePosX = 0.0f;
    float eyePosY = 0.0f;

    LOG_INFO("");
    LOG_INFO("=== Entering main loop ===");
    LOG_INFO("Controls: WASD=Move, Mouse=Look, P=Toggle Parallax, F11=Fullscreen, ESC=Quit");
    LOG_INFO("");

    // Main loop
    MSG msg = {};
    while (g_running) {
        // Process Windows messages
        while (PeekMessage(&msg, nullptr, 0, 0, PM_REMOVE)) {
            if (msg.message == WM_QUIT) {
                g_running = false;
            }
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }

        if (!g_running) break;

        // Update performance stats
        UpdatePerformanceStats(perfStats);

        // Update input-based camera movement
        UpdateCameraMovement(g_inputState, perfStats.deltaTime);

        // Handle fullscreen toggle
        if (g_inputState.fullscreenToggleRequested) {
            g_inputState.fullscreenToggleRequested = false;
            ToggleFullscreen(g_windowInfo);
        }

        // Update scene (cube rotation)
        UpdateScene(renderer, perfStats.deltaTime);

        // Get eye tracking data from weaver
        if (g_inputState.parallaxEnabled && sr.weaver) {
            float leftEye[3], rightEye[3];
            if (sr.weaver->getPredictedEyePosition(leftEye, rightEye)) {
                // Average of both eyes for display
                eyePosX = (leftEye[0] + rightEye[0]) / 2.0f;
                eyePosY = (leftEye[1] + rightEye[1]) / 2.0f;
            }
        }

        // Compute eye positions for Kooima projection
        leia::vec3f leftEyePos, rightEyePos;
        if (g_inputState.parallaxEnabled && sr.weaver) {
            float leftEye[3], rightEye[3];
            if (sr.weaver->getPredictedEyePosition(leftEye, rightEye)) {
                leftEyePos = leia::vec3f(leftEye[0], leftEye[1], leftEye[2]);
                rightEyePos = leia::vec3f(rightEye[0], rightEye[1], rightEye[2]);
            } else {
                // Default eye positions if tracking not available
                leftEyePos = leia::vec3f(-0.032f, 0.0f, sr.defaultViewingDistance);
                rightEyePos = leia::vec3f(0.032f, 0.0f, sr.defaultViewingDistance);
            }
        } else {
            // Fixed eye positions (no parallax)
            leftEyePos = leia::vec3f(-0.032f, 0.0f, sr.defaultViewingDistance);
            rightEyePos = leia::vec3f(0.032f, 0.0f, sr.defaultViewingDistance);
        }

        // Compute Kooima projection matrices
        leia::mat4f leftProj = leia::kooimaProjectionSimple(leftEyePos, sr.displayWidthM, sr.displayHeightM, 0.01f, 100.0f);
        leia::mat4f rightProj = leia::kooimaProjectionSimple(rightEyePos, sr.displayWidthM, sr.displayHeightM, 0.01f, 100.0f);

        // View matrices are identity for head-tracked display (camera is at eye position)
        XMMATRIX leftViewMatrix = XMMatrixIdentity();
        XMMATRIX rightViewMatrix = XMMatrixIdentity();
        XMMATRIX leftProjMatrix = leftProj.toXMMATRIX();
        XMMATRIX rightProjMatrix = rightProj.toXMMATRIX();

        // Clear stereo render target
        float clearColor[] = { 0.1f, 0.1f, 0.15f, 1.0f };
        renderer.context->ClearRenderTargetView(stereoRTV.Get(), clearColor);
        renderer.context->ClearDepthStencilView(depthDSV.Get(), D3D11_CLEAR_DEPTH, 1.0f, 0);

        // Render left eye (left half of stereo texture)
        {
            D3D11_VIEWPORT vp = { 0, 0, (float)viewWidth, (float)viewHeight, 0, 1 };
            renderer.context->RSSetViewports(1, &vp);
            renderer.context->OMSetRenderTargets(1, stereoRTV.GetAddressOf(), depthDSV.Get());

            RenderScene(renderer, stereoRTV.Get(), depthDSV.Get(),
                viewWidth, viewHeight,
                leftViewMatrix, leftProjMatrix,
                g_inputState.cameraPosX, g_inputState.cameraPosY, g_inputState.cameraPosZ,
                g_inputState.yaw, g_inputState.pitch);
        }

        // Render right eye (right half of stereo texture)
        {
            D3D11_VIEWPORT vp = { (float)viewWidth, 0, (float)viewWidth, (float)viewHeight, 0, 1 };
            renderer.context->RSSetViewports(1, &vp);

            // Clear depth for right eye (viewport offset means we need to clear this region)
            // Actually the depth was already cleared, but we need to re-render
            RenderScene(renderer, stereoRTV.Get(), depthDSV.Get(),
                viewWidth, viewHeight,
                rightViewMatrix, rightProjMatrix,
                g_inputState.cameraPosX, g_inputState.cameraPosY, g_inputState.cameraPosZ,
                g_inputState.yaw, g_inputState.pitch);
        }

        // Render text overlay on left eye (visible to user)
        {
            // Performance info
            std::wstring perfText = FormatPerformanceInfo(perfStats.fps, perfStats.frameTimeMs, viewWidth, viewHeight);
            RenderText(textOverlay, renderer.device.Get(), stereoTexture.Get(),
                perfText, 10, 10, 200, 60, true);

            // Parallax info
            std::wstring parallaxText = FormatParallaxInfo(g_inputState.parallaxEnabled, eyePosX, eyePosY);
            RenderText(textOverlay, renderer.device.Get(), stereoTexture.Get(),
                parallaxText, 10, 80, 200, 60, true);

            // Help text
            std::wstring helpText = L"WASD: Move | Mouse: Look | P: Parallax | F11: Fullscreen | ESC: Quit";
            RenderText(textOverlay, renderer.device.Get(), stereoTexture.Get(),
                helpText, 10, viewHeight - 30.0f, 500, 25, true);
        }

        // Set input texture for weaver
        sr.weaver->setInputTexture(stereoSRV.Get());

        // Weave and present
        sr.weaver->weave();
    }

    // Cleanup
    LOG_INFO("");
    LOG_INFO("=== Shutting down ===");

    stereoSRV.Reset();
    stereoRTV.Reset();
    stereoTexture.Reset();
    depthDSV.Reset();
    depthTexture.Reset();

    CleanupSR(sr);
    CleanupTextOverlay(textOverlay);
    CleanupD3D11(renderer);
    DestroyAppWindow(g_windowInfo);

    LOG_INFO("Application shutdown complete");
    ShutdownLogging();

    return 0;
#endif // XRT_HAVE_CNSDK
}
