// Copyright 2021, Collabora, Ltd.
// Copyright 2025-2026, NVIDIA CORPORATION.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief A collection of strings, like a list of extensions to enable
 *
 * @author Rylie Pavlik <rylie.pavlik@collabora.com>
 * @ingroup aux_util
 *
 */

#include "u_string_list.h"
#include "u_string_list.hpp"

#include <algorithm>
#include <cstring>
#include <string>


/*
 *
 * Defines and structs.
 *
 */

using xrt::auxiliary::util::StringList;

struct u_string_list
{
	u_string_list() = default;
	u_string_list(StringList &&sl) : list(std::move(sl)) {}

	StringList list;
};


/*
 *
 * Helpers
 *
 */

enum class ExtensionType
{
	KHR = 0,         // Khronos extensions
	EXT = 1,         // Multi-vendor extensions
	VENDOR = 2,      // Vendor-specific extensions (AMD, NV, INTEL, etc.)
	EXPERIMENTAL = 3 // Experimental extensions
};

/*!
 * @brief Helper class for sorting extension names.
 *
 * Encapsulates the sort key with comparison operators for cleaner sorting.
 */
struct ExtensionSortKey
{
	std::string api_prefix;
	ExtensionType type;
	std::string name;

	/*!
	 * Sorts in field declaration order:
	 *
	 * 1. API prefix (VK, XR, etc.)
	 * 2. Extension type (KHR < EXT < VENDOR < EXPERIMENTAL)
	 * 3. Alphabetically by full name
	 */
	auto
	operator<=>(const ExtensionSortKey &other) const = default;
};

/*!
 * @brief Check if a vendor string represents an experimental extension.
 *
 * Experimental extensions have vendor codes ending with 'X' optionally followed
 * by digits.
 *
 * Examples: NVX, AMDX, NVX1, NVX2, INTELX
 *
 * Special case: QNX is a legitimate vendor (QNX operating system), not
 * experimental.
 */
static bool
is_experimental_vendor(const std::string &vendor)
{
	// Special case: QNX is a legitimate vendor, not experimental
	if (vendor == "QNX") {
		return false;
	}

	// Check if vendor ends with 'X' optionally followed by digits
	if (vendor.empty()) {
		return false;
	}

	size_t len = vendor.length();
	size_t i = len - 1;

	// Skip trailing digits
	while (i > 0 && std::isdigit(vendor[i])) {
		i--;
	}

	// Check if we found an 'X' and there's something before it
	return (vendor[i] == 'X' && i > 0);
}

/*!
 * @brief Get the extension type and API prefix for sorting purposes.
 *
 * Returns an ExtensionSortKey for comparison.
 */
static ExtensionSortKey
get_extension_sort_key(const char *ext)
{
	std::string name(ext);

	// Find the first underscore to separate API prefix (e.g., "VK", "XR")
	size_t first_underscore = name.find('_');
	if (first_underscore == std::string::npos) {
		// No underscore, treat as is
		return {name, ExtensionType::VENDOR, name};
	}

	std::string api_prefix = name.substr(0, first_underscore);

	// Find the second underscore to get the vendor/type part
	size_t second_underscore = name.find('_', first_underscore + 1);
	if (second_underscore == std::string::npos) {
		// Only one underscore, treat as vendor
		return {api_prefix, ExtensionType::VENDOR, name};
	}

	std::string vendor = name.substr(first_underscore + 1, second_underscore - first_underscore - 1);

	// Determine extension type based on vendor string
	ExtensionType type;
	if (vendor == "KHR") {
		type = ExtensionType::KHR;
	} else if (vendor == "EXT") {
		type = ExtensionType::EXT;
	} else if (is_experimental_vendor(vendor)) {
		type = ExtensionType::EXPERIMENTAL;
	} else {
		type = ExtensionType::VENDOR;
	}

	return {api_prefix, type, name};
}


/*
 *
 * 'Exported' functions.
 *
 */

struct u_string_list *
u_string_list_create()
{
	try {
		auto ret = std::make_unique<u_string_list>();
		return ret.release();
	} catch (std::exception const &) {
		return nullptr;
	}
}

struct u_string_list *
u_string_list_create_with_capacity(uint32_t capacity)
{

	try {
		auto ret = std::make_unique<u_string_list>(xrt::auxiliary::util::StringList{capacity});
		return ret.release();
	} catch (std::exception const &) {
		return nullptr;
	}
}

struct u_string_list *
u_string_list_create_from_list(struct u_string_list *usl)
{
	try {
		auto ret = std::make_unique<u_string_list>(xrt::auxiliary::util::StringList{usl->list});
		return ret.release();
	} catch (std::exception const &) {
		return nullptr;
	}
}

struct u_string_list *
u_string_list_create_from_array(const char *const *arr, uint32_t size)
{
	if (arr == nullptr || size == 0) {
		return u_string_list_create();
	}
	try {
		auto ret = std::make_unique<u_string_list>(xrt::auxiliary::util::StringList{size});
		for (uint32_t i = 0; i < size; ++i) {
			ret->list.push_back(arr[i]);
		}
		return ret.release();
	} catch (std::exception const &) {
		return nullptr;
	}
}

uint32_t
u_string_list_get_size(const struct u_string_list *usl)
{
	if (usl == nullptr) {
		return 0;
	}
	return usl->list.size();
}

const char *const *
u_string_list_get_data(const struct u_string_list *usl)
{

	if (usl == nullptr) {
		return nullptr;
	}
	return usl->list.data();
}


int
u_string_list_append(struct u_string_list *usl, const char *str)
{
	if (usl == nullptr) {
		return -1;
	}
	try {
		usl->list.push_back(str);
		return 1;
	} catch (std::exception const &) {
		return -1;
	}
}

int
u_string_list_append_array(struct u_string_list *usl, const char *const *arr, uint32_t size)
{

	if (usl == nullptr) {
		return -1;
	}
	try {
		for (uint32_t i = 0; i < size; ++i) {
			usl->list.push_back(arr[i]);
		}
		return 1;
	} catch (std::exception const &) {
		return -1;
	}
}

int
u_string_list_append_unique(struct u_string_list *usl, const char *str)
{
	if (usl == nullptr) {
		return -1;
	}
	try {
		auto added = usl->list.push_back_unique(str);
		return added ? 1 : 0;
	} catch (std::exception const &) {
		return -1;
	}
}

bool
u_string_list_contains(struct u_string_list *usl, const char *str)
{
	return usl->list.contains(str);
}

void
u_string_list_sort_extensions(struct u_string_list *usl)
{
	if (usl == nullptr || usl->list.size() == 0) {
		return;
	}

	// Get the data pointer and size from the StringList
	// We need to const_cast because std::sort needs non-const iterators
	auto data_ptr = const_cast<const char **>(usl->list.data());
	auto count = usl->list.size();
	auto cmp = [](const char *a, const char *b) { return get_extension_sort_key(a) < get_extension_sort_key(b); };

	// Sort using our custom comparison function
	std::sort(data_ptr, data_ptr + count, cmp);
}

void
u_string_list_destroy(struct u_string_list **list_ptr)
{
	if (list_ptr == nullptr) {
		return;
	}
	u_string_list *list = *list_ptr;
	if (list == nullptr) {
		return;
	}
	delete list;
	*list_ptr = nullptr;
}
