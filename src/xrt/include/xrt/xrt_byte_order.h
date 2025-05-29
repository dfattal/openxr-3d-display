// Copyright 2025, Beyley Cardellio
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Endian-specific byte order defines.
 * @author Beyley Cardellio <ep1cm1n10n123@gmail.com>
 * @ingroup aux_os
 */

#pragma once

#include "xrt_compiler.h"

#include <stdint.h>

#ifdef __linux__

// On Linux, all these conversion functions are defined for both endians
#include <asm/byteorder.h>

#elif defined(XRT_BIG_ENDIAN)

#error "@todo: Add byte order constants and functions for this OS or big endian machines."

#else

#define __be64 uint64_t
#define __be32 uint32_t
#define __be16 uint16_t

#define __be16_to_cpu(x) ((((uint16_t)x & (uint16_t)0x00FFU) << 8) | (((uint16_t)x & (uint16_t)0xFF00U) >> 8))
#define __cpu_to_be16(x) __be16_to_cpu(x)

#define __be32_to_cpu(x)                                                                                               \
	((((uint32_t)x & (uint32_t)0x000000FFUL) << 24) | (((uint32_t)x & (uint32_t)0x0000FF00UL) << 8) |              \
	 (((uint32_t)x & (uint32_t)0x00FF0000UL) >> 8) | (((uint32_t)x & (uint32_t)0xFF000000UL) >> 24))
#define __cpu_to_be32(x) __be32_to_cpu(x)

#define __be64_to_cpu(x)                                                                                               \
	((((uint64_t)x & (uint64_t)0x00000000000000FFULL) << 56) |                                                     \
	 (((uint64_t)x & (uint64_t)0x000000000000FF00ULL) << 40) |                                                     \
	 (((uint64_t)x & (uint64_t)0x0000000000FF0000ULL) << 24) |                                                     \
	 (((uint64_t)x & (uint64_t)0x00000000FF000000ULL) << 8) |                                                      \
	 (((uint64_t)x & (uint64_t)0x000000FF00000000ULL) >> 8) |                                                      \
	 (((uint64_t)x & (uint64_t)0x0000FF0000000000ULL) >> 24) |                                                     \
	 (((uint64_t)x & (uint64_t)0x00FF000000000000ULL) >> 40) |                                                     \
	 (((uint64_t)x & (uint64_t)0xFF00000000000000ULL) >> 56)) |
#define __cpu_to_be64(x) __be64_to_cpu(x)

#define __le64 uint64_t
#define __le32 uint32_t
#define __le16 uint16_t
#define __u8 uint8_t
#define __s8 int8_t
#define __cpu_to_le16
#define __le16_to_cpu
#define __cpu_to_le32
#define __le32_to_cpu
#define __cpu_to_le64
#define __le64_to_cpu

#endif
