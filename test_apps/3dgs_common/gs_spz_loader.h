// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  SPZ scene loading utilities for 3DGS (Niantic compressed format)
 */

#pragma once

#include <string>
#include <vector>
#include "gs_scene_loader.h"  // for GsVertex

// Parse a Niantic SPZ file and return GPU-ready vertices.
// Converts from SPZ's RUB coordinate system to PLY's RDF convention.
// Applies: sigmoid(opacity), exp(scale), normalize(rotation), SH mapping.
// Returns true on success. On failure, vertices is empty.
bool ParseSpzFile(const std::string& path,
                  std::vector<GsVertex>& vertices);
