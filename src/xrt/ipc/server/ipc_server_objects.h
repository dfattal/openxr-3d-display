// Copyright 2025-2026, NVIDIA CORPORATION.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief Tracking objects to IDs.
 * @author Jakob Bornecrantz <tbornecrantz@nvidia.com>
 * @ingroup ipc_server
 */

#pragma once

#include "xrt/xrt_results.h"

struct ipc_client_state;


/*!
 * Get a tracking origin by ID, must only be called from the per client
 * thread as this function accesses the client state's memory.
 *
 * @param ics The client state instance.
 * @param id The tracking origin ID.
 * @param out_xtrack Will be filled with the tracking origin object on success.
 * @return XRT_SUCCESS on success, some other result on failure.
 *
 * @ingroup ipc_server
 */
xrt_result_t
ipc_server_objects_get_xtrack_and_validate(volatile struct ipc_client_state *ics,
                                           uint32_t id,
                                           struct xrt_tracking_origin **out_xtrack);

/*!
 * Get a tracking origin ID for a given tracking origin object, must only be
 * called from the per client thread as this function accesses the client
 * state's memory.
 *
 * @param ics The client state instance.
 * @param xtrack The tracking origin object.
 * @param out_id Will be filled with the tracking origin ID on success.
 * @return XRT_SUCCESS on success, some other result on failure.
 *
 * @ingroup ipc_server
 */
xrt_result_t
ipc_server_objects_get_xtrack_id_or_add(volatile struct ipc_client_state *ics,
                                        struct xrt_tracking_origin *xtrack,
                                        uint32_t *out_id);
