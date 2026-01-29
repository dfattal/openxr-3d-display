# Hybrid Mode Architecture

## Overview

The **Hybrid Mode** is a Windows-specific feature that allows the OpenXR runtime to automatically select between two execution modes based on the application's environment:

| Application Type | Execution Mode | Compositor |
|-----------------|----------------|------------|
| Native Win32/D3D11 apps | **In-process** | D3D11 native compositor |
| Sandboxed apps (WebXR, Chrome, UWP) | **IPC/Service** | D3D11 service compositor |

This solves a critical issue on **Intel Iris iGPUs** where Vulkan cannot reliably import D3D11 textures, which broke WebXR support.

## Problem Statement

### The Intel Iris Issue

On Intel integrated GPUs, Vulkan's `VK_KHR_external_memory` extensions fail to import D3D11 textures created by applications. This is a driver/hardware limitation that manifests as:

- Black screens when running WebXR content
- Failed swapchain imports in service mode
- Silent rendering failures with no error messages

### Why Sandboxed Apps Need Service Mode

**WebXR (Chrome/Edge)** and **UWP apps** run inside a Windows **AppContainer** sandbox. Due to security restrictions:

- They cannot access the GPU driver directly in the way required for in-process composition
- They must communicate via IPC with an out-of-process service
- The service compositor needs to import textures from the sandboxed process

### The Solution

Hybrid mode provides:
1. **In-process D3D11 compositor** for native apps (avoids IPC overhead)
2. **Service D3D11 compositor** for sandboxed apps (pure D3D11, no Vulkan)

Both paths avoid Vulkan-D3D11 interop entirely on Windows.

---

## Architecture Diagram

```
                     OpenXR Application
                            │
                            ▼
              ┌─────────────────────────────┐
              │   xrt_instance_create()     │
              │   (target.c hybrid entry)   │
              │                             │
              │  u_sandbox_should_use_ipc() │
              │         │                   │
              │   ┌─────┴─────┐             │
              │   │           │             │
              │   ▼           ▼             │
              │ false       true            │
              └───┬───────────┬─────────────┘
                  │           │
                  ▼           ▼
    ┌─────────────────┐   ┌─────────────────────────┐
    │ In-Process Mode │   │ IPC/Service Mode        │
    │                 │   │                         │
    │ native_instance │   │ ipc_instance_create()   │
    │ _create()       │   │                         │
    └────────┬────────┘   └───────────┬─────────────┘
             │                        │
             ▼                        │ Named Pipe
    ┌─────────────────┐               │ + DXGI Handles
    │ D3D11 Native    │               ▼
    │ Compositor      │   ┌─────────────────────────┐
    │ (in-process)    │   │ monado-service          │
    └────────┬────────┘   │                         │
             │            │ ┌─────────────────────┐ │
             │            │ │ D3D11 Service       │ │
             │            │ │ Compositor          │ │
             │            │ │ • Own D3D11 device  │ │
             │            │ │ • Import via DXGI   │ │
             │            │ │ • KeyedMutex sync   │ │
             │            │ └──────────┬──────────┘ │
             │            └────────────┼────────────┘
             │                         │
             ▼                         ▼
    ┌─────────────────────────────────────────────┐
    │              Leia SR Weaver                 │
    │        (Light field interlacing)            │
    └─────────────────────────────────────────────┘
                         │
                         ▼
                   Leia Display
```

---

## Decision Flow: D3D11 vs Vulkan

### When is D3D11 Used?

| Scenario | Compositor | Graphics API |
|----------|------------|--------------|
| Native D3D11 app, in-process | D3D11 native | **D3D11** |
| Sandboxed app, service mode | D3D11 service | **D3D11** |
| `XRT_SERVICE_USE_D3D11=1` (default) | D3D11 service | **D3D11** |

### When is Vulkan Used?

| Scenario | Compositor | Graphics API |
|----------|------------|--------------|
| `XRT_SERVICE_USE_D3D11=0` | Vulkan main | **Vulkan** |
| Linux/Android | Vulkan main | **Vulkan** |
| Native Vulkan app (no hybrid) | Vulkan main | **Vulkan** |

### Decision Logic in Code

