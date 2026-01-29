// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Standalone HUD text renderer implementation
 */

#include "hud_renderer.h"
#include "logging.h"

#pragma comment(lib, "d3d11.lib")
#pragma comment(lib, "d2d1.lib")
#pragma comment(lib, "dwrite.lib")

bool InitializeHudRenderer(HudRenderer& hud, uint32_t w, uint32_t h) {
    hud.width = w;
    hud.height = h;

    // Create a standalone D3D11 device (hardware, default adapter)
    D3D_FEATURE_LEVEL featureLevel;
    HRESULT hr = D3D11CreateDevice(
        nullptr, D3D_DRIVER_TYPE_HARDWARE, nullptr, D3D11_CREATE_DEVICE_BGRA_SUPPORT,
        nullptr, 0, D3D11_SDK_VERSION,
        &hud.device, &featureLevel, &hud.context);
    if (FAILED(hr)) {
        LOG_ERROR("HudRenderer: D3D11CreateDevice failed: 0x%08X", hr);
        return false;
    }
    LOG_INFO("HudRenderer: D3D11 device created (feature level 0x%X)", featureLevel);

    // Create render texture (D2D-compatible, RENDER_TARGET bind)
    D3D11_TEXTURE2D_DESC renderDesc = {};
    renderDesc.Width = w;
    renderDesc.Height = h;
    renderDesc.MipLevels = 1;
    renderDesc.ArraySize = 1;
    renderDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
    renderDesc.SampleDesc.Count = 1;
    renderDesc.Usage = D3D11_USAGE_DEFAULT;
    renderDesc.BindFlags = D3D11_BIND_RENDER_TARGET;

    hr = hud.device->CreateTexture2D(&renderDesc, nullptr, &hud.renderTex);
    if (FAILED(hr)) {
        LOG_ERROR("HudRenderer: CreateTexture2D (render) failed: 0x%08X", hr);
        return false;
    }

    // Create staging texture (CPU-readable)
    D3D11_TEXTURE2D_DESC stagingDesc = {};
    stagingDesc.Width = w;
    stagingDesc.Height = h;
    stagingDesc.MipLevels = 1;
    stagingDesc.ArraySize = 1;
    stagingDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
    stagingDesc.SampleDesc.Count = 1;
    stagingDesc.Usage = D3D11_USAGE_STAGING;
    stagingDesc.CPUAccessFlags = D3D11_CPU_ACCESS_READ;

    hr = hud.device->CreateTexture2D(&stagingDesc, nullptr, &hud.stagingTex);
    if (FAILED(hr)) {
        LOG_ERROR("HudRenderer: CreateTexture2D (staging) failed: 0x%08X", hr);
        return false;
    }

    // Initialize DirectWrite/D2D text overlay
    if (!InitializeTextOverlay(hud.overlay)) {
        LOG_ERROR("HudRenderer: InitializeTextOverlay failed");
        return false;
    }

    LOG_INFO("HudRenderer: initialized (%ux%u)", w, h);
    return true;
}

const void* RenderHudAndMap(HudRenderer& hud, uint32_t* rowPitch,
    const std::wstring& sessionText, const std::wstring& modeText,
    const std::wstring& perfText, const std::wstring& eyeText)
{
    // Clear render texture with semi-transparent black
    ID3D11RenderTargetView* rtv = nullptr;
    hud.device->CreateRenderTargetView(hud.renderTex.Get(), nullptr, &rtv);
    if (rtv) {
        float clearColor[4] = {0.0f, 0.0f, 0.0f, 0.7f};
        hud.context->ClearRenderTargetView(rtv, clearColor);
        rtv->Release();
    }

    // Scale text coordinates proportionally
    float sx = hud.width / 512.0f;
    float sy = hud.height / 256.0f;

    RenderText(hud.overlay, hud.device.Get(), hud.renderTex.Get(),
        sessionText, 10*sx, 10*sy, 300*sx, 30*sy);

    RenderText(hud.overlay, hud.device.Get(), hud.renderTex.Get(),
        modeText, 10*sx, 45*sy, 350*sx, 30*sy, true);

    RenderText(hud.overlay, hud.device.Get(), hud.renderTex.Get(),
        perfText, 10*sx, 85*sy, 300*sx, 70*sy, true);

    RenderText(hud.overlay, hud.device.Get(), hud.renderTex.Get(),
        eyeText, 10*sx, 165*sy, 300*sx, 70*sy, true);

    // Copy render texture to staging texture, then map for CPU read
    hud.context->CopyResource(hud.stagingTex.Get(), hud.renderTex.Get());

    D3D11_MAPPED_SUBRESOURCE mapped = {};
    HRESULT hr = hud.context->Map(hud.stagingTex.Get(), 0, D3D11_MAP_READ, 0, &mapped);
    if (FAILED(hr)) {
        LOG_ERROR("HudRenderer: Map failed: 0x%08X", hr);
        return nullptr;
    }

    if (rowPitch) *rowPitch = mapped.RowPitch;
    return mapped.pData;
}

void UnmapHud(HudRenderer& hud) {
    hud.context->Unmap(hud.stagingTex.Get(), 0);
}

void CleanupHudRenderer(HudRenderer& hud) {
    CleanupTextOverlay(hud.overlay);
    hud.stagingTex.Reset();
    hud.renderTex.Reset();
    hud.context.Reset();
    hud.device.Reset();
}
