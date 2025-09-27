// Copyright 2025, Beyley Cardellio
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Implementation of Blubur S1 HMD driver.
 * @author Beyley Cardellio <ep1cm1n10n123@gmail.com>
 * @ingroup drv_blubur_s1
 */

#include "math/m_api.h"
#include "math/m_mathinclude.h"

#include "util/u_device.h"
#include "util/u_distortion_mesh.h"
#include "util/u_misc.h"
#include "util/u_time.h"

#include "blubur_s1_interface.h"
#include "blubur_s1_internal.h"


static struct blubur_s1_hmd *
blubur_s1_hmd(struct xrt_device *xdev)
{
	return (struct blubur_s1_hmd *)xdev;
}

static void
blubur_s1_hmd_destroy(struct xrt_device *xdev)
{
	struct blubur_s1_hmd *hmd = blubur_s1_hmd(xdev);
	free(hmd);
}

static xrt_result_t
blubur_s1_hmd_compute_distortion(
    struct xrt_device *xdev, uint32_t view, float u, float v, struct xrt_uv_triplet *out_result)
{
	float x = u * 2.0f - 1.0f;
	float y = v * 2.0f - 1.0f;

	float r2 = x * x + y * y;
	float r = sqrtf(r2);
	float r3 = r2 * r;
	float r4 = r2 * r2;
	float r5 = r4 * r;

	float radial = (0.5978f * r5) - (0.7257f * r4) + (0.504f * r3) - (0.0833f * r2) + (0.709f * r) - 0.00006f;

	struct xrt_vec2 result = {
	    .x = (x * radial) / 2.0f + 0.5f,
	    .y = (y * radial) / 2.0f + 0.5f,
	};
	out_result->r = result;
	out_result->g = result;
	out_result->b = result;

	return XRT_SUCCESS;
}

static xrt_result_t
blubur_s1_hmd_update_inputs(struct xrt_device *xdev)
{
	return XRT_SUCCESS;
}

static xrt_result_t
blubur_s1_hmd_get_tracked_pose(struct xrt_device *xdev,
                               enum xrt_input_name name,
                               int64_t at_timestamp_ns,
                               struct xrt_space_relation *out_relation)
{
	if (name != XRT_INPUT_GENERIC_HEAD_POSE) {
		return XRT_ERROR_INPUT_UNSUPPORTED;
	}

	// TODO: track pose
	*out_relation = (struct xrt_space_relation){
	    .relation_flags = 0,
	};

	return XRT_SUCCESS;
}

static xrt_result_t
blubur_s1_hmd_get_presence(struct xrt_device *xdev, bool *presence)
{
	// TODO: read the presence sensor from the device
	*presence = true;

	return XRT_SUCCESS;
}

static xrt_result_t
blubur_s1_get_view_poses(struct xrt_device *xdev,
                         const struct xrt_vec3 *default_eye_relation,
                         int64_t at_timestamp_ns,
                         uint32_t view_count,
                         struct xrt_space_relation *out_head_relation,
                         struct xrt_fov *out_fovs,
                         struct xrt_pose *out_poses)
{
	return u_device_get_view_poses(xdev, default_eye_relation, at_timestamp_ns, view_count, out_head_relation,
	                               out_fovs, out_poses);
}

struct blubur_s1_hmd *
blubur_s1_hmd_create(struct os_hid_device *dev, const char *serial)
{
	struct blubur_s1_hmd *hmd =
	    U_DEVICE_ALLOCATE(struct blubur_s1_hmd, U_DEVICE_ALLOC_HMD | U_DEVICE_ALLOC_TRACKING_NONE, 1, 0);
	if (hmd == NULL) {
		return NULL;
	}

	hmd->base.destroy = blubur_s1_hmd_destroy;
	hmd->base.name = XRT_DEVICE_GENERIC_HMD;
	hmd->base.device_type = XRT_DEVICE_TYPE_HMD;

	const int view_size = 1440;

	hmd->base.hmd->screens[0].w_pixels = view_size * 2;
	hmd->base.hmd->screens[0].h_pixels = view_size;
	hmd->base.hmd->screens[0].nominal_frame_interval_ns = 1000000000LLU / 120; // 120hz

	hmd->base.hmd->view_count = 2;
	hmd->base.hmd->views[0] = (struct xrt_view){
	    .viewport =
	        {
	            .x_pixels = 0,
	            .y_pixels = 0,
	            .w_pixels = view_size,
	            .h_pixels = view_size,
	        },
	    .display =
	        {
	            .w_pixels = view_size,
	            .h_pixels = view_size,
	        },
	    .rot = u_device_rotation_ident,
	};
	hmd->base.hmd->views[1] = (struct xrt_view){
	    .viewport =
	        {
	            .x_pixels = view_size,
	            .y_pixels = 0,
	            .w_pixels = view_size,
	            .h_pixels = view_size,
	        },
	    .display =
	        {
	            .w_pixels = view_size,
	            .h_pixels = view_size,
	        },
	    .rot = u_device_rotation_ident,
	};

	hmd->base.hmd->blend_modes[0] = XRT_BLEND_MODE_OPAQUE;
	hmd->base.hmd->blend_mode_count = 1;

	// TODO: what's the real FOV?
	hmd->base.hmd->distortion.fov[0] = (struct xrt_fov){
	    .angle_left = 45.0f * (M_PI / 180.0f),
	    .angle_right = 45.0f * (M_PI / 180.0f),
	    .angle_up = 45.0f * (M_PI / 180.0f),
	    .angle_down = 45.0f * (M_PI / 180.0f),
	};
	hmd->base.hmd->distortion.fov[1] = hmd->base.hmd->distortion.fov[0];

	hmd->base.hmd->distortion.models = XRT_DISTORTION_MODEL_COMPUTE;
	hmd->base.hmd->distortion.preferred = XRT_DISTORTION_MODEL_COMPUTE;
	hmd->base.compute_distortion = blubur_s1_hmd_compute_distortion;
	u_distortion_mesh_fill_in_compute(&hmd->base);

	snprintf(hmd->base.str, XRT_DEVICE_NAME_LEN, "Blubur S1");
	snprintf(hmd->base.serial, XRT_DEVICE_NAME_LEN, "%s", serial);

	hmd->base.supported.position_tracking = true;
	hmd->base.supported.presence = true;

	hmd->base.inputs[0].name = XRT_INPUT_GENERIC_HEAD_POSE;

	hmd->base.update_inputs = blubur_s1_hmd_update_inputs;
	hmd->base.get_tracked_pose = blubur_s1_hmd_get_tracked_pose;
	hmd->base.get_presence = blubur_s1_hmd_get_presence;
	hmd->base.get_view_poses = blubur_s1_get_view_poses;

	return hmd;
}
