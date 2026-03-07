// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  D3D12 renderer for layer compositing.
 * @author David Fattal
 * @ingroup comp_d3d12
 */

#pragma once

#include "xrt/xrt_defines.h"
#include "xrt/xrt_results.h"

#include <stdint.h>
#include <stdbool.h>

// Forward declarations (C++ structs)
struct comp_d3d12_renderer;
struct comp_d3d12_compositor;
struct comp_layer_accum;

#ifdef __cplusplus
extern "C" {
#endif

/*!
 * Create a D3D12 renderer.
 *
 * @param c The D3D12 compositor.
 * @param view_width Width of one view (half of stereo texture width).
 * @param view_height Height of the views.
 * @param target_height Height of the render target (window).
 * @param out_renderer Pointer to receive the created renderer.
 *
 * @return XRT_SUCCESS on success, error code otherwise.
 *
 * @ingroup comp_d3d12
 */
xrt_result_t
comp_d3d12_renderer_create(struct comp_d3d12_compositor *c,
                           uint32_t view_width,
                           uint32_t view_height,
                           uint32_t target_height,
                           struct comp_d3d12_renderer **out_renderer);

/*!
 * Destroy a D3D12 renderer.
 *
 * @ingroup comp_d3d12
 */
void
comp_d3d12_renderer_destroy(struct comp_d3d12_renderer **renderer_ptr);

/*!
 * Render all accumulated layers to the side-by-side stereo texture.
 *
 * @param renderer The renderer.
 * @param cmd_list D3D12 command list to record onto (void* = ID3D12GraphicsCommandList*).
 * @param layers The accumulated layers.
 * @param left_eye Left eye position for projection (NULL for default).
 * @param right_eye Right eye position for projection (NULL for default).
 * @param target_width Width of the render target (window).
 * @param target_height Height of the render target (window).
 * @param force_mono If true, render 1 view even if app submitted 2.
 *
 * @return XRT_SUCCESS on success, error code otherwise.
 *
 * @ingroup comp_d3d12
 */
xrt_result_t
comp_d3d12_renderer_draw(struct comp_d3d12_renderer *renderer,
                         void *cmd_list,
                         struct comp_layer_accum *layers,
                         struct xrt_vec3 *left_eye,
                         struct xrt_vec3 *right_eye,
                         uint32_t target_width,
                         uint32_t target_height,
                         bool force_mono);

/*!
 * Get the stereo texture SRV GPU descriptor handle for weaving.
 *
 * @param renderer The renderer.
 * @return D3D12_GPU_DESCRIPTOR_HANDLE as uint64_t.
 *
 * @ingroup comp_d3d12
 */
uint64_t
comp_d3d12_renderer_get_stereo_srv_handle(struct comp_d3d12_renderer *renderer);

/*!
 * Get stereo texture dimensions.
 *
 * @param renderer The renderer.
 * @param out_view_width Width of one view.
 * @param out_view_height Height of views.
 *
 * @ingroup comp_d3d12
 */
void
comp_d3d12_renderer_get_view_dimensions(struct comp_d3d12_renderer *renderer,
                                        uint32_t *out_view_width,
                                        uint32_t *out_view_height);

/*!
 * Get the stereo texture resource for direct copy.
 *
 * @param renderer The renderer.
 * @return Pointer to ID3D12Resource.
 *
 * @ingroup comp_d3d12
 */
void *
comp_d3d12_renderer_get_stereo_resource(struct comp_d3d12_renderer *renderer);

#ifdef __cplusplus
}
#endif
