# Copyright 2019-2024, Collabora, Ltd.
# Copyright 2025-2026, NVIDIA CORPORATION.
# SPDX-License-Identifier: BSL-1.0

###
# Main code
#

add_subdirectory(bindings)
add_subdirectory(extension_support)

add_library(
	st_oxr STATIC
	actions/oxr_api_action.c
	actions/oxr_api_action.h
	actions/oxr_binding.c
	actions/oxr_binding.h
	actions/oxr_dpad_state.c
	actions/oxr_dpad_state.h
	actions/oxr_get_state.c
	actions/oxr_get_state.h
	actions/oxr_haptic.c
	actions/oxr_haptic.h
	actions/oxr_input.c
	actions/oxr_input.h
	actions/oxr_input_transform.c
	actions/oxr_input_transform.h
	actions/oxr_instance_action_context.c
	actions/oxr_instance_action_context.h
	actions/oxr_pair_hashset.c
	actions/oxr_pair_hashset.h
	actions/oxr_instance_path_cache.c
	actions/oxr_instance_path_cache.h
	actions/oxr_interaction_profile_array.c
	actions/oxr_interaction_profile_array.h
	actions/oxr_set_haptic.c
	actions/oxr_set_haptic.h
	common/oxr_defines.h
	common/oxr_forward_declarations.h
	common/oxr_refcounted.h
	path/oxr_path_store.c
	path/oxr_path_store.h
	path/oxr_path_wrappers.h
	oxr_api_funcs.h
	oxr_api_instance.c
	oxr_api_negotiate.c
	oxr_api_session.c
	oxr_api_space.c
	oxr_api_swapchain.c
	oxr_api_system.c
	oxr_api_verify.h
	oxr_api_xdev.c
	oxr_chain.h
	oxr_event.c
	oxr_frame_sync.c
	oxr_frame_sync.h
	oxr_handle_base.c
	oxr_instance.c
	oxr_logger.c
	oxr_logger.h
	oxr_objects.h
	oxr_pretty_print.c
	oxr_pretty_print.h
	oxr_roles.c
	oxr_roles.h
	oxr_session.c
	oxr_session_frame_end.c
	oxr_space.c
	oxr_swapchain.c
	oxr_system.c
	oxr_two_call.h
	oxr_verify.c
	oxr_xdev.c
	${CMAKE_CURRENT_BINARY_DIR}/bindings/oxr_generated_bindings.c
	${CMAKE_CURRENT_BINARY_DIR}/bindings/oxr_generated_bindings.h
	${CMAKE_CURRENT_BINARY_DIR}/extension_support/oxr_extension_support.h
	)

# For OpenXR unit tests to find common files like oxr_defines.h file.
target_include_directories(st_oxr PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/common)

# To generate the oxr_generated_bindings.c and oxr_generated_bindings.h files.
add_dependencies(st_oxr generate_oxr_bindings)
# To enable finding oxr_objects.h in the oxr_generated_bindings.c file.
target_include_directories(st_oxr PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}")
# For OpenXR unit tests to find the oxr_generated_bindings.h file.
target_include_directories(st_oxr PUBLIC ${CMAKE_CURRENT_BINARY_DIR}/bindings)

# To generate the oxr_extension_support.h file.
add_dependencies(st_oxr generate_oxr_extension_support)
# For OpenXR unit tests to find the oxr_extension_support.h file.
target_include_directories(st_oxr PUBLIC ${CMAKE_CURRENT_BINARY_DIR}/extension_support)

if(XRT_HAVE_VULKAN)
	target_sources(st_oxr PRIVATE oxr_session_gfx_vk.c oxr_swapchain_vk.c oxr_vulkan.c)
	target_link_libraries(st_oxr PUBLIC aux_vk)
endif()

if(XRT_HAVE_OPENGL OR XRT_HAVE_OPENGLES)
	target_sources(st_oxr PRIVATE oxr_swapchain_gl.c)
	target_link_libraries(st_oxr PUBLIC aux_ogl)
endif()

if(XRT_HAVE_OPENGL_GLX AND XRT_HAVE_XLIB)
	target_sources(st_oxr PRIVATE oxr_session_gfx_gl_xlib.c)
endif()

if(XRT_HAVE_EGL)
	target_sources(st_oxr PRIVATE oxr_session_gfx_egl.c)
endif()

if(XRT_HAVE_D3D11 OR XRT_HAVE_D3D12)
	target_sources(st_oxr PRIVATE oxr_d3d.cpp)
	target_link_libraries(st_oxr PRIVATE aux_d3d)
endif()

if(XRT_HAVE_D3D11)
	target_sources(st_oxr PRIVATE oxr_session_gfx_d3d11.c oxr_swapchain_d3d11.c oxr_d3d11.cpp)

	# D3D11 native compositor support (bypasses Vulkan)
	if(WIN32 AND TARGET comp_d3d11)
		target_sources(st_oxr PRIVATE oxr_session_gfx_d3d11_native.c)
		target_link_libraries(st_oxr PRIVATE comp_d3d11)
		target_compile_definitions(st_oxr PRIVATE XRT_HAVE_D3D11_NATIVE_COMPOSITOR)
	endif()
