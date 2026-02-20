// MonadoXRWebGLLayer — Custom WebGL layer with SBS stereo FBO
// Creates an offscreen framebuffer at display resolution.
// The app renders left/right eyes into the left/right halves.
// On frame end, blits the FBO to the canvas (SBS output for Phase 1).

import XRWebGLLayer from 'webxr-polyfill/src/api/XRWebGLLayer';
import { getMonadoConfig } from './config';

const MONADO_PRIVATE = Symbol('MonadoXRWebGLLayer');

export default class MonadoXRWebGLLayer extends XRWebGLLayer {
  constructor(session, gl, layerInit) {
    super(session, gl, layerInit);

    const config = getMonadoConfig();

    this[MONADO_PRIVATE] = {
      gl,
      immersive: false,
      width: config.displayWidth,
      height: config.displayHeight,
      framebuffer: null,
      texture: null,
      depthStencil: null,
    };

    this._createFBO(gl, config);
  }

  _createFBO(gl, config) {
    const priv = this[MONADO_PRIVATE];

    // Save current GL state
    const prevFBO = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    const prevTex = gl.getParameter(gl.TEXTURE_BINDING_2D);
    const prevRBO = gl.getParameter(gl.RENDERBUFFER_BINDING);

    // Color texture
    priv.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, priv.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
      priv.width, priv.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Depth/stencil renderbuffer
    priv.depthStencil = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, priv.depthStencil);
    const isWebGL2 = typeof WebGL2RenderingContext !== 'undefined'
      && gl instanceof WebGL2RenderingContext;
    const depthFormat = isWebGL2 ? gl.DEPTH24_STENCIL8 : gl.DEPTH_STENCIL;
    gl.renderbufferStorage(gl.RENDERBUFFER, depthFormat, priv.width, priv.height);

    // Framebuffer
    priv.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, priv.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D, priv.texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT,
      gl.RENDERBUFFER, priv.depthStencil);

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.error('MonadoXR: Framebuffer incomplete, status:', status);
    }

    // Restore GL state
    gl.bindFramebuffer(gl.FRAMEBUFFER, prevFBO);
    gl.bindTexture(gl.TEXTURE_2D, prevTex);
    gl.bindRenderbuffer(gl.RENDERBUFFER, prevRBO);
  }

  get framebuffer() {
    const priv = this[MONADO_PRIVATE];
    if (priv && priv.immersive) {
      return priv.framebuffer;
    }
    return super.framebuffer;
  }

  get framebufferWidth() {
    const priv = this[MONADO_PRIVATE];
    if (priv && priv.immersive) {
      return priv.width;
    }
    return super.framebufferWidth;
  }

  get framebufferHeight() {
    const priv = this[MONADO_PRIVATE];
    if (priv && priv.immersive) {
      return priv.height;
    }
    return super.framebufferHeight;
  }

  monadoSetImmersive(enabled) {
    this[MONADO_PRIVATE].immersive = enabled;
  }

  monadoBlitToScreen() {
    const priv = this[MONADO_PRIVATE];
    if (!priv.immersive) return;

    const gl = priv.gl;
    const canvas = gl.canvas;
    const isWebGL2 = typeof WebGL2RenderingContext !== 'undefined'
      && gl instanceof WebGL2RenderingContext;

    if (isWebGL2) {
      this._blitWebGL2(gl, priv, canvas);
    } else {
      this._blitWebGL1(gl, priv, canvas);
    }
  }

  _blitWebGL2(gl, priv, canvas) {
    const prevReadFBO = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING);
    const prevDrawFBO = gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING);

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, priv.framebuffer);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.blitFramebuffer(
      0, 0, priv.width, priv.height,
      0, 0, canvas.width, canvas.height,
      gl.COLOR_BUFFER_BIT, gl.LINEAR
    );

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, prevReadFBO);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, prevDrawFBO);
  }

  // WebGL 1 fallback: draw fullscreen textured quad
  _blitWebGL1(gl, priv, canvas) {
    if (!this._blitProgram) {
      this._initBlitShader(gl);
    }

    // Save state
    const prevProgram = gl.getParameter(gl.CURRENT_PROGRAM);
    const prevFBO = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    const prevActiveTexture = gl.getParameter(gl.ACTIVE_TEXTURE);
    const prevTex = gl.getParameter(gl.TEXTURE_BINDING_2D);
    const prevVP = gl.getParameter(gl.VIEWPORT);
    const prevArrayBuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
    const prevCull = gl.isEnabled(gl.CULL_FACE);
    const prevDepth = gl.isEnabled(gl.DEPTH_TEST);
    const prevBlend = gl.isEnabled(gl.BLEND);
    const prevScissor = gl.isEnabled(gl.SCISSOR_TEST);

    // Draw
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(this._blitProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, priv.texture);
    gl.uniform1i(this._blitTexLoc, 0);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.disable(gl.SCISSOR_TEST);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._blitVBO);
    gl.enableVertexAttribArray(this._blitPosLoc);
    gl.vertexAttribPointer(this._blitPosLoc, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Restore
    gl.useProgram(prevProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, prevFBO);
    gl.activeTexture(prevActiveTexture);
    gl.bindTexture(gl.TEXTURE_2D, prevTex);
    gl.viewport(prevVP[0], prevVP[1], prevVP[2], prevVP[3]);
    gl.bindBuffer(gl.ARRAY_BUFFER, prevArrayBuffer);
    if (prevCull) gl.enable(gl.CULL_FACE);
    if (prevDepth) gl.enable(gl.DEPTH_TEST);
    if (prevBlend) gl.enable(gl.BLEND);
    if (prevScissor) gl.enable(gl.SCISSOR_TEST);
  }

  _initBlitShader(gl) {
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, [
      'attribute vec2 a_position;',
      'varying vec2 v_texCoord;',
      'void main() {',
      '  gl_Position = vec4(a_position, 0.0, 1.0);',
      '  v_texCoord = a_position * 0.5 + 0.5;',
      '}',
    ].join('\n'));
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, [
      'precision mediump float;',
      'varying vec2 v_texCoord;',
      'uniform sampler2D u_texture;',
      'void main() {',
      '  gl_FragColor = texture2D(u_texture, v_texCoord);',
      '}',
    ].join('\n'));
    gl.compileShader(fs);

    this._blitProgram = gl.createProgram();
    gl.attachShader(this._blitProgram, vs);
    gl.attachShader(this._blitProgram, fs);
    gl.linkProgram(this._blitProgram);

    this._blitPosLoc = gl.getAttribLocation(this._blitProgram, 'a_position');
    this._blitTexLoc = gl.getUniformLocation(this._blitProgram, 'u_texture');

    this._blitVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._blitVBO);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW);

    gl.deleteShader(vs);
    gl.deleteShader(fs);
  }
}
