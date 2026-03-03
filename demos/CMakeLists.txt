# Copyright 2025, Leia Inc.
# SPDX-License-Identifier: BSL-1.0
#
# Parent CMakeLists.txt for demo applications
#
# Demos:
#   spatial_os                   - Spatial OS demo (multi-layer war room, D3D11, Windows)
#   gaussian_splatting_vk        - 3D Gaussian Splatting viewer (Vulkan, Windows)
#   gaussian_splatting_vk_macos  - 3D Gaussian Splatting viewer (Vulkan/MoltenVK, macOS)

cmake_minimum_required(VERSION 3.21)
project(demos LANGUAGES CXX)

if(WIN32)
    if(OpenXR_FOUND OR DEFINED OpenXR_ROOT)
        add_subdirectory(spatial_os)
        add_subdirectory(gaussian_splatting_vk)
    else()
        message(STATUS "OpenXR not found, skipping demo apps")
    endif()
elseif(APPLE)
    add_subdirectory(gaussian_splatting_vk_macos)
endif()
