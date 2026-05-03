# Building DisplayXR

## Prerequisites

### Windows
- Visual Studio 2022
- CMake
- Ninja
- Vendor display SDK — optional (see [Vendor SDK](#vendor-sdk) below). The **sim_display** driver works without any vendor SDK, providing a simulated 3D display with WASD + mouse eye control.

### macOS
```bash
brew install cmake ninja eigen vulkan-sdk
```

## Quick Build

### macOS
```bash
./scripts/build_macos.sh
```

Builds the runtime, OpenXR loader, and test apps. The Vulkan compositor will fail at runtime with `VK_ERROR_EXTENSION_NOT_PRESENT` (MoltenVK limitation, not a build issue).

### Windows (recommended)
```bat
scripts\build_windows.bat all
```

The script auto-fetches everything needed: vcpkg (for cJSON +
runtime deps), the OpenXR loader release zip, and the LeiaSR SDK
release artifact (from this repo's `sr-sdk-v*` release). It then
runs CMake (Ninja Multi-Config) and builds the runtime + installer
in one go. Outputs land in `_package/`.

Available targets: `all` (default), `build` (runtime only,
fastest iteration), `installer`, `test-apps`, `generate`. See
the script's header for the full list.

Requires: VS 2022 with C++ workload, Ninja
(`winget install Ninja-build.Ninja`), Vulkan SDK
(`winget install KhronosGroup.VulkanSDK`), GitHub CLI
(`winget install GitHub.cli` + `gh auth login`).

### Windows (manual cmake fallback)
For advanced users who want fine-grained control:
```bat
:: Set vendor SDK path (optional but recommended for real hardware)
set LEIASR_SDKROOT=C:\path\to\LeiaSR-SDK

:: Build
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Debug -G Ninja -DCMAKE_PREFIX_PATH=%LEIASR_SDKROOT%
cmake --build .
```

### Standard CMake Build (no vendor SDK)
```bash
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Debug -G Ninja
cmake --build .
```
Builds the runtime with sim_display only — useful for local dev
without hardware.

## Vendor SDK

DisplayXR builds and runs without any vendor SDK — the **sim_display** driver simulates a tracked 3D display for development. To enable support for a specific display, obtain the SDK from the vendor and point CMake at it.

### Leia SR Displays

1. Get the Leia SR SDK from [Leia Inc](https://www.leiainc.com/) (requires a developer account)
2. Set the environment variable before building:
   ```bash
   set LEIASR_SDKROOT=C:\path\to\LeiaSR-SDK
   ```
3. CMake will auto-detect the SDK via `find_package(simulatedreality)` and enable `XRT_HAVE_LEIA_SR`

The SDK provides display-specific weavers (D3D11, D3D12, Vulkan) and eye tracking via LookaroundFilter. See the [Vendor Integration Guide](../guides/vendor-integration.md) for details on integrating other display hardware.

## Key CMake Options

| Option | Description |
|--------|-------------|
| `XRT_HAVE_LEIA_SR` | LeiaSR SDK support (auto-enabled if SDK found) |
| `XRT_HAVE_LEIA_SR_VULKAN` | Vulkan-specific Leia weaver |
| `XRT_HAVE_LEIA_SR_D3D11` | D3D11-specific Leia weaver |
| `XRT_FEATURE_SERVICE` | Out-of-process service mode (IPC) |
| `BUILD_TESTING` | Build test suite |

### CMake Variables

- `LEIASR_SDKROOT` — Environment variable pointing to Leia SR SDK path
- `SR_PATH` — Internal, auto-set from `LEIASR_SDKROOT`

## Running Without Installing

Point `XR_RUNTIME_JSON` at the build output:

```bash
XR_RUNTIME_JSON=./build/openxr_displayxr-dev.json ./your_openxr_app
```

## Running Tests

```bash
cd build && ctest
```

## Code Formatting

```bash
git clang-format    # Format only your changes (preferred)
scripts/format-project.sh   # Format all
```

## CI Builds

**Windows** (`.github/workflows/build-windows.yml`):
- Requires `LEIASR_SDKROOT` + `CMAKE_PREFIX_PATH`
- Artifact: `DisplayXR`

**macOS** (`.github/workflows/build-macos.yml`):
- Vulkan SDK via MoltenVK, bundles libvulkan + OpenXR loader
- Artifact: `DisplayXR-macOS`
