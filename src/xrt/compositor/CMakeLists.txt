# Copyright 2019-2024, Collabora, Ltd.
# Copyright 2025, NVIDIA CORPORATION.
# SPDX-License-Identifier: BSL-1.0

###
# Compositor includes target
#

add_library(comp_includes INTERFACE)
target_include_directories(comp_includes INTERFACE ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries(comp_includes INTERFACE xrt-interfaces)

###
# Sub directories (order matters for some of them)
#

# Shaders library
if(XRT_MODULE_COMPOSITOR_SHADERS)
	add_subdirectory(shaders)
endif()

# Client library
if(XRT_MODULE_COMPOSITOR_CLIENT)
	add_subdirectory(client)
endif()

# Render library
if(XRT_MODULE_COMPOSITOR_RENDER)
	add_subdirectory(render)
endif()

# Util library
if(XRT_MODULE_COMPOSITOR_UTIL)
	add_subdirectory(util)
endif()

# Main compositor
if(XRT_MODULE_COMPOSITOR_MAIN)
	add_subdirectory(main)
endif()

# Null compositor
if(XRT_MODULE_COMPOSITOR_NULL)
	add_subdirectory(null)
endif()

# Multi client compositor library
if(XRT_MODULE_COMPOSITOR_MULTI)
	add_subdirectory(multi)
endif()

# Mock native compositor
if(XRT_MODULE_COMPOSITOR_MOCK)
	add_subdirectory(mock)
endif()

###
# Shared Win32 window utility (pure Win32, no D3D11 dependency)
#
if(WIN32)
	add_library(
		comp_win32_window STATIC
		d3d11/comp_d3d11_window.cpp
		d3d11/comp_d3d11_window.h
		)
	target_link_libraries(
		comp_win32_window
		PUBLIC xrt-interfaces
		PRIVATE aux_util aux_os
		)
	target_include_directories(comp_win32_window PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/d3d11)
	if(XRT_BUILD_DRIVER_QWERTY)
		target_link_libraries(comp_win32_window PRIVATE drv_qwerty drv_qwerty_includes)
		target_compile_definitions(comp_win32_window PRIVATE XRT_BUILD_DRIVER_QWERTY)
	endif()
endif()

###
# Native D3D11 compositor (bypasses Vulkan entirely)
#
if(WIN32 AND XRT_HAVE_D3D11)
	add_subdirectory(d3d11)
endif()

###
# D3D11 Service compositor (for hybrid mode)
#
if(WIN32 AND XRT_FEATURE_HYBRID_MODE)
	add_subdirectory(d3d11_service)
endif()
