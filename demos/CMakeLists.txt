# Copyright 2025-2026, DisplayXR
# SPDX-License-Identifier: BSL-1.0
#
# Parent CMakeLists.txt for in-tree demo applications.
#
# Demos that ship with the runtime repo (reference implementations,
# don't auto-publish):
#   spatial_os_handle_d3d11_win — multi-layer war room, D3D11, Windows.
#                                 Superseded by the Shell feature; kept
#                                 here as a reference implementation.
#
# Standalone demos live in their own DisplayXR/displayxr-demo-<name>
# repos:
#   - DisplayXR/displayxr-demo-gaussiansplat (3D Gaussian Splatting)
# These have independent release cadences; consume the runtime as a
# downloaded artifact.

cmake_minimum_required(VERSION 3.21)
project(demos LANGUAGES CXX)

if(WIN32)
    if(OpenXR_FOUND OR DEFINED OpenXR_ROOT)
        add_subdirectory(spatial_os_handle_d3d11_win)
    else()
        message(STATUS "OpenXR not found, skipping demo apps")
    endif()
endif()
