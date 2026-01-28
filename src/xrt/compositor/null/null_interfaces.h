// Copyright 2019-2024, Collabora, Ltd.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Header for null compositor interfaces.
 *
 * @author Jakob Bornecrantz <jakob@collabora.com>
 * @ingroup comp_null
 */


#pragma once

#include "xrt/xrt_results.h"
#include <stdint.h>


#ifdef __cplusplus
extern "C" {
#endif


struct xrt_device;
struct xrt_system_compositor;

/*!
 * Creates a @ref null_compositor.
 *
 * @ingroup comp_null
 */
xrt_result_t
null_compositor_create_system(struct xrt_device *xdev, struct xrt_system_compositor **out_xsysc);

/*!
 * Creates a @ref null_compositor with specified recommended view dimensions.
 *
 * This variant allows passing custom recommended dimensions (e.g., from SR display)
 * instead of using the default hardcoded values.
 *
 * @param xdev The device to create the compositor for.
 * @param recommended_width Recommended view width per eye (0 to use default).
 * @param recommended_height Recommended view height per eye (0 to use default).
 * @param out_xsysc Pointer to receive the created system compositor.
 *
 * @ingroup comp_null
 */
xrt_result_t
null_compositor_create_system_with_dims(struct xrt_device *xdev,
                                         uint32_t recommended_width,
                                         uint32_t recommended_height,
                                         struct xrt_system_compositor **out_xsysc);


#ifdef __cplusplus
}
#endif
