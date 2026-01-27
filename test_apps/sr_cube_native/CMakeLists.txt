# Copyright 2025, Leia Inc.
# SPDX-License-Identifier: BSL-1.0

cmake_minimum_required(VERSION 3.21)
project(sr_cube_native LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Use static CRT to avoid requiring VC++ redistributable
if(MSVC)
    set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
endif()

# Find CNSDK (SR SDK)
find_package(CNSDK CONFIG QUIET)
if(CNSDK_FOUND)
    message(STATUS "Found CNSDK - SR native app will have full functionality")
    set(HAVE_CNSDK TRUE)
else()
    message(WARNING "CNSDK not found - SR native app will show error message at runtime")
    set(HAVE_CNSDK FALSE)
endif()

# Common library
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../common ${CMAKE_CURRENT_BINARY_DIR}/common)

# Create executable
add_executable(sr_cube_native WIN32
    main.cpp
    sr_cube_native.manifest
    resource.rc
)

target_link_libraries(sr_cube_native PRIVATE
    sr_common
)

# Add CNSDK if available
if(HAVE_CNSDK)
    target_compile_definitions(sr_cube_native PRIVATE XRT_HAVE_CNSDK)
    target_link_libraries(sr_cube_native PRIVATE CNSDK::CNSDK)
endif()

# Embed manifest
if(MSVC)
    set_target_properties(sr_cube_native PROPERTIES
        LINK_FLAGS "/MANIFEST:EMBED /MANIFESTINPUT:${CMAKE_CURRENT_SOURCE_DIR}/sr_cube_native.manifest"
    )
endif()
