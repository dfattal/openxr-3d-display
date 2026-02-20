// MonadoXRDevice — Custom XRDevice for the Monado WebXR polyfill
// Provides stereo rendering with WASD/mouse camera controls
// Phase 1: SBS output on screen. Phase 2: frames sent to native host.

import XRDevice from 'webxr-polyfill/src/devices/XRDevice';
import { mat4, vec3 } from 'gl-matrix';
import { getMonadoConfig } from './config';

export default class MonadoXRDevice extends XRDevice {
  constructor(global) {
    super(global);

    this.sessions = new Map();
    this.nextSessionId = 1;

    // Camera state
    const config = getMonadoConfig();
    this.position = vec3.fromValues(0, config.eyeHeight, 0);
    this.yaw = 0;
    this.pitch = 0;

    // Input state
    this.keys = {};
    this.pointerLocked = false;
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;

    // Timing
    this._lastFrameTime = 0;

    // Pre-allocated matrices
    this.basePoseMatrix = mat4.create();
    this.leftViewMatrix = mat4.create();
    this.rightViewMatrix = mat4.create();
    this.leftProjectionMatrix = mat4.create();
    this.rightProjectionMatrix = mat4.create();

    this._setupInputListeners(global);
  }

  _setupInputListeners(global) {
    global.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });
    global.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Use pointer lock for mouse look (activated by clicking the canvas)
    global.document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = !!global.document.pointerLockElement;
    });
    global.addEventListener('mousemove', (e) => {
      if (this.pointerLocked) {
        this.mouseDeltaX += e.movementX;
        this.mouseDeltaY += e.movementY;
      }
    });
    // Click canvas to activate pointer lock during immersive session
    global.addEventListener('click', () => {
      if (this._hasImmersiveSession() && !this.pointerLocked) {
        const canvas = global.document.querySelector('canvas');
        if (canvas) {
          canvas.requestPointerLock();
        }
      }
    });
  }

  _hasImmersiveSession() {
    for (const session of this.sessions.values()) {
      if (session.immersive) return true;
    }
    return false;
  }

  _updateCamera(dt) {
    const config = getMonadoConfig();

    // Mouse look
    if (this.mouseDeltaX !== 0 || this.mouseDeltaY !== 0) {
      this.yaw -= this.mouseDeltaX * config.lookSpeed;
      this.pitch -= this.mouseDeltaY * config.lookSpeed;
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
      this.mouseDeltaX = 0;
      this.mouseDeltaY = 0;
    }

    // WASD movement in viewer-local frame
    const moveSpeed = config.moveSpeed * dt;
    const forward = vec3.fromValues(
      -Math.sin(this.yaw),
      0,
      -Math.cos(this.yaw)
    );
    const right = vec3.fromValues(
      Math.cos(this.yaw),
      0,
      -Math.sin(this.yaw)
    );

    if (this.keys['KeyW']) vec3.scaleAndAdd(this.position, this.position, forward, moveSpeed);
    if (this.keys['KeyS']) vec3.scaleAndAdd(this.position, this.position, forward, -moveSpeed);
    if (this.keys['KeyD']) vec3.scaleAndAdd(this.position, this.position, right, moveSpeed);
    if (this.keys['KeyA']) vec3.scaleAndAdd(this.position, this.position, right, -moveSpeed);
    if (this.keys['Space']) this.position[1] += moveSpeed;
    if (this.keys['ShiftLeft']) this.position[1] -= moveSpeed;
  }

  _computeMatrices(renderState) {
    const config = getMonadoConfig();
    const near = renderState.depthNear;
    const far = renderState.depthFar;
    const aspect = (config.displayWidth / 2) / config.displayHeight;

    // Base pose matrix (viewer world-space transform)
    mat4.identity(this.basePoseMatrix);
    mat4.translate(this.basePoseMatrix, this.basePoseMatrix, this.position);
    mat4.rotateY(this.basePoseMatrix, this.basePoseMatrix, this.yaw);
    mat4.rotateX(this.basePoseMatrix, this.basePoseMatrix, this.pitch);

    // Left eye: offset -IPD/2 in viewer-local X, then invert for view matrix
    const leftEyeWorld = mat4.create();
    mat4.translate(leftEyeWorld, this.basePoseMatrix, [-config.ipd / 2, 0, 0]);
    mat4.invert(this.leftViewMatrix, leftEyeWorld);

    // Right eye: offset +IPD/2 in viewer-local X, then invert for view matrix
    const rightEyeWorld = mat4.create();
    mat4.translate(rightEyeWorld, this.basePoseMatrix, [config.ipd / 2, 0, 0]);
    mat4.invert(this.rightViewMatrix, rightEyeWorld);

    // Symmetric perspective projection (Phase 1)
    // Phase 2: Kooima off-axis frustum using display geometry from native host
    mat4.perspective(this.leftProjectionMatrix, config.fovY, aspect, near, far);
    mat4.copy(this.rightProjectionMatrix, this.leftProjectionMatrix);
  }

  // --- XRDevice interface ---

  isSessionSupported(mode) {
    return mode === 'inline' || mode === 'immersive-vr';
  }

  isFeatureSupported(featureDescriptor) {
    return ['viewer', 'local', 'local-floor'].includes(featureDescriptor);
  }

  async requestSession(mode, enabledFeatures) {
    const sessionId = this.nextSessionId++;

    if (mode === 'immersive-vr') {
      const canvas = this.global.document.querySelector('canvas');
      if (canvas) {
        try {
          await canvas.requestFullscreen();
        } catch (e) {
          console.warn('MonadoXR: Could not enter fullscreen:', e);
        }
      }
    }

    this.sessions.set(sessionId, {
      mode,
      enabledFeatures: new Set(enabledFeatures),
      immersive: mode === 'immersive-vr',
      baseLayer: null,
      originalCanvasWidth: 0,
      originalCanvasHeight: 0,
    });

    this.dispatchEvent('@@webxr-polyfill/vr-present-start', { sessionId });
    return sessionId;
  }

  endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    if (session.immersive) {
      // Restore canvas size
      if (session.baseLayer) {
        const canvas = session.baseLayer.context.canvas;
        canvas.width = session.originalCanvasWidth;
        canvas.height = session.originalCanvasHeight;
      }
      // Exit fullscreen
      if (this.global.document.fullscreenElement) {
        this.global.document.exitFullscreen().catch(() => {});
      }
      // Release pointer lock
      if (this.pointerLocked) {
        this.global.document.exitPointerLock();
      }
    }

    this.sessions.delete(sessionId);
    this.dispatchEvent('@@webxr-polyfill/vr-present-end', { sessionId });
  }

  doesSessionSupportReferenceSpace(sessionId, type) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    return session.enabledFeatures.has(type);
  }

  onBaseLayerSet(sessionId, layer) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.baseLayer = layer;

    if (session.immersive && layer.monadoSetImmersive) {
      const config = getMonadoConfig();
      const canvas = layer.context.canvas;
      session.originalCanvasWidth = canvas.width;
      session.originalCanvasHeight = canvas.height;
      canvas.width = config.displayWidth;
      canvas.height = config.displayHeight;
      layer.monadoSetImmersive(true);
    }
  }

  requestAnimationFrame(callback) {
    return this.global.requestAnimationFrame(callback);
  }

  cancelAnimationFrame(handle) {
    this.global.cancelAnimationFrame(handle);
  }

  onFrameStart(sessionId, renderState) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.immersive) return;

    const now = performance.now() / 1000;
    const dt = this._lastFrameTime > 0 ? Math.min(now - this._lastFrameTime, 0.1) : 1 / 60;
    this._lastFrameTime = now;

    this._updateCamera(dt);
    this._computeMatrices(renderState);
  }

  onFrameEnd(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.immersive || !session.baseLayer) return;

    // Phase 1: blit SBS FBO to canvas
    // Phase 2: also send frame data over WebSocket to native host
    if (session.baseLayer.monadoBlitToScreen) {
      session.baseLayer.monadoBlitToScreen();
    }
  }

  getBasePoseMatrix() {
    return this.basePoseMatrix;
  }

  getBaseViewMatrix(eye) {
    if (eye === 'right') return this.rightViewMatrix;
    return this.leftViewMatrix;
  }

  getProjectionMatrix(eye) {
    if (eye === 'right') return this.rightProjectionMatrix;
    return this.leftProjectionMatrix;
  }

  getViewport(sessionId, eye, layer, target) {
    const config = getMonadoConfig();
    const halfWidth = Math.floor(config.displayWidth / 2);

    if (eye === 'right') {
      target.x = halfWidth;
      target.y = 0;
      target.width = halfWidth;
      target.height = config.displayHeight;
    } else {
      target.x = 0;
      target.y = 0;
      target.width = halfWidth;
      target.height = config.displayHeight;
    }
    return true;
  }

  getInputSources() {
    return [];
  }

  getInputPose() {
    return null;
  }

  onWindowResize() {
    // Override to prevent base class infinite recursion
  }

  async requestFrameOfReferenceTransform(type) {
    const matrix = mat4.create();
    switch (type) {
      case 'viewer':
      case 'local': {
        const config = getMonadoConfig();
        mat4.fromTranslation(matrix, [0, -config.eyeHeight, 0]);
        return matrix;
      }
      case 'local-floor':
        return matrix; // identity — origin on the floor
      default:
        throw new Error('XRReferenceSpaceType not supported: ' + type);
    }
  }
}
