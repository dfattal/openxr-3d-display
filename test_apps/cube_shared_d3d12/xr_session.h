// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  OpenXR session management with shared D3D12 texture
 *
 * This version uses XR_EXT_win32_window_binding with sharedTextureHandle
 * (windowHandle=NULL) for offscreen shared texture compositing.
 */

#pragma once

#include <d3d12.h>
#include <dxgi1_6.h>
#define XR_USE_GRAPHICS_API_D3D12
#include "xr_session_common.h"

// Initialize OpenXR instance and check for XR_EXT_win32_window_binding support
bool InitializeOpenXR(XrSessionManager& xr);

// Get the D3D12 graphics requirements (adapter LUID)
bool GetD3D12GraphicsRequirements(XrSessionManager& xr, LUID* outAdapterLuid);

// Create session with D3D12 device and shared texture handle (offscreen mode)
bool CreateSession(XrSessionManager& xr, ID3D12Device* device, ID3D12CommandQueue* queue, HANDLE sharedTextureHandle);
