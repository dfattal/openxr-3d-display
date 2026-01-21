# Copyright 2025, Leia Inc.
# SPDX-License-Identifier: BSL-1.0

cmake_minimum_required(VERSION 3.16)
project(session_target_test LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find OpenXR - either system installed or from parent build
find_package(OpenXR QUIET CONFIG)
if(NOT OpenXR_FOUND)
    # Try to find the loader from the parent monado build
    if(EXISTS "${CMAKE_SOURCE_DIR}/../../build/src/external/openxr_loader/OpenXRConfig.cmake")
        list(APPEND CMAKE_PREFIX_PATH "${CMAKE_SOURCE_DIR}/../../build/src/external/openxr_loader")
        find_package(OpenXR REQUIRED CONFIG)
    else()
        message(FATAL_ERROR "OpenXR not found. Either install OpenXR SDK or build the parent project first.")
    endif()
endif()

add_executable(session_target_test WIN32
    main.cpp
    xr_session.cpp
    xr_session.h
    d3d11_renderer.cpp
    d3d11_renderer.h
    input_state.cpp
    input_state.h
    text_overlay.cpp
    text_overlay.h
)

target_include_directories(session_target_test PRIVATE
    ${CMAKE_SOURCE_DIR}/../../src/external/openxr_includes
)

target_link_libraries(session_target_test PRIVATE
    OpenXR::openxr_loader
    d3d11
    dxgi
    d3dcompiler
    d2d1
    dwrite
)

# For development: create a batch file to run with local runtime
file(WRITE ${CMAKE_BINARY_DIR}/run_local.bat
    "@echo off\r\n"
    "set XR_RUNTIME_JSON=${CMAKE_SOURCE_DIR}/../../build/openxr_monado-dev.json\r\n"
    "session_target_test.exe\r\n"
    "pause\r\n"
)

# Copy runtime DLLs to output directory for standalone use
if(TARGET OpenXR::openxr_loader)
    add_custom_command(TARGET session_target_test POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_if_different
            $<TARGET_FILE:OpenXR::openxr_loader>
            $<TARGET_FILE_DIR:session_target_test>
        COMMENT "Copying OpenXR loader DLL"
    )
endif()
