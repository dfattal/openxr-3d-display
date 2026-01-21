// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  OpenXR session management implementation
 */

#include "xr_session.h"
#include <cstring>
#include <cmath>

using namespace DirectX;

// Helper macro for XR error checking
#define XR_CHECK(call) \
    do { \
        XrResult result = (call); \
        if (XR_FAILED(result)) { \
            char msg[256]; \
            sprintf_s(msg, "OpenXR call failed: %s = %d\n", #call, result); \
            OutputDebugStringA(msg); \
            return false; \
        } \
    } while (0)

static XMMATRIX XrPoseToViewMatrix(const XrPosef& pose) {
    // Convert XR pose to view matrix
    XMVECTOR orientation = XMVectorSet(pose.orientation.x, pose.orientation.y, pose.orientation.z, pose.orientation.w);
    XMVECTOR position = XMVectorSet(pose.position.x, pose.position.y, pose.position.z, 1.0f);

    // Create rotation matrix from quaternion and invert for view
    XMMATRIX rotation = XMMatrixRotationQuaternion(orientation);
    rotation = XMMatrixTranspose(rotation); // Invert rotation

    // Create translation and apply inverted rotation
    XMMATRIX translation = XMMatrixTranslation(-pose.position.x, -pose.position.y, -pose.position.z);

    return translation * rotation;
}

static XMMATRIX XrFovToProjectionMatrix(const XrFovf& fov, float nearZ, float farZ) {
    // Create asymmetric projection matrix from FOV angles
    float left = nearZ * tanf(fov.angleLeft);
    float right = nearZ * tanf(fov.angleRight);
    float top = nearZ * tanf(fov.angleUp);
    float bottom = nearZ * tanf(fov.angleDown);

    float width = right - left;
    float height = top - bottom;

    XMMATRIX proj = XMMatrixIdentity();
    proj.r[0] = XMVectorSet(2.0f * nearZ / width, 0, 0, 0);
    proj.r[1] = XMVectorSet(0, 2.0f * nearZ / height, 0, 0);
    proj.r[2] = XMVectorSet((right + left) / width, (top + bottom) / height, -(farZ + nearZ) / (farZ - nearZ), -1);
    proj.r[3] = XMVectorSet(0, 0, -2.0f * farZ * nearZ / (farZ - nearZ), 0);

    return proj;
}

bool InitializeOpenXR(XrSessionManager& xr) {
    // Query available extensions
    uint32_t extensionCount = 0;
    XR_CHECK(xrEnumerateInstanceExtensionProperties(nullptr, 0, &extensionCount, nullptr));

    std::vector<XrExtensionProperties> extensions(extensionCount, {XR_TYPE_EXTENSION_PROPERTIES});
    XR_CHECK(xrEnumerateInstanceExtensionProperties(nullptr, extensionCount, &extensionCount, extensions.data()));

    // Check for required extensions
    bool hasD3D11 = false;
    xr.hasSessionTargetExt = false;

    for (const auto& ext : extensions) {
        if (strcmp(ext.extensionName, XR_KHR_D3D11_ENABLE_EXTENSION_NAME) == 0) {
            hasD3D11 = true;
        }
        if (strcmp(ext.extensionName, XR_EXT_SESSION_TARGET_EXTENSION_NAME) == 0) {
            xr.hasSessionTargetExt = true;
        }
    }

    if (!hasD3D11) {
        OutputDebugStringA("ERROR: XR_KHR_D3D11_enable extension not available\n");
        return false;
    }

    if (!xr.hasSessionTargetExt) {
        OutputDebugStringA("WARNING: XR_EXT_session_target extension not available\n");
        // Continue anyway - will work without windowed mode
    }

    // Build list of extensions to enable
    std::vector<const char*> enabledExtensions;
    enabledExtensions.push_back(XR_KHR_D3D11_ENABLE_EXTENSION_NAME);
    if (xr.hasSessionTargetExt) {
        enabledExtensions.push_back(XR_EXT_SESSION_TARGET_EXTENSION_NAME);
    }

    // Create instance
    XrInstanceCreateInfo createInfo = {XR_TYPE_INSTANCE_CREATE_INFO};
    strcpy_s(createInfo.applicationInfo.applicationName, "SessionTargetTest");
    createInfo.applicationInfo.applicationVersion = 1;
    strcpy_s(createInfo.applicationInfo.engineName, "None");
    createInfo.applicationInfo.engineVersion = 0;
    createInfo.applicationInfo.apiVersion = XR_CURRENT_API_VERSION;
    createInfo.enabledExtensionCount = (uint32_t)enabledExtensions.size();
    createInfo.enabledExtensionNames = enabledExtensions.data();

    XR_CHECK(xrCreateInstance(&createInfo, &xr.instance));

    // Get system for HMD
    XrSystemGetInfo systemInfo = {XR_TYPE_SYSTEM_GET_INFO};
    systemInfo.formFactor = XR_FORM_FACTOR_HEAD_MOUNTED_DISPLAY;
    XR_CHECK(xrGetSystem(xr.instance, &systemInfo, &xr.systemId));

    // Get view configuration views
    uint32_t viewCount = 0;
    XR_CHECK(xrEnumerateViewConfigurationViews(xr.instance, xr.systemId, xr.viewConfigType, 0, &viewCount, nullptr));

    xr.configViews.resize(viewCount, {XR_TYPE_VIEW_CONFIGURATION_VIEW});
    XR_CHECK(xrEnumerateViewConfigurationViews(xr.instance, xr.systemId, xr.viewConfigType, viewCount, &viewCount, xr.configViews.data()));

    char msg[256];
    sprintf_s(msg, "OpenXR initialized: %d views, session_target=%s\n",
        viewCount, xr.hasSessionTargetExt ? "yes" : "no");
    OutputDebugStringA(msg);

    return true;
}

bool CreateSession(XrSessionManager& xr, ID3D11Device* d3d11Device, HWND hwnd) {
    xr.windowHandle = hwnd;

    // Get D3D11 graphics requirements
    XrGraphicsRequirementsD3D11KHR graphicsReq = {XR_TYPE_GRAPHICS_REQUIREMENTS_D3D11_KHR};

    // Get the function pointer for xrGetD3D11GraphicsRequirementsKHR
    PFN_xrGetD3D11GraphicsRequirementsKHR xrGetD3D11GraphicsRequirementsKHR = nullptr;
    XR_CHECK(xrGetInstanceProcAddr(xr.instance, "xrGetD3D11GraphicsRequirementsKHR",
        (PFN_xrVoidFunction*)&xrGetD3D11GraphicsRequirementsKHR));
    XR_CHECK(xrGetD3D11GraphicsRequirementsKHR(xr.instance, xr.systemId, &graphicsReq));

    // Build the next chain for session creation
    // D3D11 binding is required
    XrGraphicsBindingD3D11KHR d3d11Binding = {XR_TYPE_GRAPHICS_BINDING_D3D11_KHR};
    d3d11Binding.device = d3d11Device;

    // Session target extension - chain it to the D3D11 binding
    XrSessionTargetCreateInfoEXT sessionTarget = {XR_TYPE_SESSION_TARGET_CREATE_INFO_EXT};
    sessionTarget.windowHandle = hwnd;

    if (xr.hasSessionTargetExt && hwnd) {
        // Chain: sessionInfo -> d3d11Binding -> sessionTarget
        d3d11Binding.next = &sessionTarget;
        OutputDebugStringA("Using XR_EXT_session_target with window handle\n");
    }

    XrSessionCreateInfo sessionInfo = {XR_TYPE_SESSION_CREATE_INFO};
    sessionInfo.next = &d3d11Binding;
    sessionInfo.systemId = xr.systemId;

    XR_CHECK(xrCreateSession(xr.instance, &sessionInfo, &xr.session));

    return true;
}

bool CreateSpaces(XrSessionManager& xr) {
    // Create LOCAL reference space
    XrReferenceSpaceCreateInfo localSpaceInfo = {XR_TYPE_REFERENCE_SPACE_CREATE_INFO};
    localSpaceInfo.referenceSpaceType = XR_REFERENCE_SPACE_TYPE_LOCAL;
    localSpaceInfo.poseInReferenceSpace.orientation = {0, 0, 0, 1};
    localSpaceInfo.poseInReferenceSpace.position = {0, 0, 0};

    XR_CHECK(xrCreateReferenceSpace(xr.session, &localSpaceInfo, &xr.localSpace));

    // Create VIEW reference space
    XrReferenceSpaceCreateInfo viewSpaceInfo = {XR_TYPE_REFERENCE_SPACE_CREATE_INFO};
    viewSpaceInfo.referenceSpaceType = XR_REFERENCE_SPACE_TYPE_VIEW;
    viewSpaceInfo.poseInReferenceSpace.orientation = {0, 0, 0, 1};
    viewSpaceInfo.poseInReferenceSpace.position = {0, 0, 0};

    XR_CHECK(xrCreateReferenceSpace(xr.session, &viewSpaceInfo, &xr.viewSpace));

    return true;
}

bool CreateSwapchains(XrSessionManager& xr) {
    // Query supported swapchain formats
    uint32_t formatCount = 0;
    XR_CHECK(xrEnumerateSwapchainFormats(xr.session, 0, &formatCount, nullptr));

    std::vector<int64_t> formats(formatCount);
    XR_CHECK(xrEnumerateSwapchainFormats(xr.session, formatCount, &formatCount, formats.data()));

    // Prefer SRGB format
    int64_t selectedFormat = formats[0];
    for (int64_t format : formats) {
        if (format == DXGI_FORMAT_R8G8B8A8_UNORM_SRGB ||
            format == DXGI_FORMAT_B8G8R8A8_UNORM_SRGB) {
            selectedFormat = format;
            break;
        }
    }

    // Create swapchain for each eye
    for (int eye = 0; eye < 2 && eye < (int)xr.configViews.size(); eye++) {
        const auto& view = xr.configViews[eye];

        XrSwapchainCreateInfo swapchainInfo = {XR_TYPE_SWAPCHAIN_CREATE_INFO};
        swapchainInfo.usageFlags = XR_SWAPCHAIN_USAGE_COLOR_ATTACHMENT_BIT | XR_SWAPCHAIN_USAGE_SAMPLED_BIT;
        swapchainInfo.format = selectedFormat;
        swapchainInfo.sampleCount = view.recommendedSwapchainSampleCount;
        swapchainInfo.width = view.recommendedImageRectWidth;
        swapchainInfo.height = view.recommendedImageRectHeight;
        swapchainInfo.faceCount = 1;
        swapchainInfo.arraySize = 1;
        swapchainInfo.mipCount = 1;

        XR_CHECK(xrCreateSwapchain(xr.session, &swapchainInfo, &xr.swapchains[eye].swapchain));

        xr.swapchains[eye].format = selectedFormat;
        xr.swapchains[eye].width = swapchainInfo.width;
        xr.swapchains[eye].height = swapchainInfo.height;

        // Get swapchain images
        uint32_t imageCount = 0;
        XR_CHECK(xrEnumerateSwapchainImages(xr.swapchains[eye].swapchain, 0, &imageCount, nullptr));

        xr.swapchains[eye].images.resize(imageCount, {XR_TYPE_SWAPCHAIN_IMAGE_D3D11_KHR});
        XR_CHECK(xrEnumerateSwapchainImages(xr.swapchains[eye].swapchain, imageCount, &imageCount,
            (XrSwapchainImageBaseHeader*)xr.swapchains[eye].images.data()));

        char msg[256];
        sprintf_s(msg, "Created swapchain %d: %dx%d, %d images\n",
            eye, swapchainInfo.width, swapchainInfo.height, imageCount);
        OutputDebugStringA(msg);
    }

    return true;
}

bool PollEvents(XrSessionManager& xr) {
    XrEventDataBuffer event = {XR_TYPE_EVENT_DATA_BUFFER};

    while (xrPollEvent(xr.instance, &event) == XR_SUCCESS) {
        switch (event.type) {
        case XR_TYPE_EVENT_DATA_SESSION_STATE_CHANGED: {
            auto* stateEvent = (XrEventDataSessionStateChanged*)&event;
            xr.sessionState = stateEvent->state;

            char msg[256];
            sprintf_s(msg, "Session state changed: %s\n", GetSessionStateString(xr.sessionState));
            OutputDebugStringA(msg);

            switch (xr.sessionState) {
            case XR_SESSION_STATE_READY: {
                // Begin session
                XrSessionBeginInfo beginInfo = {XR_TYPE_SESSION_BEGIN_INFO};
                beginInfo.primaryViewConfigurationType = xr.viewConfigType;
                if (XR_SUCCEEDED(xrBeginSession(xr.session, &beginInfo))) {
                    xr.sessionRunning = true;
                }
                break;
            }
            case XR_SESSION_STATE_STOPPING:
                xrEndSession(xr.session);
                xr.sessionRunning = false;
                break;
            case XR_SESSION_STATE_EXITING:
            case XR_SESSION_STATE_LOSS_PENDING:
                xr.exitRequested = true;
                break;
            default:
                break;
            }
            break;
        }
        case XR_TYPE_EVENT_DATA_INSTANCE_LOSS_PENDING:
            xr.exitRequested = true;
            break;
        default:
            break;
        }

        event = {XR_TYPE_EVENT_DATA_BUFFER};
    }

    return true;
}

bool BeginFrame(XrSessionManager& xr, XrFrameState& frameState) {
    frameState = {XR_TYPE_FRAME_STATE};

    XrFrameWaitInfo waitInfo = {XR_TYPE_FRAME_WAIT_INFO};
    XrResult result = xrWaitFrame(xr.session, &waitInfo, &frameState);
    if (XR_FAILED(result)) return false;

    xr.predictedDisplayTime = frameState.predictedDisplayTime;
    xr.predictedDisplayPeriod = frameState.predictedDisplayPeriod;

    XrFrameBeginInfo beginInfo = {XR_TYPE_FRAME_BEGIN_INFO};
    result = xrBeginFrame(xr.session, &beginInfo);
    if (XR_FAILED(result)) return false;

    return true;
}

bool LocateViews(
    XrSessionManager& xr,
    XrTime displayTime,
    XMMATRIX& leftViewMatrix,
    XMMATRIX& leftProjMatrix,
    XMMATRIX& rightViewMatrix,
    XMMATRIX& rightProjMatrix
) {
    XrViewLocateInfo locateInfo = {XR_TYPE_VIEW_LOCATE_INFO};
    locateInfo.viewConfigurationType = xr.viewConfigType;
    locateInfo.displayTime = displayTime;
    locateInfo.space = xr.localSpace;

    XrViewState viewState = {XR_TYPE_VIEW_STATE};
    uint32_t viewCount = 2;
    XrView views[2] = {{XR_TYPE_VIEW}, {XR_TYPE_VIEW}};

    XrResult result = xrLocateViews(xr.session, &locateInfo, &viewState, 2, &viewCount, views);
    if (XR_FAILED(result)) return false;

    // Check if views are valid
    if ((viewState.viewStateFlags & XR_VIEW_STATE_POSITION_VALID_BIT) == 0 ||
        (viewState.viewStateFlags & XR_VIEW_STATE_ORIENTATION_VALID_BIT) == 0) {
        return false;
    }

    // Convert to matrices
    leftViewMatrix = XrPoseToViewMatrix(views[0].pose);
    leftProjMatrix = XrFovToProjectionMatrix(views[0].fov, 0.01f, 100.0f);
    rightViewMatrix = XrPoseToViewMatrix(views[1].pose);
    rightProjMatrix = XrFovToProjectionMatrix(views[1].fov, 0.01f, 100.0f);

    // Extract eye tracking info from view poses
    // Average the eye positions for display
    xr.eyePosX = (views[0].pose.position.x + views[1].pose.position.x) / 2.0f;
    xr.eyePosY = (views[0].pose.position.y + views[1].pose.position.y) / 2.0f;
    xr.eyeTrackingActive = (viewState.viewStateFlags & XR_VIEW_STATE_POSITION_TRACKED_BIT) != 0;

    return true;
}

bool AcquireSwapchainImage(XrSessionManager& xr, int eye, uint32_t& imageIndex) {
    XrSwapchainImageAcquireInfo acquireInfo = {XR_TYPE_SWAPCHAIN_IMAGE_ACQUIRE_INFO};
    XrResult result = xrAcquireSwapchainImage(xr.swapchains[eye].swapchain, &acquireInfo, &imageIndex);
    if (XR_FAILED(result)) return false;

    XrSwapchainImageWaitInfo waitInfo = {XR_TYPE_SWAPCHAIN_IMAGE_WAIT_INFO};
    waitInfo.timeout = XR_INFINITE_DURATION;
    result = xrWaitSwapchainImage(xr.swapchains[eye].swapchain, &waitInfo);
    if (XR_FAILED(result)) return false;

    return true;
}

bool ReleaseSwapchainImage(XrSessionManager& xr, int eye) {
    XrSwapchainImageReleaseInfo releaseInfo = {XR_TYPE_SWAPCHAIN_IMAGE_RELEASE_INFO};
    return XR_SUCCEEDED(xrReleaseSwapchainImage(xr.swapchains[eye].swapchain, &releaseInfo));
}

bool EndFrame(XrSessionManager& xr, XrTime displayTime, const XrCompositionLayerProjectionView* views) {
    XrCompositionLayerProjection projectionLayer = {XR_TYPE_COMPOSITION_LAYER_PROJECTION};
    projectionLayer.space = xr.localSpace;
    projectionLayer.viewCount = 2;
    projectionLayer.views = views;

    const XrCompositionLayerBaseHeader* layers[] = {
        (XrCompositionLayerBaseHeader*)&projectionLayer
    };

    XrFrameEndInfo endInfo = {XR_TYPE_FRAME_END_INFO};
    endInfo.displayTime = displayTime;
    endInfo.environmentBlendMode = XR_ENVIRONMENT_BLEND_MODE_OPAQUE;
    endInfo.layerCount = 1;
    endInfo.layers = layers;

    return XR_SUCCEEDED(xrEndFrame(xr.session, &endInfo));
}

void CleanupOpenXR(XrSessionManager& xr) {
    for (int eye = 0; eye < 2; eye++) {
        if (xr.swapchains[eye].swapchain != XR_NULL_HANDLE) {
            xrDestroySwapchain(xr.swapchains[eye].swapchain);
            xr.swapchains[eye].swapchain = XR_NULL_HANDLE;
        }
    }

    if (xr.viewSpace != XR_NULL_HANDLE) {
        xrDestroySpace(xr.viewSpace);
        xr.viewSpace = XR_NULL_HANDLE;
    }

    if (xr.localSpace != XR_NULL_HANDLE) {
        xrDestroySpace(xr.localSpace);
        xr.localSpace = XR_NULL_HANDLE;
    }

    if (xr.session != XR_NULL_HANDLE) {
        xrDestroySession(xr.session);
        xr.session = XR_NULL_HANDLE;
    }

    if (xr.instance != XR_NULL_HANDLE) {
        xrDestroyInstance(xr.instance);
        xr.instance = XR_NULL_HANDLE;
    }
}

const char* GetSessionStateString(XrSessionState state) {
    switch (state) {
    case XR_SESSION_STATE_UNKNOWN: return "UNKNOWN";
    case XR_SESSION_STATE_IDLE: return "IDLE";
    case XR_SESSION_STATE_READY: return "READY";
    case XR_SESSION_STATE_SYNCHRONIZED: return "SYNCHRONIZED";
    case XR_SESSION_STATE_VISIBLE: return "VISIBLE";
    case XR_SESSION_STATE_FOCUSED: return "FOCUSED";
    case XR_SESSION_STATE_STOPPING: return "STOPPING";
    case XR_SESSION_STATE_LOSS_PENDING: return "LOSS_PENDING";
    case XR_SESSION_STATE_EXITING: return "EXITING";
    default: return "INVALID";
    }
}

void RequestExit(XrSessionManager& xr) {
    if (xr.session != XR_NULL_HANDLE && xr.sessionRunning) {
        xrRequestExitSession(xr.session);
    }
    xr.exitRequested = true;
}
