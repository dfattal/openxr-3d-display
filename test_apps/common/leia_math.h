// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Math primitives and Kooima projection for SR display rendering
 */

#pragma once

#include <cmath>
#include <DirectXMath.h>

namespace leia {

// 3D vector
struct vec3f {
    float x, y, z;

    vec3f() : x(0), y(0), z(0) {}
    vec3f(float x_, float y_, float z_) : x(x_), y(y_), z(z_) {}

    vec3f operator+(const vec3f& v) const { return vec3f(x + v.x, y + v.y, z + v.z); }
    vec3f operator-(const vec3f& v) const { return vec3f(x - v.x, y - v.y, z - v.z); }
    vec3f operator*(float s) const { return vec3f(x * s, y * s, z * s); }
    vec3f operator/(float s) const { return vec3f(x / s, y / s, z / s); }

    float dot(const vec3f& v) const { return x * v.x + y * v.y + z * v.z; }
    vec3f cross(const vec3f& v) const {
        return vec3f(
            y * v.z - z * v.y,
            z * v.x - x * v.z,
            x * v.y - y * v.x
        );
    }

    float length() const { return sqrtf(x * x + y * y + z * z); }
    vec3f normalized() const {
        float len = length();
        if (len > 0.0001f) return *this / len;
        return vec3f(0, 0, 1);
    }
};

// 4x4 matrix (row-major, compatible with DirectXMath)
struct mat4f {
    float m[4][4];

    mat4f() {
        for (int i = 0; i < 4; i++)
            for (int j = 0; j < 4; j++)
                m[i][j] = (i == j) ? 1.0f : 0.0f;
    }

    static mat4f identity() { return mat4f(); }

    // Create from DirectXMath matrix
    static mat4f fromXMMATRIX(const DirectX::XMMATRIX& xm) {
        mat4f result;
        DirectX::XMFLOAT4X4 f;
        DirectX::XMStoreFloat4x4(&f, xm);
        for (int i = 0; i < 4; i++)
            for (int j = 0; j < 4; j++)
                result.m[i][j] = f.m[i][j];
        return result;
    }

    // Convert to DirectXMath matrix
    DirectX::XMMATRIX toXMMATRIX() const {
        DirectX::XMFLOAT4X4 f;
        for (int i = 0; i < 4; i++)
            for (int j = 0; j < 4; j++)
                f.m[i][j] = m[i][j];
        return DirectX::XMLoadFloat4x4(&f);
    }

    // Matrix multiplication
    mat4f operator*(const mat4f& other) const {
        mat4f result;
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                result.m[i][j] = 0;
                for (int k = 0; k < 4; k++) {
                    result.m[i][j] += m[i][k] * other.m[k][j];
                }
            }
        }
        return result;
    }

    // Create translation matrix
    static mat4f translation(float x, float y, float z) {
        mat4f result;
        result.m[3][0] = x;
        result.m[3][1] = y;
        result.m[3][2] = z;
        return result;
    }

    // Create rotation matrix around Y axis
    static mat4f rotationY(float radians) {
        mat4f result;
        float c = cosf(radians);
        float s = sinf(radians);
        result.m[0][0] = c;
        result.m[0][2] = -s;
        result.m[2][0] = s;
        result.m[2][2] = c;
        return result;
    }

    // Create rotation matrix around X axis
    static mat4f rotationX(float radians) {
        mat4f result;
        float c = cosf(radians);
        float s = sinf(radians);
        result.m[1][1] = c;
        result.m[1][2] = s;
        result.m[2][1] = -s;
        result.m[2][2] = c;
        return result;
    }

    // Create perspective projection from FOV angles (OpenXR style)
    static mat4f perspectiveFov(float angleLeft, float angleRight,
                                 float angleUp, float angleDown,
                                 float nearZ, float farZ) {
        float left = nearZ * tanf(angleLeft);
        float right = nearZ * tanf(angleRight);
        float top = nearZ * tanf(angleUp);
        float bottom = nearZ * tanf(angleDown);

        float width = right - left;
        float height = top - bottom;

        mat4f result;
        result.m[0][0] = 2.0f * nearZ / width;
        result.m[1][1] = 2.0f * nearZ / height;
        result.m[2][0] = (right + left) / width;
        result.m[2][1] = (top + bottom) / height;
        result.m[2][2] = -(farZ + nearZ) / (farZ - nearZ);
        result.m[2][3] = -1.0f;
        result.m[3][2] = -2.0f * farZ * nearZ / (farZ - nearZ);
        result.m[3][3] = 0.0f;
        return result;
    }
};

