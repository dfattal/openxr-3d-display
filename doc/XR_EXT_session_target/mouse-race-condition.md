# SR SDK Race Condition: weaverWndProc vs weave() Concurrent Access

## Summary

Crash occurs during normal operation when `weaverWndProc` is called on the window's message pump thread while `weave()` executes concurrently on a render thread. The most reliable trigger is mouse button release (`WM_LBUTTONUP`), which also causes a reentrant `WM_CAPTURECHANGED` through `ReleaseCapture()`.

**Affected APIs:** All graphics APIs on Windows (the bug is in the shared `WeaverBaseImpl` base class and the per-API weaver internals).

## Symptoms

- Application crashes during mouse-up while rendering is active
- No shutdown or destruction involved -- the weaver is alive and in use
- Crash does NOT occur in single-threaded applications where the message pump and `weave()` run on the same thread
- Crash appears immediately when rendering is moved to a separate thread

## Architecture That Triggers It

Many applications use a dedicated render thread to keep animation smooth during window drag/resize (where `DefWindowProc` enters a modal loop that blocks the message pump thread):

```
Main thread:     GetMessage loop -> WndProcDispatcher -> weaverWndProc(WM_LBUTTONUP)
Render thread:   weave()  (concurrent)
```

In a single-threaded app these are serialized and never overlap. With a render thread, they execute simultaneously.

## Why Mouse-Up Specifically

`WM_LBUTTONUP` handling typically calls `ReleaseCapture()`, which synchronously sends `WM_CAPTURECHANGED` back to the window. This means `weaverWndProc` is called **twice** in rapid succession (once for `WM_LBUTTONUP`, once for `WM_CAPTURECHANGED`), increasing the collision window with a concurrent `weave()` call on the render thread.

## Root Cause

`weaverWndProc` and `weave()` share internal weaver state (window metrics, shader resources, D3D11/Vulkan objects) without synchronization. When called concurrently from different threads, this is a data race.

> **Review note — disjoint member sets:**
> On closer inspection, `weaverWndProc` and `weave()` access *disjoint* member variable sets within `WeaverBaseImpl`. `weaverWndProc` only touches the private `m_windowData` struct (window metrics, `moving` flag, etc.), while `weave()` accesses `SRMonitorRectangle`, `window`, `nonSRMonitorRectangles`, etc. under `determineWeavingEnabledMutex`. There is no direct C++ data race on SDK member variables between these two functions.
>
> **The actual shared path** is through `CallWindowProc` at `WeaverBaseImpl.ipp:197`, which chains to the application's original WndProc. If the application handles `WM_SIZE` / `WM_WINDOWPOSCHANGED` by resizing swapchains or touching graphics resources on the main thread while `weave()` runs on the render thread, *that* is the race. The collision is in application-side graphics state (swap chain, render targets, device context), not in the SR SDK's own members. The SDK's role is that it forwards messages via `CallWindowProc` without giving the application any synchronization point to coordinate with the render thread.

## Suggested Fix

Add internal synchronization so that `weaverWndProc` and `weave()` do not access shared state concurrently. For example, a shared mutex (or SRW lock) protecting the weaver's internal state:

```cpp
// In weave():
LRESULT WeaverBaseImpl::weave(...)
{
    AcquireSRWLockShared(&m_stateLock);   // or std::shared_lock
    // ... existing weave logic ...
    ReleaseSRWLockShared(&m_stateLock);
}

// In weaverWndProc():
LRESULT WeaverBaseImpl::weaverWndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam)
{
    AcquireSRWLockExclusive(&m_stateLock);  // or std::unique_lock
    // ... existing message handling that mutates state ...
    ReleaseSRWLockExclusive(&m_stateLock);
    return CallWindowProc(m_originalWndProc, hWnd, message, wParam, lParam);
}
```

A shared (reader-writer) lock is preferred over a plain mutex because `weave()` is called at frame rate and should not block on unrelated messages. `weaverWndProc` takes the exclusive lock only when it mutates state; read-only message handling can use a shared lock or skip the lock entirely.

**Important:** The lock must NOT be held across the `CallWindowProc` call to the application's original window procedure, since the application may call back into weaver APIs (e.g., `setLatencyInFrames`), causing a deadlock. Only protect the SR SDK's internal state access.

