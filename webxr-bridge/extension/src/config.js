// Display and input configuration for Monado WebXR polyfill
// Phase 2: these values will be received from the native host via Native Messaging

const DEFAULT_CONFIG = {
  displayWidth: 1920,    // Total SBS width (pixels)
  displayHeight: 1080,   // Height (pixels)
  ipd: 0.063,            // Inter-pupillary distance (meters)
  fovY: Math.PI / 3,     // Vertical FOV (radians) — 60 degrees
  moveSpeed: 2.0,        // Camera movement speed (m/s)
  lookSpeed: 0.002,      // Mouse look sensitivity (rad/pixel)
  eyeHeight: 1.6,        // Default eye height (meters)
};

const config = { ...DEFAULT_CONFIG };

export function getMonadoConfig() {
  return config;
}

export function updateMonadoConfig(updates) {
  Object.assign(config, updates);
}
