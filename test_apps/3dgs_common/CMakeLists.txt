# Copyright 2025, Leia Inc.
# SPDX-License-Identifier: BSL-1.0
#
# Shared 3DGS-OpenXR integration library
#
# Embeds 8 compute shaders for Gaussian splatting, a PLY binary parser,
# and Vulkan utility helpers.  Test apps link this library and call
# GsRenderer::renderEye() with OpenXR swapchain images.

cmake_minimum_required(VERSION 3.21)
project(gs_renderer_lib LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(MSVC)
    set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
endif()

find_package(Vulkan REQUIRED)

# ── SPIR-V shader compilation ────────────────────────────────────────────
# Inline version of cmake/SPIR-V.cmake with --include-dir for common.glsl.

find_program(GLSLANGVALIDATOR_COMMAND glslangValidator)
if(NOT GLSLANGVALIDATOR_COMMAND)
    message(FATAL_ERROR "glslangValidator required - install via Vulkan SDK")
endif()

set(SHADER_INCLUDE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/shaders")
set(SHADER_SOURCES
    shaders/precomp_cov3d.comp
    shaders/preprocess.comp
    shaders/prefix_sum.comp
    shaders/preprocess_sort.comp
    shaders/hist.comp
    shaders/sort.comp
    shaders/tile_boundary.comp
    shaders/render.comp
)

set(SHADER_HEADERS "")
foreach(GLSL_REL ${SHADER_SOURCES})
    # Extract filename without directory: e.g., "precomp_cov3d.comp"
    get_filename_component(GLSL_NAME ${GLSL_REL} NAME)
    # C identifier from filename: e.g., "precomp_cov3d_comp"
    string(MAKE_C_IDENTIFIER ${GLSL_NAME} IDENTIFIER)
    # Variable name with _data suffix: e.g., "precomp_cov3d_comp_data"
    set(VARNAME "${IDENTIFIER}_data")
    # Output header: e.g., "${BINARY_DIR}/precomp_cov3d.comp.h"
    set(HEADER "${CMAKE_CURRENT_BINARY_DIR}/${GLSL_NAME}.h")
    # Full source path
    set(GLSL_SRC "${CMAKE_CURRENT_SOURCE_DIR}/${GLSL_REL}")

    add_custom_command(
        OUTPUT ${HEADER}
        COMMAND ${GLSLANGVALIDATOR_COMMAND}
            -V --target-env vulkan1.2
            -I${SHADER_INCLUDE_DIR}
            ${GLSL_SRC}
            --vn ${VARNAME}
            -o ${HEADER}
        DEPENDS ${GLSL_SRC} ${SHADER_INCLUDE_DIR}/common.glsl
        COMMENT "Compiling SPIR-V: ${GLSL_NAME}"
    )
    list(APPEND SHADER_HEADERS ${HEADER})
endforeach()

# ── gs_renderer adapter library ──────────────────────────────────────────
add_library(gs_renderer STATIC
    gs_renderer.h
    gs_renderer.cpp
    gs_scene_loader.h
    gs_scene_loader.cpp
    gs_vulkan_utils.h
    gs_vulkan_utils.cpp
    ${SHADER_HEADERS}
)

target_include_directories(gs_renderer PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_BINARY_DIR}   # For generated SPIR-V headers
)

target_link_libraries(gs_renderer PUBLIC
    Vulkan::Vulkan
)