```c
// src/xrt/targets/openxr/target.c
// Hybrid entry point - decides between in-process and IPC mode
xrt_result_t xrt_instance_create(...)
{
    if (u_sandbox_should_use_ipc()) {
        // AppContainer detected OR XRT_FORCE_MODE=ipc
        return ipc_instance_create(ii, out_xinst);
    } else {
        // Native app OR XRT_FORCE_MODE=native
        return native_instance_create(ii, out_xinst);
    }
}

// src/xrt/targets/common/target_instance.c
// Both service (target_instance) and hybrid client (target_instance_hybrid)
// use this code path when XRT_USE_D3D11_SERVICE_COMPOSITOR is defined
#ifdef XRT_USE_D3D11_SERVICE_COMPOSITOR
if (debug_get_bool_option_use_d3d11_service()) {
    // Default: use D3D11 service compositor
    comp_d3d11_service_create_system(head, &xsysc);
}
#endif
// Fallback to Vulkan compositor if D3D11 fails or is disabled
if (xsysc == NULL) {
    comp_main_create_system_compositor(head, NULL, NULL, &xsysc);
}
```

---

## Environment Variables

### XRT_FORCE_MODE

**Purpose:** Override automatic sandbox detection to force a specific execution mode.

| Value | Effect |
|-------|--------|
| `native` | Force in-process native compositor (even in sandboxed apps) |
| `ipc` | Force IPC/service mode (even in native apps) |
| (unset) | Use automatic detection (default) |
| (other) | Warning logged, falls back to automatic detection |

**Default:** Unset (automatic detection)

**Use cases:**
- Testing service mode with a native app: `set XRT_FORCE_MODE=ipc`
- Debugging in-process compositor: `set XRT_FORCE_MODE=native`

**Example:**
```batch
:: Force IPC mode for testing
set XRT_FORCE_MODE=ipc
MyOpenXRApp.exe
```

### XRT_SERVICE_USE_D3D11

**Purpose:** Control whether the service uses D3D11 or Vulkan compositor.

| Value | Effect |
|-------|--------|
| `1` or `true` | Use D3D11 service compositor (default) |
| `0` or `false` | Fall back to Vulkan main compositor |

**Default:** `true` (D3D11 preferred)

**Why D3D11 is default:**
- Avoids Vulkan-D3D11 interop bugs on Intel iGPUs
- More reliable texture import via DXGI
- Better compatibility with Windows sandboxed apps

**Example:**
```batch
:: Force Vulkan in service (for debugging)
set XRT_SERVICE_USE_D3D11=0
monado-service.exe
```

### XRT_COMPOSITOR_NULL

**Purpose:** Use the null compositor (no actual rendering).

| Value | Effect |
|-------|--------|
| `1` or `true` | Use null compositor |
| `0` or `false` | Use real compositor (default) |

**Default:** `false`

**Use case:** Headless testing, CI pipelines.

---

## Build Configuration

### CMake Option

```cmake
option(XRT_FEATURE_HYBRID_MODE "Enable hybrid in-process/IPC mode for Windows" OFF)
```

**Dependencies:** Requires all of:
- `WIN32` - Windows platform
- `XRT_MODULE_IPC` - IPC infrastructure
- `XRT_FEATURE_OPENXR` - OpenXR support
- `XRT_HAVE_D3D11` - D3D11 support

### Enabling Hybrid Mode

```bash
cmake -B build -DXRT_FEATURE_HYBRID_MODE=ON ...
```

When enabled, the build produces:
- `openxr_monado.dll` - Runtime with hybrid entry point
- `monado-service.exe` - Service with D3D11 compositor

### Build Targets Created

| Target | Purpose |
|--------|---------|
| `target_instance` | Standard instance (service uses this) - gets D3D11 compositor support when hybrid mode enabled |
| `target_instance_hybrid` | Hybrid instance for client DLL - exports `native_instance_create` to avoid symbol conflict |
| `comp_d3d11_service` | D3D11 service compositor library |

### Internal Compile Definitions

| Define | Where Used | Purpose |
|--------|-----------|---------|
| `XRT_FEATURE_HYBRID_MODE` | `target_instance_hybrid`, client DLL | Renames `xrt_instance_create` to `native_instance_create` |
| `XRT_USE_D3D11_SERVICE_COMPOSITOR` | `target_instance`, `target_instance_hybrid` | Enables D3D11 compositor selection logic |

---

## Source Files

### Core Hybrid Mode Files

| File | Purpose |
|------|---------|
| `src/xrt/targets/openxr/target.c` | Hybrid entry point (`xrt_instance_create`) |
| `src/xrt/targets/common/target_instance.c` | `native_instance_create` + D3D11 service selection |
| `src/xrt/auxiliary/util/u_sandbox.h` | Sandbox detection API |
| `src/xrt/auxiliary/util/u_sandbox.c` | AppContainer detection implementation |

### D3D11 Service Compositor

