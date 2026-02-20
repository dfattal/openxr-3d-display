// Monado WebXR Bridge — Entry point
// Installs the WebXR polyfill with MonadoXRDevice, overriding Chrome's
// native navigator.xr (which doesn't support immersive-vr on macOS).

import WebXRPolyfill from 'webxr-polyfill/src/WebXRPolyfill';
import XRSystem from 'webxr-polyfill/src/api/XRSystem';
import MonadoXRDevice from './MonadoXRDevice';
import MonadoXRWebGLLayer from './MonadoXRWebGLLayer';

// Install base polyfill to register XR API classes
const polyfill = new WebXRPolyfill({ allowNativePolyfill: true });

// Create our custom device
const device = new MonadoXRDevice(window);

// Override navigator.xr with our device (replaces Chrome's native XR
// which returns false for isSessionSupported('immersive-vr') on macOS)
const xr = new XRSystem(Promise.resolve(device));
Object.defineProperty(navigator, 'xr', {
  value: xr,
  configurable: true,
});

// Override XRWebGLLayer so apps create our custom layer with SBS FBO
window.XRWebGLLayer = MonadoXRWebGLLayer;

console.log('Monado WebXR Bridge: polyfill installed (Phase 1 — SBS output)');
