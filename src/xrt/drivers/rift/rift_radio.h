// Copyright 2025, Beyley Cardellio
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Radio state machine functions for the Oculus Rift.
 * @author Beyley Cardellio <ep1cm1n10n123@gmail.com>
 * @ingroup drv_rift
 */

#include "rift_internal.h"

// Handles reading from the radio HID device and processing any incoming messages
int
rift_radio_handle_read(struct rift_hmd *hmd);

// Checks for completed async commands and processes them
int
rift_radio_handle_command(struct rift_hmd *hmd);