| File | Purpose |
|------|---------|
| `src/xrt/compositor/d3d11_service/comp_d3d11_service.h` | Service compositor interface |
| `src/xrt/compositor/d3d11_service/comp_d3d11_service.cpp` | Implementation |
| `src/xrt/compositor/d3d11_service/d3d11_service_shaders.h` | HLSL shaders |
| `src/xrt/compositor/d3d11_service/CMakeLists.txt` | Build configuration |

### IPC Client

| File | Purpose |
|------|---------|
| `src/xrt/ipc/client/ipc_client_interface.h` | IPC instance creation |
| `src/xrt/ipc/client/ipc_client_compositor.c` | Client-side compositor proxy |

---

## D3D11 Service Compositor Details

### Key Features

1. **Own D3D11 Device** - Creates a separate D3D11 device in the service process, independent of client applications.

2. **DXGI Shared Handles** - Imports swapchain textures from clients using `ID3D11Device5::OpenSharedResource1()` with `DXGI_SHARED_RESOURCE_READ` access.

3. **KeyedMutex Synchronization** - Uses `IDXGIKeyedMutex` for safe cross-process access:
   ```cpp
   // Client releases after rendering
   keyed_mutex->ReleaseSync(0);

   // Service acquires before compositing
   keyed_mutex->AcquireSync(0, INFINITE);
   ```

4. **Leia SR Integration** - Creates SR Weaver using the service's D3D11 device for light field interlacing.

### Data Flow (WebXR)

```
Chrome (AppContainer)                    monado-service
─────────────────────                    ──────────────
1. Create D3D11 textures
   (SHARED_NTHANDLE flag)
2. Get DXGI handles ──────────IPC──────► 3. OpenSharedResource1()
4. Render to texture                        import textures
5. Release KeyedMutex ────────sync──────► 6. Acquire KeyedMutex
                                         7. Composite layers
                                         8. Weave (Leia SR)
                                         9. Present to display
                                         10. Release KeyedMutex
```

---

## AppContainer Detection

### How It Works

```c
bool u_sandbox_is_app_container(void)
{
    HANDLE token;
    OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &token);

    BOOL is_app_container = FALSE;
    GetTokenInformation(token, TokenIsAppContainer, &is_app_container, ...);

    CloseHandle(token);
    return is_app_container != FALSE;
}
```

### What Uses AppContainer?

- **Chrome/Edge WebXR** - WebXR content runs sandboxed
- **UWP Apps** - Microsoft Store apps
- **Sandboxed Windows Apps** - Apps requesting reduced privileges

---

## Testing

### Test Native App (In-Process Mode)

```batch
:: Should log: "Hybrid mode: using in-process native compositor"
D3D11TestNoSessionTarget.exe
```

### Test Service Mode (Forced)

```batch
:: Start service first
monado-service.exe

:: Force IPC mode on native app
set XRT_FORCE_MODE=ipc
D3D11TestNoSessionTarget.exe
:: Should log: "XRT_FORCE_MODE=ipc: forcing IPC/service mode"
```

### Test WebXR

1. Start `monado-service.exe`
2. Open Chrome, navigate to WebXR sample
3. Should auto-detect AppContainer and use service
4. Verify 3D output on Leia display

### Verify D3D11 vs Vulkan

Check log output for:
```
Using D3D11 service compositor (hybrid mode)
```

Or to test Vulkan fallback:
```batch
set XRT_SERVICE_USE_D3D11=0
monado-service.exe
:: Should log: "D3D11 service compositor creation failed, falling back to Vulkan"
:: (or use Vulkan directly if D3D11 creation isn't attempted)
```

---

## Troubleshooting

### Black Screen in WebXR

1. Ensure `monado-service.exe` is running
2. Check logs for "Using D3D11 service compositor"
3. Verify `XRT_SERVICE_USE_D3D11` is not set to 0

### AppContainer Not Detected

1. Check if running in Chrome/Edge (WebXR auto-detects)
2. Use `XRT_FORCE_MODE=ipc` to force service mode
3. Check logs for "AppContainer sandbox detected"

### Service Compositor Fails

1. Check D3D11 device creation logs
2. Verify GPU driver supports D3D11.4+
3. Try `XRT_SERVICE_USE_D3D11=0` to fall back to Vulkan

---

## References

- [phase-1.md](phase-1.md) - XR_EXT_session_target extension
- [phase-2.md](phase-2.md) - Per-session infrastructure
- [phase-3.md](phase-3.md) - Target Provider Service Pattern
- [app-control.md](app-control.md) - Application window control design
- [Leia SR SDK Documentation](https://developer.leiainc.com/) - Leia SR SDK
