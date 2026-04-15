// Copyright 2026, DisplayXR / Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  MCP capture_frame cross-thread hand-off.
 * @ingroup aux_util
 */

#include "u_mcp_capture.h"

#include <string.h>
#include <time.h>

// Forward-decl from state_trackers/oxr/oxr_mcp_tools.h — intentionally
// don't pull that header (which includes openxr.h) into aux_util.
typedef bool (*oxr_mcp_capture_fn)(const char *path, void *userdata);
extern void
oxr_mcp_tools_set_capture_handler(oxr_mcp_capture_fn fn, void *userdata);

/*! PNG encode of a 3024×1964 atlas is ~80–150 ms on an M1; 3 s is
 *  ample headroom while still tripping on a genuine stall. */
#define CAPTURE_TIMEOUT_MS 3000

void
u_mcp_capture_init(struct u_mcp_capture_request *req)
{
	memset(req, 0, sizeof(*req));
	pthread_mutex_init(&req->lock, NULL);
	pthread_cond_init(&req->cond, NULL);
}

void
u_mcp_capture_fini(struct u_mcp_capture_request *req)
{
	pthread_cond_destroy(&req->cond);
	pthread_mutex_destroy(&req->lock);
}

// Invoked on the MCP server thread. Hands off to the compositor and
// blocks until done or timeout.
static bool
handler_adapter(const char *path, void *userdata)
{
	struct u_mcp_capture_request *req = userdata;
	if (req == NULL || path == NULL) {
		return false;
	}

	pthread_mutex_lock(&req->lock);
	size_t n = strlen(path);
	if (n >= sizeof(req->path)) {
		n = sizeof(req->path) - 1;
	}
	memcpy(req->path, path, n);
	req->path[n] = '\0';
	req->pending = true;
	req->done = false;
	req->success = false;

	// Absolute deadline for pthread_cond_timedwait. C11's timespec_get is
	// portable (POSIX CLOCK_REALTIME / MSVC alike); clock_gettime isn't
	// — MSVC's <time.h> has no CLOCK_REALTIME symbol.
	struct timespec deadline;
	(void)timespec_get(&deadline, TIME_UTC);
	deadline.tv_sec += CAPTURE_TIMEOUT_MS / 1000;
	deadline.tv_nsec += (CAPTURE_TIMEOUT_MS % 1000) * 1000000L;
	if (deadline.tv_nsec >= 1000000000L) {
		deadline.tv_sec += 1;
		deadline.tv_nsec -= 1000000000L;
	}

	while (!req->done) {
		int rc = pthread_cond_timedwait(&req->cond, &req->lock, &deadline);
		if (rc != 0) {
			req->pending = false;
			pthread_mutex_unlock(&req->lock);
			return false;
		}
	}

	bool ok = req->success;
	req->pending = false;
	pthread_mutex_unlock(&req->lock);
	return ok;
}

void
u_mcp_capture_install(struct u_mcp_capture_request *req)
{
	oxr_mcp_tools_set_capture_handler(handler_adapter, req);
}

void
u_mcp_capture_uninstall(void)
{
	oxr_mcp_tools_set_capture_handler(NULL, NULL);
}

bool
u_mcp_capture_poll(struct u_mcp_capture_request *req, char *out_path)
{
	pthread_mutex_lock(&req->lock);
	bool pending = req->pending && !req->done;
	if (pending) {
		memcpy(out_path, req->path, sizeof(req->path));
	}
	pthread_mutex_unlock(&req->lock);
	return pending;
}

void
u_mcp_capture_complete(struct u_mcp_capture_request *req, bool success)
{
	pthread_mutex_lock(&req->lock);
	req->success = success;
	req->done = true;
	pthread_cond_signal(&req->cond);
	pthread_mutex_unlock(&req->lock);
}