> **Review notes on the proposed locking scheme:**
>
> 1. **SRW shared lock in `weave()` is semantically backwards.** `weave()` mutates graphics state (binds shaders, issues draw calls, presents frames). Taking a *shared* (reader) lock implies multiple concurrent `weave()` calls are safe, which they are not for D3D11 immediate context or any single-threaded graphics API. If a lock is introduced, `weave()` should take the *exclusive* side — or use a plain mutex — to correctly express that it is a writer.
>
> 2. **The lock should NOT cover all of `weaverWndProc`.** The SDK's own message handling in `weaverWndProc` only mutates `m_windowData`, which is disjoint from `weave()`'s working set (see Root Cause review note). The synchronization point that matters is the `CallWindowProc` chain at `WeaverBaseImpl.ipp:197`, because that's where control passes to the application's WndProc, which may resize swapchains or touch graphics resources. Only the `CallWindowProc` call (and any state it transitively touches) needs to be coordinated with `weave()`.
>
> 3. **A try-lock is preferable to avoid blocking the message pump.** Taking a blocking exclusive lock in `weaverWndProc` would stall the Win32 message pump for the duration of a `weave()` frame — potentially 16 ms at 60 fps. This can cause input lag, `WM_TIMER` starvation, and system-level "Not Responding" detection. A `TryAcquireSRWLockExclusive` (or `std::unique_lock` with `std::try_to_lock`) that defers the work or sets a flag on failure would avoid blocking the message thread.
>
> 4. **`m_windowData.moving` should be `std::atomic<bool>`.** This flag is written by `weaverWndProc` on the message thread and read by `weave()` on the render thread. Even without a mutex, it must be at least `std::atomic<bool>` (or use `InterlockedExchange`) for correctness under the C++ memory model. A plain `bool` accessed from two threads without synchronization is undefined behavior.

## Workaround in Monado

Since we cannot modify the SR SDK, the runtime implements a **WndProc sub-subclass wrapper** that serializes the SR SDK's `weaverWndProc` with all weaver API calls using the existing `leiasr_d3d11::mutex`.

**File:** `src/xrt/drivers/leiasr/leiasr_d3d11.cpp`

### How It Works

After `CreateDX11Weaver` installs the SR SDK's WndProc, the runtime installs its own wrapper on top:

```
WndProc chain (outermost → innermost):

  leiasr_d3d11_wndproc_wrapper    ← our wrapper (serializes with mutex)
    → SR SDK WndProcDispatcher    ← SR SDK's subclass
      → weaverWndProc             ← SR SDK's message handler
        → CallWindowProc          ← chains to app's original WndProc
    → app's original WndProc      ← fallback when try_lock fails
```

The wrapper uses `std::mutex::try_lock()` — the same mutex held by `leiasr_d3d11_weave()`, `leiasr_d3d11_set_input_texture()`, and all other render-thread weaver calls:

- **Lock acquired:** The render thread is idle. Call through to the SR SDK's WndProc normally (which chains to the app's WndProc).
- **Lock unavailable:** The render thread is inside `weave()` or another weaver call. Skip the SR WndProc entirely and forward directly to the app's original WndProc.

### Why try_lock Instead of lock

A blocking `lock()` in the WndProc would stall the Win32 message pump for the duration of a `weave()` frame (up to 16 ms at 60 fps). This causes:

- Input lag and missed `WM_TIMER` callbacks
- System "Not Responding" detection on prolonged stalls
- Potential deadlock if D3D11/DXGI sends a synchronous window message during `weave()` (e.g. `WM_WINDOWPOSCHANGING` during a fullscreen transition)

`try_lock()` avoids all of these. When it fails, the SR SDK misses one message. At 100+ Hz mouse messages, this is invisible. Even for lower-frequency messages like `WM_SIZE`, subsequent messages will update the SR SDK's state correctly.

### Setup and Teardown

**Create** (`leiasr_d3d11_create`):
1. Save the app's WndProc **before** `CreateDX11Weaver` (the SDK overwrites it)
2. Save the SR SDK's WndProc **after** `CreateDX11Weaver`
3. Install `leiasr_d3d11_wndproc_wrapper` via `SetWindowLongPtr`

**Destroy** (`leiasr_d3d11_destroy`):
1. Restore the SR SDK's WndProc (removing our wrapper)
2. Clear the global instance pointer
3. Call `weaver->destroy()` (SR SDK restores the app's original WndProc)

This preserves the correct subclass unwind order: our wrapper is removed first, then the SR SDK removes its own.

## Reproduction

1. Create an application that pumps Win32 messages on the main thread and calls `weave()` on a separate render thread
2. Click and drag inside the window (mouse-down, move, mouse-up)
3. Observe crash on mouse-up

The crash is highly reproducible with continuous mouse interaction during rendering.

## Related Issue

This is separate from the `WndProcDispatcher` use-after-free during weaver destruction (documented in `sr-sdk-race-condition-bug.md`). That bug involves the instance pointer becoming dangling after `weaver->destroy()`. This bug involves concurrent access to a live weaver instance.
