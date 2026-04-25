// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  SPZ scene loading — Niantic compressed format → GsVertex conversion
 *
 * Uses the Niantic spz library to decompress .spz files into GaussianCloud,
 * then converts to our GPU vertex format (GsVertex, 240 bytes per splat).
 */

#include "gs_spz_loader.h"

#include <load-spz.h>
#include <splat-types.h>

#include <cmath>
#include <cstdio>
#include <cstring>
#include <algorithm>

static float spz_sigmoid(float x) {
    return 1.0f / (1.0f + std::exp(-x));
}

bool ParseSpzFile(const std::string& path, std::vector<GsVertex>& vertices)
{
    vertices.clear();

    // EXPERIMENT: was RDF (Y-down, Z-forward = COLMAP/gsplat-trainer PLY convention).
    // Trying RUB (Y-up, Z-back = OpenGL / OpenXR / SPZ-native) to see if the
    // scene matches SuperSplat's orientation without needing a 180° yaw fix.
    spz::UnpackOptions options;
    options.to = spz::CoordinateSystem::RUB;
    spz::GaussianCloud cloud = spz::loadSpz(path, options);

    if (cloud.numPoints <= 0) {
        fprintf(stderr, "ParseSpzFile: failed to load %s (0 points)\n", path.c_str());
        return false;
    }

    uint32_t numPoints = (uint32_t)cloud.numPoints;
    printf("ParseSpzFile: loading %u gaussians from %s (shDegree=%d)\n",
           numPoints, path.c_str(), cloud.shDegree);

    // SH floats per point (beyond DC, which is stored in cloud.colors)
    int shPerPoint = 0;
    switch (cloud.shDegree) {
        case 1: shPerPoint = 9; break;   // 3 coeffs * 3 channels
        case 2: shPerPoint = 24; break;  // 8 coeffs * 3 channels
        case 3: shPerPoint = 45; break;  // 15 coeffs * 3 channels
        default: shPerPoint = 0; break;
    }

    vertices.resize(numPoints);

    for (uint32_t i = 0; i < numPoints; i++) {
        GsVertex& v = vertices[i];

        // Position (w=1)
        v.position[0] = cloud.positions[i * 3 + 0];
        v.position[1] = cloud.positions[i * 3 + 1];
        v.position[2] = cloud.positions[i * 3 + 2];
        v.position[3] = 1.0f;

        // Scale: exp(log_scale), Opacity: sigmoid(logit_alpha)
        v.scale_opacity[0] = std::exp(cloud.scales[i * 3 + 0]);
        v.scale_opacity[1] = std::exp(cloud.scales[i * 3 + 1]);
        v.scale_opacity[2] = std::exp(cloud.scales[i * 3 + 2]);
        v.scale_opacity[3] = spz_sigmoid(cloud.alphas[i]);

        // Quaternion: SPZ stores (x,y,z,w), we need (w,x,y,z)
        float qx = cloud.rotations[i * 4 + 0];
        float qy = cloud.rotations[i * 4 + 1];
        float qz = cloud.rotations[i * 4 + 2];
        float qw = cloud.rotations[i * 4 + 3];
        float qlen = std::sqrt(qw*qw + qx*qx + qy*qy + qz*qz);
        if (qlen > 1e-8f) {
            float inv = 1.0f / qlen;
            qw *= inv; qx *= inv; qy *= inv; qz *= inv;
        }
        v.rotation[0] = qw;
        v.rotation[1] = qx;
        v.rotation[2] = qy;
        v.rotation[3] = qz;

        // DC color (SH band 0) → sh[0..2]
        v.sh[0] = cloud.colors[i * 3 + 0];
        v.sh[1] = cloud.colors[i * 3 + 1];
        v.sh[2] = cloud.colors[i * 3 + 2];

        // Higher-order SH coefficients
        // SPZ uses color-inner layout: [coeff0_R, coeff0_G, coeff0_B, coeff1_R, ...]
        // Our GPU layout sh[3..47] is identical: [R_1, G_1, B_1, R_2, G_2, B_2, ...]
        if (shPerPoint > 0) {
            int floatsToCopy = std::min(shPerPoint, 45);
            std::memcpy(&v.sh[3], &cloud.sh[i * shPerPoint],
                        floatsToCopy * sizeof(float));
            // Zero-fill remaining coefficients if shDegree < 3
            for (int j = 3 + floatsToCopy; j < 48; j++) {
                v.sh[j] = 0.0f;
            }
        } else {
            // No SH beyond DC — zero-fill all higher coefficients
            std::memset(&v.sh[3], 0, 45 * sizeof(float));
        }
    }

    printf("ParseSpzFile: loaded %u gaussians (%.1f MB GPU data)\n",
           numPoints, (double)(numPoints * sizeof(GsVertex)) / (1024.0 * 1024.0));
    return true;
}
