// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Header for XR_EXT_session_target extension
 * @author David Fattal
 * @ingroup external_openxr
 *
 * This extension allows an OpenXR application to provide its own window handle
 * (HWND on Windows) to the runtime. When provided, the runtime will render
 * into the application's window instead of creating its own window.
 *
 * This enables:
 * - Windowed mode rendering (vs fullscreen)
 * - Application control over window input (keyboard, mouse)
 * - Multiple OpenXR applications on the same display
 */
#ifndef XR_EXT_SESSION_TARGET_H
#define XR_EXT_SESSION_TARGET_H 1

#include <openxr/openxr.h>

#ifdef __cplusplus
extern "C" {
#endif

#define XR_EXT_session_target 1
#define XR_EXT_session_target_SPEC_VERSION 2
#define XR_EXT_SESSION_TARGET_EXTENSION_NAME "XR_EXT_session_target"

// Use a value in the vendor extension range (1000000000+)
// This should be replaced with an official Khronos-assigned value if the extension is standardized
#define XR_TYPE_SESSION_TARGET_CREATE_INFO_EXT ((XrStructureType)1000999001)
#define XR_TYPE_COMPOSITION_LAYER_WINDOW_SPACE_EXT ((XrStructureType)1000999002)

/*!
 * @brief Structure passed in XrSessionCreateInfo::next chain to provide
 *        an external window handle for session rendering.
 *
 * When this structure is provided in the next chain of XrSessionCreateInfo,
 * the runtime will render into the specified window instead of creating
 * its own window. The application is responsible for:
 * - Creating and managing the window lifecycle
 * - Handling the window message pump
 * - Processing input events
 *
 * @extends XrSessionCreateInfo
 */
typedef struct XrSessionTargetCreateInfoEXT {
    XrStructureType             type;           //!< Must be XR_TYPE_SESSION_TARGET_CREATE_INFO_EXT
    const void* XR_MAY_ALIAS    next;           //!< Pointer to next structure in chain
#ifdef _WIN32
    void*                       windowHandle;   //!< HWND of the target window (Windows only)
#else
    void*                       windowHandle;   //!< Platform-specific window handle (reserved)
#endif
} XrSessionTargetCreateInfoEXT;

/*!
 * @brief Composition layer positioned in fractional window coordinates.
 *
 * This layer type renders a textured quad at a position specified as fractions
 * of the target window dimensions. The coordinates automatically scale when the
 * window is resized.
 *
 * The same texture is composited into both eye views with a per-eye horizontal
 * shift controlled by the disparity parameter. The layer is rendered pre-interlace
 * (passes through the weaver like any other layer).
 *
 * This layer type is only valid when the session was created with
 * XrSessionTargetCreateInfoEXT (i.e., rendering to an application-provided window).
 *
 * @extends XrFrameEndInfo (submitted as a composition layer)
 */
typedef struct XrCompositionLayerWindowSpaceEXT {
    XrStructureType             type;       //!< Must be XR_TYPE_COMPOSITION_LAYER_WINDOW_SPACE_EXT
    const void* XR_MAY_ALIAS    next;       //!< Pointer to next structure in chain
    XrCompositionLayerFlags     layerFlags; //!< e.g. XR_COMPOSITION_LAYER_BLEND_TEXTURE_SOURCE_ALPHA_BIT
    XrSwapchainSubImage         subImage;   //!< Source swapchain + rect
    float                       x;          //!< Left edge, fraction of window width  [0..1]
    float                       y;          //!< Top edge, fraction of window height   [0..1]
    float                       width;      //!< Fraction of window width  [0..1]
    float                       height;     //!< Fraction of window height [0..1]
    float                       disparity;  //!< Horizontal shift, fraction of window width.
                                            //!< 0 = screen depth, negative = toward viewer
} XrCompositionLayerWindowSpaceEXT;

#ifdef __cplusplus
}
#endif

#endif // XR_EXT_SESSION_TARGET_H
