// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  PLY scene loading utilities for 3DGS
 */

#pragma once

#include <string>
#include <cstdint>
#include <vector>

// GPU vertex layout matching the shader's Vertex struct (240 bytes).
// position(vec4) + scale_opacity(vec4) + rotation(vec4) + sh[48]
struct GsVertex {
    float position[4];       // xyz, w=1
    float scale_opacity[4];  // exp(sx), exp(sy), exp(sz), sigmoid(opacity)
    float rotation[4];       // normalized quaternion (w,x,y,z)
    float sh[48];            // spherical harmonics (interleaved RGB)
};
static_assert(sizeof(GsVertex) == 240, "GsVertex must be 240 bytes");

// Parse a binary PLY file and return GPU-ready vertices.
// Applies: sigmoid(opacity), exp(scale), normalize(rotation), SH de-interleave.
// Returns true on success. On failure, vertices is empty.
bool ParsePlyFile(const std::string& path,
                  std::vector<GsVertex>& vertices);

// Validate that a file path points to a valid .ply Gaussian splatting scene.
// Returns true if the file exists and has a .ply extension.
bool ValidatePlyFile(const std::string& path);

// Extract the filename (without directory) from a full path.
std::string GetPlyFilename(const std::string& path);

// Get a human-readable size string (e.g., "12.3 MB") for the file.
std::string GetPlyFileSize(const std::string& path);