/*!
 * @brief Compute Kooima generalized perspective projection matrix
 *
 * This is the "off-axis" projection needed for head-tracked displays.
 * Given the viewer's eye position and the screen corners, computes the
 * asymmetric frustum that correctly renders the scene.
 *
 * Reference: Robert Kooima, "Generalized Perspective Projection"
 * http://csc.lsu.edu/~kooima/pdfs/gen-perspective.pdf
 *
 * @param eye Eye position in world coordinates (meters)
 * @param screenLL Screen lower-left corner in world coordinates
 * @param screenLR Screen lower-right corner in world coordinates
 * @param screenUL Screen upper-left corner in world coordinates
 * @param nearZ Near clipping plane distance
 * @param farZ Far clipping plane distance
 * @return Projection matrix for this eye position
 */
inline mat4f kooimaProjection(
    const vec3f& eye,
    const vec3f& screenLL,
    const vec3f& screenLR,
    const vec3f& screenUL,
    float nearZ,
    float farZ
) {
    // Screen basis vectors
    vec3f vr = (screenLR - screenLL).normalized();  // Right
    vec3f vu = (screenUL - screenLL).normalized();  // Up
    vec3f vn = vr.cross(vu).normalized();           // Normal (toward viewer)

    // Vector from screen corner to eye
    vec3f va = screenLL - eye;
    vec3f vb = screenLR - eye;
    vec3f vc = screenUL - eye;

    // Distance from eye to screen plane
    float d = -va.dot(vn);

    // Compute frustum extents at near plane
    float nd = nearZ / d;
    float left = vr.dot(va) * nd;
    float right = vr.dot(vb) * nd;
    float bottom = vu.dot(va) * nd;
    float top = vu.dot(vc) * nd;

    // Build the off-axis projection matrix
    mat4f proj;
    proj.m[0][0] = 2.0f * nearZ / (right - left);
    proj.m[1][1] = 2.0f * nearZ / (top - bottom);
    proj.m[2][0] = (right + left) / (right - left);
    proj.m[2][1] = (top + bottom) / (top - bottom);
    proj.m[2][2] = -(farZ + nearZ) / (farZ - nearZ);
    proj.m[2][3] = -1.0f;
    proj.m[3][2] = -2.0f * farZ * nearZ / (farZ - nearZ);
    proj.m[3][3] = 0.0f;

    // Build rotation matrix to align screen coordinates with world
    mat4f rot;
    rot.m[0][0] = vr.x; rot.m[0][1] = vr.y; rot.m[0][2] = vr.z;
    rot.m[1][0] = vu.x; rot.m[1][1] = vu.y; rot.m[1][2] = vu.z;
    rot.m[2][0] = vn.x; rot.m[2][1] = vn.y; rot.m[2][2] = vn.z;

    // Final matrix: proj * rot * translation(-eye)
    mat4f trans = mat4f::translation(-eye.x, -eye.y, -eye.z);

    return proj * rot * trans;
}

/*!
 * @brief Simplified Kooima projection for flat screen at origin
 *
 * Assumes screen is centered at origin, facing +Z, with given dimensions.
 *
 * @param eye Eye position in world coordinates (meters)
 * @param screenWidthM Screen width in meters
 * @param screenHeightM Screen height in meters
 * @param nearZ Near clipping plane distance
 * @param farZ Far clipping plane distance
 * @return Projection matrix for this eye position
 */
inline mat4f kooimaProjectionSimple(
    const vec3f& eye,
    float screenWidthM,
    float screenHeightM,
    float nearZ,
    float farZ
) {
    float hw = screenWidthM / 2.0f;
    float hh = screenHeightM / 2.0f;

    // Screen corners (centered at origin, facing +Z)
    vec3f screenLL(-hw, -hh, 0);
    vec3f screenLR( hw, -hh, 0);
    vec3f screenUL(-hw,  hh, 0);

    return kooimaProjection(eye, screenLL, screenLR, screenUL, nearZ, farZ);
}

/*!
 * @brief Create a look-at view matrix
 *
 * @param eye Eye position
 * @param target Target position to look at
 * @param up Up vector
 * @return View matrix
 */
inline mat4f lookAt(const vec3f& eye, const vec3f& target, const vec3f& up) {
    vec3f zaxis = (eye - target).normalized();  // Camera forward
    vec3f xaxis = up.cross(zaxis).normalized(); // Camera right
    vec3f yaxis = zaxis.cross(xaxis);           // Camera up

    mat4f result;
    result.m[0][0] = xaxis.x;
    result.m[1][0] = xaxis.y;
    result.m[2][0] = xaxis.z;
    result.m[3][0] = -xaxis.dot(eye);

    result.m[0][1] = yaxis.x;
    result.m[1][1] = yaxis.y;
    result.m[2][1] = yaxis.z;
    result.m[3][1] = -yaxis.dot(eye);

    result.m[0][2] = zaxis.x;
    result.m[1][2] = zaxis.y;
    result.m[2][2] = zaxis.z;
    result.m[3][2] = -zaxis.dot(eye);

    return result;
}

} // namespace leia
