// Copyright 2025, Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Vulkan buffer/image creation helpers implementation
 */

#include "gs_vulkan_utils.h"
#include <cstdio>
#include <cstring>

uint32_t gsFindMemoryType(VkPhysicalDevice physDevice,
                          uint32_t typeFilter,
                          VkMemoryPropertyFlags properties)
{
    VkPhysicalDeviceMemoryProperties memProps;
    vkGetPhysicalDeviceMemoryProperties(physDevice, &memProps);
    for (uint32_t i = 0; i < memProps.memoryTypeCount; i++) {
        if ((typeFilter & (1 << i)) &&
            (memProps.memoryTypes[i].propertyFlags & properties) == properties) {
            return i;
        }
    }
    fprintf(stderr, "gs_vulkan_utils: failed to find suitable memory type\n");
    return 0;
}

GsBuffer gsCreateBuffer(VkDevice device,
                        VkPhysicalDevice physDevice,
                        VkDeviceSize size,
                        VkBufferUsageFlags usage,
                        VkMemoryPropertyFlags memProps)
{
    GsBuffer buf;
    buf.size = size;

    VkBufferCreateInfo ci = {VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO};
    ci.size = size;
    ci.usage = usage;
    ci.sharingMode = VK_SHARING_MODE_EXCLUSIVE;

    if (vkCreateBuffer(device, &ci, nullptr, &buf.buffer) != VK_SUCCESS) {
        fprintf(stderr, "gs_vulkan_utils: failed to create buffer (%llu bytes)\n",
                (unsigned long long)size);
        return buf;
    }

    VkMemoryRequirements memReq;
    vkGetBufferMemoryRequirements(device, buf.buffer, &memReq);

    VkMemoryAllocateInfo ai = {VK_STRUCTURE_TYPE_MEMORY_ALLOCATE_INFO};
    ai.allocationSize = memReq.size;
    ai.memoryTypeIndex = gsFindMemoryType(physDevice, memReq.memoryTypeBits, memProps);

    if (vkAllocateMemory(device, &ai, nullptr, &buf.memory) != VK_SUCCESS) {
        fprintf(stderr, "gs_vulkan_utils: failed to allocate buffer memory (%llu bytes)\n",
                (unsigned long long)memReq.size);
        vkDestroyBuffer(device, buf.buffer, nullptr);
        buf.buffer = VK_NULL_HANDLE;
        return buf;
    }

    vkBindBufferMemory(device, buf.buffer, buf.memory, 0);
    return buf;
}

void gsDestroyBuffer(VkDevice device, GsBuffer& buf)
{
    if (buf.buffer != VK_NULL_HANDLE) {
        vkDestroyBuffer(device, buf.buffer, nullptr);
        buf.buffer = VK_NULL_HANDLE;
    }
    if (buf.memory != VK_NULL_HANDLE) {
        vkFreeMemory(device, buf.memory, nullptr);
        buf.memory = VK_NULL_HANDLE;
    }
    buf.size = 0;
}

