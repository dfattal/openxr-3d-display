// Copyright 2026, DisplayXR / Leia Inc.
// SPDX-License-Identifier: BSL-1.0
/*!
 * @file
 * @brief  Stdio ↔ per-PID-socket/pipe bridge for the DisplayXR MCP server.
 *
 * Two blocking threads pump bytes in opposite directions. No parsing.
 * Works on POSIX (unix domain socket) and Windows (named pipe).
 */

#include "util/u_mcp_transport.h"

#include <errno.h>
#include <pthread.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef _WIN32
#include <fcntl.h>
#include <io.h>
#include <windows.h>
#else
#include <unistd.h>
#endif

#ifdef _WIN32
typedef SSIZE_T ssize_t;
static ssize_t
read_fd(int fd, void *buf, size_t n)
{
	return _read(fd, buf, (unsigned)n);
}
static ssize_t
write_fd(int fd, const void *buf, size_t n)
{
	return _write(fd, buf, (unsigned)n);
}
#define STDIN_FD _fileno(stdin)
#define STDOUT_FD _fileno(stdout)
#else
static ssize_t
read_fd(int fd, void *buf, size_t n)
{
	return read(fd, buf, n);
}
static ssize_t
write_fd(int fd, const void *buf, size_t n)
{
	return write(fd, buf, n);
}
#define STDIN_FD STDIN_FILENO
#define STDOUT_FD STDOUT_FILENO
#endif

static void
usage(const char *argv0)
{
	fprintf(stderr,
	        "usage: %s --pid <N|auto> | --list\n"
	        "  --pid N     attach to a specific runtime process\n"
	        "  --pid auto  attach iff exactly one MCP session exists\n"
	        "  --list      print discovered sessions and exit\n",
	        argv0);
}

// Thread args: pump stdin→conn or conn→stdout.
struct pump_args
{
	struct u_mcp_conn *conn;
	bool stdin_to_conn;
};

static void *
pump_thread(void *arg)
{
	struct pump_args *a = arg;
	char buf[4096];
	if (a->stdin_to_conn) {
		for (;;) {
			ssize_t r = read_fd(STDIN_FD, buf, sizeof(buf));
			if (r <= 0) {
				break;
			}
			if (!u_mcp_conn_write(a->conn, buf, (size_t)r)) {
				break;
			}
		}
	} else {
		for (;;) {
			// The transport's read is blocking and fetches as many
			// bytes as the caller asks for — pull in chunks instead.
			char c;
			if (!u_mcp_conn_read(a->conn, &c, 1)) {
				break;
			}
			// Drain any more bytes already queued — simple one-at-a-time
			// keeps the adapter simple and low-latency.
			if (write_fd(STDOUT_FD, &c, 1) <= 0) {
				break;
			}
		}
	}
	return NULL;
}

int
main(int argc, char **argv)
{
#ifdef _WIN32
	// MCP peers speak raw binary framing; disable CRLF translation.
	_setmode(_fileno(stdin), _O_BINARY);
	_setmode(_fileno(stdout), _O_BINARY);
#endif

	const char *pid_arg = NULL;
	bool list_mode = false;
	for (int i = 1; i < argc; i++) {
		if (strcmp(argv[i], "--pid") == 0 && i + 1 < argc) {
			pid_arg = argv[++i];
		} else if (strcmp(argv[i], "--list") == 0) {
			list_mode = true;
		} else {
			usage(argv[0]);
			return 2;
		}
	}

	if (list_mode) {
		pid_t pids[64];
		size_t n = u_mcp_enumerate_sessions(pids, 64);
		for (size_t i = 0; i < n; i++) {
			printf("%ld\n", (long)pids[i]);
		}
		return 0;
	}

	if (pid_arg == NULL) {
		usage(argv[0]);
		return 2;
	}

	pid_t pid = 0;
	if (strcmp(pid_arg, "auto") == 0) {
		pid_t pids[64];
		size_t n = u_mcp_enumerate_sessions(pids, 64);
		if (n == 0) {
			fprintf(stderr, "displayxr-mcp: no running MCP sessions found\n");
			return 1;
		}
		if (n > 1) {
			fprintf(stderr, "displayxr-mcp: %zu sessions found, pass --pid <N> explicitly\n", n);
			return 1;
		}
		pid = pids[0];
	} else {
		pid = (pid_t)strtol(pid_arg, NULL, 10);
		if (pid <= 0) {
			usage(argv[0]);
			return 2;
		}
	}

	struct u_mcp_conn *conn = u_mcp_conn_connect(pid);
	if (conn == NULL) {
		fprintf(stderr, "displayxr-mcp: cannot connect to pid %ld\n", (long)pid);
		return 1;
	}

	struct pump_args up = {.conn = conn, .stdin_to_conn = true};
	struct pump_args down = {.conn = conn, .stdin_to_conn = false};

	pthread_t t_up, t_down;
	pthread_create(&t_up, NULL, pump_thread, &up);
	pthread_create(&t_down, NULL, pump_thread, &down);

	// When the stdin-side thread exits (client closed stdin), tear the
	// connection so the conn-side thread can unblock its read.
	pthread_join(t_up, NULL);
	u_mcp_conn_close(conn);
	pthread_join(t_down, NULL);
	return 0;
}
