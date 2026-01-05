// Copyright 2025, Beyley Cardellio
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Radio state machine functions for the Oculus Rift.
 * @author Beyley Cardellio <ep1cm1n10n123@gmail.com>
 * @ingroup drv_rift
 */

#include "util/u_device.h"
#include "util/u_var.h"

#include "rift_radio.h"


/*
 * Rift Touch Controller device functions
 */

static xrt_result_t
rift_touch_controller_get_tracked_pose(struct xrt_device *xdev,
                                       const enum xrt_input_name name,
                                       int64_t at_timestamp_ns,
                                       struct xrt_space_relation *out_relation)
{
	switch (name) {
	case XRT_INPUT_TOUCH_GRIP_POSE:
	case XRT_INPUT_TOUCH_AIM_POSE:
		// @todo
		(*out_relation) = (struct xrt_space_relation)XRT_SPACE_RELATION_ZERO;
		break;
	default: return XRT_ERROR_INPUT_UNSUPPORTED;
	}

	return XRT_SUCCESS;
}

static void
rift_touch_controller_destroy(struct xrt_device *xdev)
{
	struct rift_touch_controller *controller = (struct rift_touch_controller *)xdev;

	u_var_remove_root(controller);

	u_device_free(&controller->base);
}

/*
 * Implementation functions
 */