GsImage gsCreateImage2D(VkDevice device,
                        VkPhysicalDevice physDevice,
                        uint32_t width,
                        uint32_t height,
                        VkFormat format,
                        VkImageUsageFlags usage)
{
    GsImage img;
    img.width = width;
    img.height = height;

    VkImageCreateInfo ici = {VK_STRUCTURE_TYPE_IMAGE_CREATE_INFO};
    ici.imageType = VK_IMAGE_TYPE_2D;
    ici.format = format;
    ici.extent = {width, height, 1};
    ici.mipLevels = 1;
    ici.arrayLayers = 1;
    ici.samples = VK_SAMPLE_COUNT_1_BIT;
    ici.tiling = VK_IMAGE_TILING_OPTIMAL;
    ici.usage = usage;
    ici.sharingMode = VK_SHARING_MODE_EXCLUSIVE;
    ici.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;

    if (vkCreateImage(device, &ici, nullptr, &img.image) != VK_SUCCESS) {
        fprintf(stderr, "gs_vulkan_utils: failed to create image (%ux%u)\n", width, height);
        return img;
    }

    VkMemoryRequirements memReq;
    vkGetImageMemoryRequirements(device, img.image, &memReq);

    VkMemoryAllocateInfo ai = {VK_STRUCTURE_TYPE_MEMORY_ALLOCATE_INFO};
    ai.allocationSize = memReq.size;
    ai.memoryTypeIndex = gsFindMemoryType(physDevice, memReq.memoryTypeBits,
                                          VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT);

    if (vkAllocateMemory(device, &ai, nullptr, &img.memory) != VK_SUCCESS) {
        fprintf(stderr, "gs_vulkan_utils: failed to allocate image memory\n");
        vkDestroyImage(device, img.image, nullptr);
        img.image = VK_NULL_HANDLE;
        return img;
    }
    vkBindImageMemory(device, img.image, img.memory, 0);

    VkImageViewCreateInfo vci = {VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO};
    vci.image = img.image;
    vci.viewType = VK_IMAGE_VIEW_TYPE_2D;
    vci.format = format;
    vci.subresourceRange = {VK_IMAGE_ASPECT_COLOR_BIT, 0, 1, 0, 1};

    if (vkCreateImageView(device, &vci, nullptr, &img.view) != VK_SUCCESS) {
        fprintf(stderr, "gs_vulkan_utils: failed to create image view\n");
    }

    return img;
}

void gsDestroyImage(VkDevice device, GsImage& img)
{
    if (img.view != VK_NULL_HANDLE) {
        vkDestroyImageView(device, img.view, nullptr);
        img.view = VK_NULL_HANDLE;
    }
    if (img.image != VK_NULL_HANDLE) {
        vkDestroyImage(device, img.image, nullptr);
        img.image = VK_NULL_HANDLE;
    }
    if (img.memory != VK_NULL_HANDLE) {
        vkFreeMemory(device, img.memory, nullptr);
        img.memory = VK_NULL_HANDLE;
    }
    img.width = 0;
    img.height = 0;
}

bool gsUploadBuffer(VkDevice device,
                    VkPhysicalDevice physDevice,
                    VkQueue queue,
                    VkCommandPool cmdPool,
                    GsBuffer& dst,
                    const void* data,
                    VkDeviceSize size)
{
    // Create staging buffer
    GsBuffer staging = gsCreateBuffer(device, physDevice, size,
        VK_BUFFER_USAGE_TRANSFER_SRC_BIT,
        VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT);
    if (staging.buffer == VK_NULL_HANDLE) return false;

    // Map and copy
    void* mapped = nullptr;
    vkMapMemory(device, staging.memory, 0, size, 0, &mapped);
    memcpy(mapped, data, (size_t)size);
    vkUnmapMemory(device, staging.memory);

    // Record copy command
    VkCommandBufferAllocateInfo ai = {VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO};
    ai.commandPool = cmdPool;
    ai.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
    ai.commandBufferCount = 1;
    VkCommandBuffer cmd;
    vkAllocateCommandBuffers(device, &ai, &cmd);

    VkCommandBufferBeginInfo bi = {VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO};
    bi.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;
    vkBeginCommandBuffer(cmd, &bi);

    VkBufferCopy region = {};
    region.size = size;
    vkCmdCopyBuffer(cmd, staging.buffer, dst.buffer, 1, &region);

    vkEndCommandBuffer(cmd);

    VkSubmitInfo si = {VK_STRUCTURE_TYPE_SUBMIT_INFO};
    si.commandBufferCount = 1;
    si.pCommandBuffers = &cmd;
    vkQueueSubmit(queue, 1, &si, VK_NULL_HANDLE);
    vkQueueWaitIdle(queue);

    vkFreeCommandBuffers(device, cmdPool, 1, &cmd);
    gsDestroyBuffer(device, staging);
    return true;
}
