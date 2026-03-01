// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Leia display processor: wraps SR SDK and CNSDK weavers
 *         as @ref xrt_display_processor implementations.
 * @author David Fattal
 * @ingroup drv_leia
 */

#pragma once

#include "xrt/xrt_display_processor.h"
#include "xrt/xrt_results.h"

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

struct leiasr;

/*!
 * Factory function for creating a Leia SR Vulkan display processor.
 *
 * Matches the @ref xrt_dp_factory_vk_fn_t signature.
 * Creates an SR weaver internally and owns it for the lifetime of
 * the display processor.
 *
 * Set this as dp_factory_vk in xrt_system_compositor_info from
 * the Leia target builder.
 */
xrt_result_t
leia_dp_factory_vk(void *vk_bundle,
                   void *vk_cmd_pool,
                   void *window_handle,
                   int32_t target_format,
                   struct xrt_display_processor **out_xdp);

/*!
 * Create an @ref xrt_display_processor that wraps a Leia SR SDK
 * Vulkan weaver (leiasr_weave).
 *
 * Legacy API — the processor takes ownership of the leiasr instance
 * and will destroy it when the processor is destroyed.
 *
 * @param leiasr  Existing SR Vulkan weaver (ownership transferred to processor).
 * @param[out] out_xdp  Receives the created display processor.
 * @return XRT_SUCCESS on success.
 */
xrt_result_t
leia_display_processor_create(struct leiasr *leiasr,
                               struct xrt_display_processor **out_xdp);

#ifdef __cplusplus
}
#endif
