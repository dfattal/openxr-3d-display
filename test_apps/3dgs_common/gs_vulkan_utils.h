// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Vulkan buffer/image creation helpers for 3DGS compute pipeline
 */

#pragma once

#include <vulkan/vulkan.h>
#include <cstdint>

// Find a memory type index matching the required properties.
uint32_t gsFindMemoryType(VkPhysicalDevice physDevice,
                          uint32_t typeFilter,
                          VkMemoryPropertyFlags properties);

struct GsBuffer {
    VkBuffer buffer = VK_NULL_HANDLE;
    VkDeviceMemory memory = VK_NULL_HANDLE;
    VkDeviceSize size = 0;
};

// Create a GPU buffer with the specified usage and memory properties.
GsBuffer gsCreateBuffer(VkDevice device,
                        VkPhysicalDevice physDevice,
                        VkDeviceSize size,
                        VkBufferUsageFlags usage,
                        VkMemoryPropertyFlags memProps);

// Destroy a buffer and free its memory.
void gsDestroyBuffer(VkDevice device, GsBuffer& buf);

struct GsImage {
    VkImage image = VK_NULL_HANDLE;
    VkDeviceMemory memory = VK_NULL_HANDLE;
    VkImageView view = VK_NULL_HANDLE;
    uint32_t width = 0;
    uint32_t height = 0;
};

// Create a 2D image with a view.
GsImage gsCreateImage2D(VkDevice device,
                        VkPhysicalDevice physDevice,
                        uint32_t width,
                        uint32_t height,
                        VkFormat format,
                        VkImageUsageFlags usage);

// Destroy an image, its view, and free memory.
void gsDestroyImage(VkDevice device, GsImage& img);

// Upload CPU data to a device-local buffer via a staging buffer.
bool gsUploadBuffer(VkDevice device,
                    VkPhysicalDevice physDevice,
                    VkQueue queue,
                    VkCommandPool cmdPool,
                    GsBuffer& dst,
                    const void* data,
                    VkDeviceSize size);
