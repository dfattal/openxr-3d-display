// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  OpenXR session management (standard mode, no session_target extension)
 */

#include "xr_session.h"
#include "logging.h"
#include <cstring>
#include <cmath>

using namespace DirectX;

// Helper macro for XR error checking with logging
#define XR_CHECK(call) \
    do { \
        XrResult result = (call); \
        if (XR_FAILED(result)) { \
            LogXrResult(#call, result); \
            return false; \
        } \
    } while (0)

#define XR_CHECK_LOG(call) \
    do { \
        XrResult result = (call); \
        LogXrResult(#call, result); \
        if (XR_FAILED(result)) { \
            return false; \
        } \
    } while (0)

static XMMATRIX XrPoseToViewMatrix(const XrPosef& pose) {
    XMVECTOR orientation = XMVectorSet(pose.orientation.x, pose.orientation.y, pose.orientation.z, pose.orientation.w);

    XMMATRIX rotation = XMMatrixRotationQuaternion(orientation);
    rotation = XMMatrixTranspose(rotation);

    XMMATRIX translation = XMMatrixTranslation(-pose.position.x, -pose.position.y, -pose.position.z);

    return translation * rotation;
}

static XMMATRIX XrFovToProjectionMatrix(const XrFovf& fov, float nearZ, float farZ) {
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
    LOG_INFO("Querying OpenXR instance extension properties...");

    uint32_t extensionCount = 0;
    XR_CHECK_LOG(xrEnumerateInstanceExtensionProperties(nullptr, 0, &extensionCount, nullptr));
    LOG_INFO("Found %u extensions available", extensionCount);

    std::vector<XrExtensionProperties> extensions(extensionCount, {XR_TYPE_EXTENSION_PROPERTIES});
    XR_CHECK(xrEnumerateInstanceExtensionProperties(nullptr, extensionCount, &extensionCount, extensions.data()));

    LOG_INFO("Available extensions:");
    bool hasD3D11 = false;

    for (const auto& ext : extensions) {
        LOG_DEBUG("  %s (v%u)", ext.extensionName, ext.extensionVersion);
        if (strcmp(ext.extensionName, XR_KHR_D3D11_ENABLE_EXTENSION_NAME) == 0) {
            hasD3D11 = true;
        }
    }

    LOG_INFO("XR_KHR_D3D11_enable: %s", hasD3D11 ? "AVAILABLE" : "NOT FOUND");

    if (!hasD3D11) {
        LOG_ERROR("XR_KHR_D3D11_enable extension not available - cannot continue");
        return false;
    }

    // Only enable D3D11, NOT session_target
    std::vector<const char*> enabledExtensions;
    enabledExtensions.push_back(XR_KHR_D3D11_ENABLE_EXTENSION_NAME);

    LOG_INFO("Enabling %zu extensions:", enabledExtensions.size());
    for (const auto& ext : enabledExtensions) {
        LOG_INFO("  %s", ext);
    }

    LOG_INFO("Creating OpenXR instance...");
    XrInstanceCreateInfo createInfo = {XR_TYPE_INSTANCE_CREATE_INFO};
    strcpy_s(createInfo.applicationInfo.applicationName, "SRCubeOpenXR");
    createInfo.applicationInfo.applicationVersion = 1;
    strcpy_s(createInfo.applicationInfo.engineName, "None");
    createInfo.applicationInfo.engineVersion = 0;
    createInfo.applicationInfo.apiVersion = XR_CURRENT_API_VERSION;
    createInfo.enabledExtensionCount = (uint32_t)enabledExtensions.size();
    createInfo.enabledExtensionNames = enabledExtensions.data();

    XR_CHECK_LOG(xrCreateInstance(&createInfo, &xr.instance));
    LOG_INFO("OpenXR instance created: 0x%p", (void*)xr.instance);

    LOG_INFO("Getting system for HMD form factor...");
    XrSystemGetInfo systemInfo = {XR_TYPE_SYSTEM_GET_INFO};
    systemInfo.formFactor = XR_FORM_FACTOR_HEAD_MOUNTED_DISPLAY;
    XR_CHECK_LOG(xrGetSystem(xr.instance, &systemInfo, &xr.systemId));
    LOG_INFO("System ID: %llu", (unsigned long long)xr.systemId);

    LOG_INFO("Enumerating view configuration views...");
    uint32_t viewCount = 0;
    XR_CHECK(xrEnumerateViewConfigurationViews(xr.instance, xr.systemId, xr.viewConfigType, 0, &viewCount, nullptr));

    xr.configViews.resize(viewCount, {XR_TYPE_VIEW_CONFIGURATION_VIEW});
    XR_CHECK(xrEnumerateViewConfigurationViews(xr.instance, xr.systemId, xr.viewConfigType, viewCount, &viewCount, xr.configViews.data()));

    LOG_INFO("View configuration: %u views", viewCount);
    for (uint32_t i = 0; i < viewCount; i++) {
        const auto& view = xr.configViews[i];
        LOG_INFO("  View %u: recommended %ux%u, max %ux%u",
            i, view.recommendedImageRectWidth, view.recommendedImageRectHeight,
            view.maxImageRectWidth, view.maxImageRectHeight);
    }

    LOG_INFO("OpenXR initialization complete");
    return true;
}

bool GetD3D11GraphicsRequirements(XrSessionManager& xr, LUID* outAdapterLuid) {
    LOG_INFO("Getting D3D11 graphics requirements...");

    PFN_xrGetD3D11GraphicsRequirementsKHR xrGetD3D11GraphicsRequirementsKHR = nullptr;
    XrResult result = xrGetInstanceProcAddr(xr.instance, "xrGetD3D11GraphicsRequirementsKHR",
        (PFN_xrVoidFunction*)&xrGetD3D11GraphicsRequirementsKHR);
    if (XR_FAILED(result) || !xrGetD3D11GraphicsRequirementsKHR) {
        LOG_ERROR("Failed to get xrGetD3D11GraphicsRequirementsKHR function pointer");
        return false;
    }

    XrGraphicsRequirementsD3D11KHR graphicsReq = {XR_TYPE_GRAPHICS_REQUIREMENTS_D3D11_KHR};
    result = xrGetD3D11GraphicsRequirementsKHR(xr.instance, xr.systemId, &graphicsReq);
    if (XR_FAILED(result)) {
        LogXrResult("xrGetD3D11GraphicsRequirementsKHR", result);
        return false;
    }

    LOG_INFO("D3D11 graphics requirements:");
    LOG_INFO("  Adapter LUID: 0x%08X%08X", graphicsReq.adapterLuid.HighPart, graphicsReq.adapterLuid.LowPart);
    LOG_INFO("  Min Feature Level: %d", graphicsReq.minFeatureLevel);

    *outAdapterLuid = graphicsReq.adapterLuid;
    return true;
}

bool CreateSession(XrSessionManager& xr, ID3D11Device* d3d11Device) {
    LOG_INFO("Creating OpenXR session (Monado creates window)...");
    LOG_INFO("  D3D11 Device: 0x%p", d3d11Device);

    PFN_xrGetD3D11GraphicsRequirementsKHR xrGetD3D11GraphicsRequirementsKHR = nullptr;
    XR_CHECK_LOG(xrGetInstanceProcAddr(xr.instance, "xrGetD3D11GraphicsRequirementsKHR",
        (PFN_xrVoidFunction*)&xrGetD3D11GraphicsRequirementsKHR));

    XrGraphicsRequirementsD3D11KHR graphicsReq = {XR_TYPE_GRAPHICS_REQUIREMENTS_D3D11_KHR};
    XR_CHECK_LOG(xrGetD3D11GraphicsRequirementsKHR(xr.instance, xr.systemId, &graphicsReq));

    XrGraphicsBindingD3D11KHR d3d11Binding = {XR_TYPE_GRAPHICS_BINDING_D3D11_KHR};
    d3d11Binding.device = d3d11Device;
    d3d11Binding.next = nullptr;

    XrSessionCreateInfo sessionInfo = {XR_TYPE_SESSION_CREATE_INFO};
    sessionInfo.next = &d3d11Binding;
    sessionInfo.systemId = xr.systemId;

    LOG_INFO("Calling xrCreateSession...");
    XR_CHECK_LOG(xrCreateSession(xr.instance, &sessionInfo, &xr.session));
    LOG_INFO("Session created: 0x%p", (void*)xr.session);

    return true;
}

bool CreateSpaces(XrSessionManager& xr) {
    LOG_INFO("Creating reference spaces...");

    XrReferenceSpaceCreateInfo localSpaceInfo = {XR_TYPE_REFERENCE_SPACE_CREATE_INFO};
    localSpaceInfo.referenceSpaceType = XR_REFERENCE_SPACE_TYPE_LOCAL;
    localSpaceInfo.poseInReferenceSpace.orientation = {0, 0, 0, 1};
    localSpaceInfo.poseInReferenceSpace.position = {0, 0, 0};

    XR_CHECK_LOG(xrCreateReferenceSpace(xr.session, &localSpaceInfo, &xr.localSpace));
    LOG_INFO("LOCAL space created: 0x%p", (void*)xr.localSpace);

    XrReferenceSpaceCreateInfo viewSpaceInfo = {XR_TYPE_REFERENCE_SPACE_CREATE_INFO};
    viewSpaceInfo.referenceSpaceType = XR_REFERENCE_SPACE_TYPE_VIEW;
    viewSpaceInfo.poseInReferenceSpace.orientation = {0, 0, 0, 1};
    viewSpaceInfo.poseInReferenceSpace.position = {0, 0, 0};

    XR_CHECK_LOG(xrCreateReferenceSpace(xr.session, &viewSpaceInfo, &xr.viewSpace));
    LOG_INFO("VIEW space created: 0x%p", (void*)xr.viewSpace);

    return true;
}

bool CreateSwapchains(XrSessionManager& xr) {
    LOG_INFO("Creating swapchains...");

    uint32_t formatCount = 0;
    XR_CHECK_LOG(xrEnumerateSwapchainFormats(xr.session, 0, &formatCount, nullptr));

    std::vector<int64_t> formats(formatCount);
    XR_CHECK(xrEnumerateSwapchainFormats(xr.session, formatCount, &formatCount, formats.data()));

    int64_t selectedFormat = formats[0];
    for (int64_t format : formats) {
        if (format == DXGI_FORMAT_R8G8B8A8_UNORM || format == DXGI_FORMAT_B8G8R8A8_UNORM) {
            selectedFormat = format;
            break;
        }
    }
    LOG_INFO("Selected swapchain format: %lld", selectedFormat);

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

        LOG_INFO("Creating swapchain for eye %d: %ux%u", eye, swapchainInfo.width, swapchainInfo.height);

        XR_CHECK_LOG(xrCreateSwapchain(xr.session, &swapchainInfo, &xr.swapchains[eye].swapchain));

        xr.swapchains[eye].format = selectedFormat;
        xr.swapchains[eye].width = swapchainInfo.width;
        xr.swapchains[eye].height = swapchainInfo.height;

        uint32_t imageCount = 0;
        XR_CHECK(xrEnumerateSwapchainImages(xr.swapchains[eye].swapchain, 0, &imageCount, nullptr));

        xr.swapchains[eye].images.resize(imageCount, {XR_TYPE_SWAPCHAIN_IMAGE_D3D11_KHR});
        XR_CHECK(xrEnumerateSwapchainImages(xr.swapchains[eye].swapchain, imageCount, &imageCount,
            (XrSwapchainImageBaseHeader*)xr.swapchains[eye].images.data()));

        LOG_INFO("  Got %u swapchain images", imageCount);
    }

    LOG_INFO("Swapchains created successfully");
    return true;
}

bool CreateQuadLayerSwapchain(XrSessionManager& xr, uint32_t width, uint32_t height) {
    LOG_INFO("Creating quad layer swapchain for UI overlay (%ux%u)...", width, height);

    uint32_t formatCount = 0;
    XR_CHECK(xrEnumerateSwapchainFormats(xr.session, 0, &formatCount, nullptr));

    std::vector<int64_t> formats(formatCount);
    XR_CHECK(xrEnumerateSwapchainFormats(xr.session, formatCount, &formatCount, formats.data()));

    int64_t selectedFormat = formats[0];
    for (int64_t format : formats) {
        if (format == DXGI_FORMAT_R8G8B8A8_UNORM || format == DXGI_FORMAT_B8G8R8A8_UNORM) {
            selectedFormat = format;
            break;
        }
    }
    LOG_INFO("Selected quad swapchain format: %lld", selectedFormat);

    XrSwapchainCreateInfo swapchainInfo = {XR_TYPE_SWAPCHAIN_CREATE_INFO};
    swapchainInfo.usageFlags = XR_SWAPCHAIN_USAGE_COLOR_ATTACHMENT_BIT | XR_SWAPCHAIN_USAGE_SAMPLED_BIT;
    swapchainInfo.format = selectedFormat;
    swapchainInfo.sampleCount = 1;
    swapchainInfo.width = width;
    swapchainInfo.height = height;
    swapchainInfo.faceCount = 1;
    swapchainInfo.arraySize = 1;
    swapchainInfo.mipCount = 1;

    XR_CHECK_LOG(xrCreateSwapchain(xr.session, &swapchainInfo, &xr.quadSwapchain.swapchain));
    LOG_INFO("Quad swapchain created: 0x%p", (void*)xr.quadSwapchain.swapchain);

    xr.quadSwapchain.format = selectedFormat;
    xr.quadSwapchain.width = width;
    xr.quadSwapchain.height = height;

    uint32_t imageCount = 0;
    XR_CHECK(xrEnumerateSwapchainImages(xr.quadSwapchain.swapchain, 0, &imageCount, nullptr));

    xr.quadSwapchain.images.resize(imageCount, {XR_TYPE_SWAPCHAIN_IMAGE_D3D11_KHR});
    XR_CHECK(xrEnumerateSwapchainImages(xr.quadSwapchain.swapchain, imageCount, &imageCount,
        (XrSwapchainImageBaseHeader*)xr.quadSwapchain.images.data()));

    LOG_INFO("Got %u quad swapchain images", imageCount);
    xr.hasQuadLayer = true;

    return true;
}

bool AcquireQuadSwapchainImage(XrSessionManager& xr, uint32_t& imageIndex) {
    if (!xr.hasQuadLayer) return false;

    XrSwapchainImageAcquireInfo acquireInfo = {XR_TYPE_SWAPCHAIN_IMAGE_ACQUIRE_INFO};
    if (XR_FAILED(xrAcquireSwapchainImage(xr.quadSwapchain.swapchain, &acquireInfo, &imageIndex))) return false;

    XrSwapchainImageWaitInfo waitInfo = {XR_TYPE_SWAPCHAIN_IMAGE_WAIT_INFO};
    waitInfo.timeout = XR_INFINITE_DURATION;
    return XR_SUCCEEDED(xrWaitSwapchainImage(xr.quadSwapchain.swapchain, &waitInfo));
}

bool ReleaseQuadSwapchainImage(XrSessionManager& xr) {
    if (!xr.hasQuadLayer) return false;

    XrSwapchainImageReleaseInfo releaseInfo = {XR_TYPE_SWAPCHAIN_IMAGE_RELEASE_INFO};
    return XR_SUCCEEDED(xrReleaseSwapchainImage(xr.quadSwapchain.swapchain, &releaseInfo));
}

bool PollEvents(XrSessionManager& xr) {
    XrEventDataBuffer event = {XR_TYPE_EVENT_DATA_BUFFER};

    while (xrPollEvent(xr.instance, &event) == XR_SUCCESS) {
        switch (event.type) {
        case XR_TYPE_EVENT_DATA_SESSION_STATE_CHANGED: {
            auto* stateEvent = (XrEventDataSessionStateChanged*)&event;
            XrSessionState oldState = xr.sessionState;
            xr.sessionState = stateEvent->state;

            LOG_INFO("Session state changed: %s -> %s",
                GetSessionStateString(oldState), GetSessionStateString(xr.sessionState));

            switch (xr.sessionState) {
            case XR_SESSION_STATE_READY: {
                XrSessionBeginInfo beginInfo = {XR_TYPE_SESSION_BEGIN_INFO};
                beginInfo.primaryViewConfigurationType = xr.viewConfigType;
                XrResult result = xrBeginSession(xr.session, &beginInfo);
                if (XR_SUCCEEDED(result)) {
                    xr.sessionRunning = true;
                    LOG_INFO("Session is now running");
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
    if (XR_FAILED(xrWaitFrame(xr.session, &waitInfo, &frameState))) return false;

    xr.predictedDisplayTime = frameState.predictedDisplayTime;
    xr.predictedDisplayPeriod = frameState.predictedDisplayPeriod;

    XrFrameBeginInfo beginInfo = {XR_TYPE_FRAME_BEGIN_INFO};
    return XR_SUCCEEDED(xrBeginFrame(xr.session, &beginInfo));
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

    if (XR_FAILED(xrLocateViews(xr.session, &locateInfo, &viewState, 2, &viewCount, views))) return false;

    if ((viewState.viewStateFlags & XR_VIEW_STATE_POSITION_VALID_BIT) == 0 ||
        (viewState.viewStateFlags & XR_VIEW_STATE_ORIENTATION_VALID_BIT) == 0) {
        return false;
    }

    leftViewMatrix = XrPoseToViewMatrix(views[0].pose);
    leftProjMatrix = XrFovToProjectionMatrix(views[0].fov, 0.01f, 100.0f);
    rightViewMatrix = XrPoseToViewMatrix(views[1].pose);
    rightProjMatrix = XrFovToProjectionMatrix(views[1].fov, 0.01f, 100.0f);

    xr.eyePosX = (views[0].pose.position.x + views[1].pose.position.x) / 2.0f;
    xr.eyePosY = (views[0].pose.position.y + views[1].pose.position.y) / 2.0f;
    xr.eyePosZ = (views[0].pose.position.z + views[1].pose.position.z) / 2.0f;
    xr.eyeTrackingActive = (viewState.viewStateFlags & XR_VIEW_STATE_POSITION_TRACKED_BIT) != 0;

    return true;
}

bool AcquireSwapchainImage(XrSessionManager& xr, int eye, uint32_t& imageIndex) {
    XrSwapchainImageAcquireInfo acquireInfo = {XR_TYPE_SWAPCHAIN_IMAGE_ACQUIRE_INFO};
    if (XR_FAILED(xrAcquireSwapchainImage(xr.swapchains[eye].swapchain, &acquireInfo, &imageIndex))) return false;

    XrSwapchainImageWaitInfo waitInfo = {XR_TYPE_SWAPCHAIN_IMAGE_WAIT_INFO};
    waitInfo.timeout = XR_INFINITE_DURATION;
    return XR_SUCCEEDED(xrWaitSwapchainImage(xr.swapchains[eye].swapchain, &waitInfo));
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

    const XrCompositionLayerBaseHeader* layers[] = { (XrCompositionLayerBaseHeader*)&projectionLayer };

    XrFrameEndInfo endInfo = {XR_TYPE_FRAME_END_INFO};
    endInfo.displayTime = displayTime;
    endInfo.environmentBlendMode = XR_ENVIRONMENT_BLEND_MODE_OPAQUE;
    endInfo.layerCount = 1;
    endInfo.layers = layers;

    return XR_SUCCEEDED(xrEndFrame(xr.session, &endInfo));
}

bool EndFrameWithQuadLayer(
    XrSessionManager& xr,
    XrTime displayTime,
    const XrCompositionLayerProjectionView* projViews,
    float quadPosX, float quadPosY, float quadPosZ,
    float quadWidth, float quadHeight
) {
    XrCompositionLayerProjection projectionLayer = {XR_TYPE_COMPOSITION_LAYER_PROJECTION};
    projectionLayer.space = xr.localSpace;
    projectionLayer.viewCount = 2;
    projectionLayer.views = projViews;

    XrCompositionLayerQuad quadLayer = {XR_TYPE_COMPOSITION_LAYER_QUAD};
    quadLayer.layerFlags = XR_COMPOSITION_LAYER_BLEND_TEXTURE_SOURCE_ALPHA_BIT;
    quadLayer.space = xr.viewSpace;
    quadLayer.eyeVisibility = XR_EYE_VISIBILITY_BOTH;
    quadLayer.subImage.swapchain = xr.quadSwapchain.swapchain;
    quadLayer.subImage.imageRect.offset = {0, 0};
    quadLayer.subImage.imageRect.extent = {
        (int32_t)xr.quadSwapchain.width,
        (int32_t)xr.quadSwapchain.height
    };
    quadLayer.subImage.imageArrayIndex = 0;
    quadLayer.pose.position = {quadPosX, quadPosY, quadPosZ};
    quadLayer.pose.orientation = {0.0f, 0.0f, 0.0f, 1.0f};
    quadLayer.size = {quadWidth, quadHeight};

    const XrCompositionLayerBaseHeader* layers[] = {
        (XrCompositionLayerBaseHeader*)&projectionLayer,
        (XrCompositionLayerBaseHeader*)&quadLayer
    };

    XrFrameEndInfo endInfo = {XR_TYPE_FRAME_END_INFO};
    endInfo.displayTime = displayTime;
    endInfo.environmentBlendMode = XR_ENVIRONMENT_BLEND_MODE_OPAQUE;
    endInfo.layerCount = xr.hasQuadLayer ? 2 : 1;
    endInfo.layers = layers;

    return XR_SUCCEEDED(xrEndFrame(xr.session, &endInfo));
}

void CleanupOpenXR(XrSessionManager& xr) {
    LOG_INFO("Cleaning up OpenXR resources...");

    if (xr.quadSwapchain.swapchain != XR_NULL_HANDLE) {
        xrDestroySwapchain(xr.quadSwapchain.swapchain);
        xr.quadSwapchain.swapchain = XR_NULL_HANDLE;
        xr.hasQuadLayer = false;
    }

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

    LOG_INFO("OpenXR cleanup complete");
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
