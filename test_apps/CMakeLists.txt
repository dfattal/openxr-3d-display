# Copyright 2025, Leia Inc.
# SPDX-License-Identifier: BSL-1.0
#
# Parent CMakeLists.txt for test applications
# Build from this directory to build all test apps at once
#
# Apps:
#   cube_rt_d3d11_win          - Runtime-managed mode (runtime creates window, D3D11)
#   cube_rt_d3d12_win          - Runtime-managed mode (runtime creates window, D3D12)
#   cube_rt_vk_win             - Runtime-managed mode (runtime creates window, Vulkan)
#   cube_rt_gl_win             - Runtime-managed mode (runtime creates window, OpenGL)
#   cube_ext_d3d11_win         - External window mode (app creates window, D3D11)
#   cube_ext_d3d12_win         - External window mode (app creates window, D3D12)
#   cube_ext_vk_win            - External window mode (app creates window, Vulkan)
#   cube_ext_gl_win            - External window mode (app creates window, OpenGL)
#   cube_shared_d3d11_win      - Shared texture mode (D3D11 rendering, D3D11 window blit)
#   cube_shared_d3d12_win      - Shared texture mode (D3D12 rendering, D3D11 window blit)
#   cube_shared_vk_win         - Shared texture mode (Vulkan rendering, D3D11 window blit)
#   cube_shared_gl_win         - Shared texture mode (OpenGL rendering, D3D11 window blit)

cmake_minimum_required(VERSION 3.21)
project(test_apps LANGUAGES CXX)

# Only build on Windows
if(NOT WIN32)
    message(STATUS "Test apps are Windows-only, skipping")
    return()
endif()

# Build OpenXR test apps (require OpenXR loader)
if(OpenXR_FOUND OR DEFINED OpenXR_ROOT)
    add_subdirectory(cube_rt_d3d11_win)
    add_subdirectory(cube_rt_d3d12_win)
    add_subdirectory(cube_rt_vk_win)
    add_subdirectory(cube_rt_gl_win)
    add_subdirectory(cube_ext_d3d11_win)
    add_subdirectory(cube_ext_d3d12_win)
    add_subdirectory(cube_ext_vk_win)
    add_subdirectory(cube_ext_gl_win)
    add_subdirectory(cube_shared_d3d11_win)
    add_subdirectory(cube_shared_d3d12_win)
    add_subdirectory(cube_shared_vk_win)
    add_subdirectory(cube_shared_gl_win)
else()
    message(STATUS "OpenXR not found, skipping OpenXR test apps")
    message(STATUS "To build them, set OpenXR_ROOT or install OpenXR SDK")
endif()
