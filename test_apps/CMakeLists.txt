# Copyright 2025, Leia Inc.
# SPDX-License-Identifier: BSL-1.0
#
# Parent CMakeLists.txt for test applications
# Build from this directory to build all test apps at once
#
# Apps:
#   sr_cube_native     - Native SR SDK (no OpenXR) - requires LeiaSR SDK
#   sr_cube_openxr     - OpenXR standard mode (Monado creates window)
#   sr_cube_openxr_ext - OpenXR with XR_EXT_session_target (app creates window)

cmake_minimum_required(VERSION 3.21)
project(test_apps LANGUAGES CXX)

# Only build on Windows
if(NOT WIN32)
    message(STATUS "Test apps are Windows-only, skipping")
    return()
endif()

# Build sr_cube_native (requires LeiaSR SDK for full functionality)
add_subdirectory(sr_cube_native)

# Build OpenXR test apps (require OpenXR loader)
if(OpenXR_FOUND OR DEFINED OpenXR_ROOT)
    add_subdirectory(sr_cube_openxr)
    add_subdirectory(sr_cube_openxr_ext)
else()
    message(STATUS "OpenXR not found, skipping sr_cube_openxr and sr_cube_openxr_ext")
    message(STATUS "To build them, set OpenXR_ROOT or install OpenXR SDK")
endif()
