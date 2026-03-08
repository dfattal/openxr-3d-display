# Copyright 2020, Collabora, Ltd.
# SPDX-License-Identifier: BSL-1.0

add_library(displayxr-service MODULE service_target.cpp)

target_link_libraries(
	displayxr-service
	PRIVATE
		aux_util
		st_prober
		ipc_server
		target_lists
		target_instance
		xrt-external-jni-wrap
	)
