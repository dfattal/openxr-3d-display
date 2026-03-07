// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Leia D3D12 display processor: wraps SR SDK D3D12 weaver
 *         as an @ref xrt_display_processor_d3d12 implementation.
 * @author David Fattal
 * @ingroup drv_leia
 */

#pragma once

#include "xrt/xrt_display_processor_d3d12.h"
#include "xrt/xrt_results.h"

#ifdef __cplusplus
extern "C" {
#endif

struct leiasr_d3d12;

/*!
 * Factory function for creating a Leia SR D3D12 display processor.
 *
 * Matches the @ref xrt_dp_factory_d3d12_fn_t signature.
 * Creates an SR D3D12 weaver internally and owns it for the lifetime
 * of the display processor.
 */
xrt_result_t
leia_dp_factory_d3d12(void *d3d12_device,
                      void *d3d12_command_queue,
                      void *window_handle,
                      struct xrt_display_processor_d3d12 **out_xdp);

#ifdef __cplusplus
}
#endif