endif()


if(XRT_HAVE_D3D12)
	target_sources(st_oxr PRIVATE oxr_session_gfx_d3d12.c oxr_swapchain_d3d12.c oxr_d3d12.cpp)
	target_link_libraries(st_oxr PRIVATE aux_d3d)
endif()

if(ANDROID)
	target_sources(st_oxr PRIVATE oxr_session_gfx_gles_android.c)
	target_link_libraries(st_oxr PRIVATE aux_android)
endif()

if(WIN32)
	target_link_libraries(st_oxr PRIVATE kernel32)
endif()

if(APPLE)
	target_sources(st_oxr PRIVATE oxr_macos.m)
	target_link_libraries(st_oxr PRIVATE "-framework Cocoa" "-framework QuartzCore")
	# On macOS, link against both the include targets (for header paths) and the
	# actual driver libraries (for symbols). oxr_macos.m calls qwerty_process_macos(),
	# and the macOS linker resolves symbols in a single left-to-right pass so
	# these must be direct dependencies.
	if(XRT_BUILD_DRIVER_QWERTY AND TARGET drv_qwerty)
		target_link_libraries(st_oxr PRIVATE drv_qwerty drv_qwerty_includes)
	endif()
endif()

# Qwerty driver: needed on all platforms for camera-centric stereo controls
# (oxr_session.c calls qwerty_get_stereo_state behind #ifdef XRT_BUILD_DRIVER_QWERTY)
if(XRT_BUILD_DRIVER_QWERTY AND TARGET drv_qwerty)
	target_link_libraries(st_oxr PRIVATE drv_qwerty_includes)
	target_compile_definitions(st_oxr PRIVATE XRT_BUILD_DRIVER_QWERTY)
endif()


# Canonical stereo math (display3d + camera3d) used by oxr_session.c for
# Kooima and camera-centric FOV/pose computation. Single source of truth
# shared with test apps — runtime extracts {eye_world, fov, orientation}.
target_sources(st_oxr PRIVATE
	${CMAKE_SOURCE_DIR}/test_apps/common/display3d_view.c
	${CMAKE_SOURCE_DIR}/test_apps/common/camera3d_view.c
)
target_include_directories(st_oxr PRIVATE ${CMAKE_SOURCE_DIR}/test_apps/common)

if(WIN32 AND XRT_HAVE_OPENGL)
	target_sources(st_oxr PRIVATE oxr_session_gfx_gl_win32.c)
endif()

if(XRT_FEATURE_OPENXR_LAYER_FB_PASSTHROUGH)
	target_sources(st_oxr PRIVATE oxr_api_passthrough.c oxr_passthrough.c)
endif()

if(XRT_FEATURE_OPENXR_BODY_TRACKING_FB)
	target_sources(st_oxr PRIVATE oxr_api_body_tracking.c oxr_body_tracking.c)
endif()

if(XRT_FEATURE_OPENXR_BODY_TRACKING_BD)
	target_sources(st_oxr PRIVATE oxr_api_body_tracking_bd.c oxr_body_tracking_bd.c)
endif()

if(XRT_FEATURE_OPENXR_FACE_TRACKING_ANDROID)
	target_sources(st_oxr PRIVATE oxr_api_face_tracking_android.c oxr_face_tracking_android.c)
endif()

if(XRT_FEATURE_OPENXR_FACIAL_TRACKING_HTC)
	target_sources(st_oxr PRIVATE oxr_api_face_tracking_htc.c oxr_face_tracking_htc.c)
endif()

if(XRT_FEATURE_OPENXR_FACE_TRACKING2_FB)
	target_sources(st_oxr PRIVATE oxr_api_face_tracking2_fb.c oxr_face_tracking2_fb.c)
endif()

if(XRT_FEATURE_OPENXR_FUTURE_EXT)
	target_sources(st_oxr PRIVATE oxr_api_future.c oxr_future.c)
endif()

if(XRT_FEATURE_OPENXR_HAND_TRACKING_EXT)
	target_sources(
		st_oxr PRIVATE oxr_api_hand_tracking.c oxr_hand_tracking.c oxr_hand_tracking.h
		)
endif()

target_link_libraries(
	st_oxr
	PRIVATE
		xrt-interfaces
		xrt-external-openxr
		aux_util
		aux_math
		aux_generated_bindings_helpers
		comp_client
		aux-includes
	PUBLIC aux_os
	)

if(XRT_FEATURE_RENDERDOC)
	target_link_libraries(st_oxr PUBLIC xrt-external-renderdoc)
	if(XRT_HAVE_LINUX)
		target_link_libraries(st_oxr PRIVATE ${CMAKE_DL_LIBS})
	endif()
endif()

target_include_directories(
	st_oxr
	PRIVATE
		${CMAKE_CURRENT_BINARY_DIR}
		# multi/comp_multi_private.h is used for qwerty input device support
		${CMAKE_CURRENT_SOURCE_DIR}/../../compositor
	INTERFACE ${CMAKE_CURRENT_SOURCE_DIR}/..
	)