static struct rift_touch_controller *
rift_touch_controller_create(struct rift_hmd *hmd, enum rift_radio_device_type device_type)
{
	struct rift_touch_controller *controller = U_DEVICE_ALLOCATE(
	    struct rift_touch_controller, U_DEVICE_ALLOC_NO_FLAGS, RIFT_TOUCH_CONTROLLER_INPUT_COUNT, 1);
	if (controller == NULL) {
		HMD_ERROR(hmd, "Failed to allocate touch controller");
		return NULL;
	}

	controller->base.tracking_origin = hmd->base.tracking_origin;

	strcpy(controller->base.str, "Oculus Touch (Unknown)");
	switch (device_type) {
	case RIFT_RADIO_DEVICE_LEFT_TOUCH:
		strcpy(controller->base.str, "Oculus Touch (Left)");
		controller->base.device_type = XRT_DEVICE_TYPE_LEFT_HAND_CONTROLLER;
		break;
	case RIFT_RADIO_DEVICE_RIGHT_TOUCH:
		strcpy(controller->base.str, "Oculus Touch (Right)");
		controller->base.device_type = XRT_DEVICE_TYPE_RIGHT_HAND_CONTROLLER;
		break;
	case RIFT_RADIO_DEVICE_TRACKED_OBJECT:
		strcpy(controller->base.str, "Oculus Touch (Tracked Object)");
		controller->base.device_type = XRT_DEVICE_TYPE_ANY_HAND_CONTROLLER;
		break;
	default: break; return controller;
	}
	controller->base.name = XRT_DEVICE_TOUCH_CONTROLLER_RIFT_CV1;

#define SET_INPUT(NAME, ACTIVE)                                                                                        \
	do {                                                                                                           \
		controller->base.inputs[RIFT_TOUCH_CONTROLLER_INPUT_##NAME].name = XRT_INPUT_TOUCH_##NAME;             \
		controller->base.inputs[RIFT_TOUCH_CONTROLLER_INPUT_##NAME].active = ACTIVE;                           \
	} while (0)
	SET_INPUT(X_CLICK, device_type == RIFT_RADIO_DEVICE_LEFT_TOUCH);
	SET_INPUT(X_TOUCH, device_type == RIFT_RADIO_DEVICE_LEFT_TOUCH);
	SET_INPUT(Y_CLICK, device_type == RIFT_RADIO_DEVICE_LEFT_TOUCH);
	SET_INPUT(Y_TOUCH, device_type == RIFT_RADIO_DEVICE_LEFT_TOUCH);
	SET_INPUT(A_CLICK, device_type == RIFT_RADIO_DEVICE_RIGHT_TOUCH);
	SET_INPUT(A_TOUCH, device_type == RIFT_RADIO_DEVICE_RIGHT_TOUCH);
	SET_INPUT(B_CLICK, device_type == RIFT_RADIO_DEVICE_RIGHT_TOUCH);
	SET_INPUT(B_TOUCH, device_type == RIFT_RADIO_DEVICE_RIGHT_TOUCH);
	SET_INPUT(MENU_CLICK, true);
	SET_INPUT(SYSTEM_CLICK, true);
	SET_INPUT(SQUEEZE_VALUE, true);
	SET_INPUT(TRIGGER_TOUCH, true);
	SET_INPUT(TRIGGER_VALUE, true);
	SET_INPUT(THUMBSTICK_CLICK, true);
	SET_INPUT(THUMBSTICK_TOUCH, true);
	SET_INPUT(THUMBSTICK, true);
	SET_INPUT(THUMBREST_TOUCH, true);
	SET_INPUT(GRIP_POSE, true);
	SET_INPUT(AIM_POSE, true);
	SET_INPUT(TRIGGER_PROXIMITY, true);
	SET_INPUT(THUMB_PROXIMITY, true);
#undef SET_INPUT

	controller->base.outputs[0].name = XRT_OUTPUT_NAME_TOUCH_HAPTIC;

	u_device_populate_function_pointers(&controller->base, rift_touch_controller_get_tracked_pose,
	                                    rift_touch_controller_destroy);

	u_var_add_root(controller, "Rift Touch Controller", true);

	return controller;
}

int
rift_radio_handle_read(struct rift_hmd *hmd)
{
	// int result;
	uint8_t buf[REPORT_MAX_SIZE];
	int length;

	// 3x expected wait time (500hz, so 2ms)
	length = os_hid_read(hmd->radio_dev, buf, sizeof(buf), 6);

	// int64_t receive_ns = os_monotonic_get_ns();

	if (length < 0) {
		HMD_ERROR(hmd, "Got error reading from radio device, assuming fatal, reason %d", length);
		return length;
	}

	// non fatal, but nothing to do
	if (length == 0) {
		HMD_TRACE(hmd, "Timed out waiting for packet from radio, packets should come in at 500hz");
		return 0;
	}

	// do nothing with the keepalive
	if (buf[0] == IN_REPORT_CV1_RADIO_KEEPALIVE) {
		HMD_TRACE(hmd, "Got radio keepalive(?)");
		return 0;
	}

	if (buf[0] != IN_REPORT_RADIO_DATA) {
		HMD_WARN(hmd, "Got radio IN report with bad ID (got %d, expected %d, size %d), ignoring...", buf[0],
		         IN_REPORT_RADIO_DATA, length);
		return 0;
	}

	if (length != IN_REPORT_RADIO_DATA_SIZE) {
		HMD_WARN(hmd, "Got radio IN report with bad size (got %d, expected %d), ignoring...", length,
		         IN_REPORT_RADIO_DATA_SIZE);
		return 0;
	}

	struct rift_radio_report radio_report;
	memcpy(&radio_report, buf + 1, sizeof(radio_report));

	for (uint32_t i = 0; i < ARRAY_SIZE(radio_report.messages); i++) {
		const struct rift_radio_report_message message = radio_report.messages[i];

		if (message.flags != 0x1c && message.flags != 0x05) {
			// HMD_TRACE(hmd, "Got message with unknown radio flags %04x. skipping", message.flags);

			continue;
		}

		switch (message.device_type) {
		case RIFT_RADIO_DEVICE_LEFT_TOUCH:
		case RIFT_RADIO_DEVICE_RIGHT_TOUCH:
		case RIFT_RADIO_DEVICE_TRACKED_OBJECT: {
			size_t touch_index = rift_radio_device_type_to_touch_index(message.device_type);

			struct rift_touch_controller *controller = hmd->radio_state.touch_controllers[touch_index];

			if (controller == NULL) {
				controller = hmd->radio_state.touch_controllers[touch_index] =
				    rift_touch_controller_create(hmd, message.device_type);

				if (controller == NULL) {
					HMD_ERROR(hmd, "Failed to create touch controller for device type %d",
					          message.device_type);
					continue;
				}

				HMD_INFO(hmd, "Created touch controller for device type %d", message.device_type);

				os_mutex_lock(&hmd->device_mutex);
				hmd->devices[hmd->device_count++] = &controller->base;
				os_mutex_unlock(&hmd->device_mutex);
			}
		}
		}
	}

	return 0;
}

int
rift_radio_handle_command(struct rift_hmd *hmd)
{
	return 0;
}
