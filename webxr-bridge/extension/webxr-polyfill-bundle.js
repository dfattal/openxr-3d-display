(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/cardboard-vr-display/dist/cardboard-vr-display.js
  var require_cardboard_vr_display = __commonJS({
    "node_modules/cardboard-vr-display/dist/cardboard-vr-display.js"(exports, module) {
      (function(global2, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : global2.CardboardVRDisplay = factory();
      })(exports, function() {
        "use strict";
        var asyncGenerator = function() {
          function AwaitValue(value) {
            this.value = value;
          }
          function AsyncGenerator(gen) {
            var front, back;
            function send(key, arg) {
              return new Promise(function(resolve, reject) {
                var request = {
                  key,
                  arg,
                  resolve,
                  reject,
                  next: null
                };
                if (back) {
                  back = back.next = request;
                } else {
                  front = back = request;
                  resume(key, arg);
                }
              });
            }
            function resume(key, arg) {
              try {
                var result = gen[key](arg);
                var value = result.value;
                if (value instanceof AwaitValue) {
                  Promise.resolve(value.value).then(function(arg2) {
                    resume("next", arg2);
                  }, function(arg2) {
                    resume("throw", arg2);
                  });
                } else {
                  settle(result.done ? "return" : "normal", result.value);
                }
              } catch (err) {
                settle("throw", err);
              }
            }
            function settle(type, value) {
              switch (type) {
                case "return":
                  front.resolve({
                    value,
                    done: true
                  });
                  break;
                case "throw":
                  front.reject(value);
                  break;
                default:
                  front.resolve({
                    value,
                    done: false
                  });
                  break;
              }
              front = front.next;
              if (front) {
                resume(front.key, front.arg);
              } else {
                back = null;
              }
            }
            this._invoke = send;
            if (typeof gen.return !== "function") {
              this.return = void 0;
            }
          }
          if (typeof Symbol === "function" && Symbol.asyncIterator) {
            AsyncGenerator.prototype[Symbol.asyncIterator] = function() {
              return this;
            };
          }
          AsyncGenerator.prototype.next = function(arg) {
            return this._invoke("next", arg);
          };
          AsyncGenerator.prototype.throw = function(arg) {
            return this._invoke("throw", arg);
          };
          AsyncGenerator.prototype.return = function(arg) {
            return this._invoke("return", arg);
          };
          return {
            wrap: function(fn) {
              return function() {
                return new AsyncGenerator(fn.apply(this, arguments));
              };
            },
            await: function(value) {
              return new AwaitValue(value);
            }
          };
        }();
        var classCallCheck = function(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
          }
        };
        var createClass = /* @__PURE__ */ function() {
          function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor)
                descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
            }
          }
          return function(Constructor, protoProps, staticProps) {
            if (protoProps)
              defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
              defineProperties(Constructor, staticProps);
            return Constructor;
          };
        }();
        var slicedToArray = /* @__PURE__ */ function() {
          function sliceIterator(arr, i) {
            var _arr = [];
            var _n = true;
            var _d = false;
            var _e = void 0;
            try {
              for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);
                if (i && _arr.length === i)
                  break;
              }
            } catch (err) {
              _d = true;
              _e = err;
            } finally {
              try {
                if (!_n && _i["return"])
                  _i["return"]();
              } finally {
                if (_d)
                  throw _e;
              }
            }
            return _arr;
          }
          return function(arr, i) {
            if (Array.isArray(arr)) {
              return arr;
            } else if (Symbol.iterator in Object(arr)) {
              return sliceIterator(arr, i);
            } else {
              throw new TypeError("Invalid attempt to destructure non-iterable instance");
            }
          };
        }();
        var MIN_TIMESTEP = 1e-3;
        var MAX_TIMESTEP = 1;
        var dataUri = function dataUri2(mimeType, svg) {
          return "data:" + mimeType + "," + encodeURIComponent(svg);
        };
        var lerp3 = function lerp4(a, b, t) {
          return a + (b - a) * t;
        };
        var isIOS = function() {
          var isIOS2 = /iPad|iPhone|iPod/.test(navigator.platform);
          return function() {
            return isIOS2;
          };
        }();
        var isWebViewAndroid = function() {
          var isWebViewAndroid2 = navigator.userAgent.indexOf("Version") !== -1 && navigator.userAgent.indexOf("Android") !== -1 && navigator.userAgent.indexOf("Chrome") !== -1;
          return function() {
            return isWebViewAndroid2;
          };
        }();
        var isSafari = function() {
          var isSafari2 = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          return function() {
            return isSafari2;
          };
        }();
        var isFirefoxAndroid = function() {
          var isFirefoxAndroid2 = navigator.userAgent.indexOf("Firefox") !== -1 && navigator.userAgent.indexOf("Android") !== -1;
          return function() {
            return isFirefoxAndroid2;
          };
        }();
        var getChromeVersion = function() {
          var match = navigator.userAgent.match(/.*Chrome\/([0-9]+)/);
          var value = match ? parseInt(match[1], 10) : null;
          return function() {
            return value;
          };
        }();
        var isSafariWithoutDeviceMotion = function() {
          var value = false;
          value = isIOS() && isSafari() && navigator.userAgent.indexOf("13_4") !== -1;
          return function() {
            return value;
          };
        }();
        var isChromeWithoutDeviceMotion = function() {
          var value = false;
          if (getChromeVersion() === 65) {
            var match = navigator.userAgent.match(/.*Chrome\/([0-9\.]*)/);
            if (match) {
              var _match$1$split = match[1].split("."), _match$1$split2 = slicedToArray(_match$1$split, 4), major = _match$1$split2[0], minor = _match$1$split2[1], branch = _match$1$split2[2], build = _match$1$split2[3];
              value = parseInt(branch, 10) === 3325 && parseInt(build, 10) < 148;
            }
          }
          return function() {
            return value;
          };
        }();
        var isR7 = function() {
          var isR72 = navigator.userAgent.indexOf("R7 Build") !== -1;
          return function() {
            return isR72;
          };
        }();
        var isLandscapeMode = function isLandscapeMode2() {
          var rtn = window.orientation == 90 || window.orientation == -90;
          return isR7() ? !rtn : rtn;
        };
        var isTimestampDeltaValid = function isTimestampDeltaValid2(timestampDeltaS) {
          if (isNaN(timestampDeltaS)) {
            return false;
          }
          if (timestampDeltaS <= MIN_TIMESTEP) {
            return false;
          }
          if (timestampDeltaS > MAX_TIMESTEP) {
            return false;
          }
          return true;
        };
        var getScreenWidth = function getScreenWidth2() {
          return Math.max(window.screen.width, window.screen.height) * window.devicePixelRatio;
        };
        var getScreenHeight = function getScreenHeight2() {
          return Math.min(window.screen.width, window.screen.height) * window.devicePixelRatio;
        };
        var requestFullscreen = function requestFullscreen2(element) {
          if (isWebViewAndroid()) {
            return false;
          }
          if (element.requestFullscreen) {
            element.requestFullscreen();
          } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
          } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
          } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
          } else {
            return false;
          }
          return true;
        };
        var exitFullscreen = function exitFullscreen2() {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          } else {
            return false;
          }
          return true;
        };
        var getFullscreenElement = function getFullscreenElement2() {
          return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        };
        var linkProgram = function linkProgram2(gl, vertexSource, fragmentSource, attribLocationMap) {
          var vertexShader = gl.createShader(gl.VERTEX_SHADER);
          gl.shaderSource(vertexShader, vertexSource);
          gl.compileShader(vertexShader);
          var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
          gl.shaderSource(fragmentShader, fragmentSource);
          gl.compileShader(fragmentShader);
          var program = gl.createProgram();
          gl.attachShader(program, vertexShader);
          gl.attachShader(program, fragmentShader);
          for (var attribName in attribLocationMap) {
            gl.bindAttribLocation(program, attribLocationMap[attribName], attribName);
          }
          gl.linkProgram(program);
          gl.deleteShader(vertexShader);
          gl.deleteShader(fragmentShader);
          return program;
        };
        var getProgramUniforms = function getProgramUniforms2(gl, program) {
          var uniforms = {};
          var uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
          var uniformName = "";
          for (var i = 0; i < uniformCount; i++) {
            var uniformInfo = gl.getActiveUniform(program, i);
            uniformName = uniformInfo.name.replace("[0]", "");
            uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
          }
          return uniforms;
        };
        var orthoMatrix = function orthoMatrix2(out, left, right, bottom, top, near, far) {
          var lr = 1 / (left - right), bt = 1 / (bottom - top), nf = 1 / (near - far);
          out[0] = -2 * lr;
          out[1] = 0;
          out[2] = 0;
          out[3] = 0;
          out[4] = 0;
          out[5] = -2 * bt;
          out[6] = 0;
          out[7] = 0;
          out[8] = 0;
          out[9] = 0;
          out[10] = 2 * nf;
          out[11] = 0;
          out[12] = (left + right) * lr;
          out[13] = (top + bottom) * bt;
          out[14] = (far + near) * nf;
          out[15] = 1;
          return out;
        };
        var isMobile2 = function isMobile3() {
          var check = false;
          (function(a) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
              check = true;
          })(navigator.userAgent || navigator.vendor || window.opera);
          return check;
        };
        var extend = function extend2(dest, src) {
          for (var key in src) {
            if (src.hasOwnProperty(key)) {
              dest[key] = src[key];
            }
          }
          return dest;
        };
        var safariCssSizeWorkaround = function safariCssSizeWorkaround2(canvas) {
          if (isIOS()) {
            var width = canvas.style.width;
            var height = canvas.style.height;
            canvas.style.width = parseInt(width) + 1 + "px";
            canvas.style.height = parseInt(height) + "px";
            setTimeout(function() {
              canvas.style.width = width;
              canvas.style.height = height;
            }, 100);
          }
          window.canvas = canvas;
        };
        var frameDataFromPose = function() {
          var piOver180 = Math.PI / 180;
          var rad45 = Math.PI * 0.25;
          function mat4_perspectiveFromFieldOfView(out, fov, near, far) {
            var upTan = Math.tan(fov ? fov.upDegrees * piOver180 : rad45), downTan = Math.tan(fov ? fov.downDegrees * piOver180 : rad45), leftTan = Math.tan(fov ? fov.leftDegrees * piOver180 : rad45), rightTan = Math.tan(fov ? fov.rightDegrees * piOver180 : rad45), xScale = 2 / (leftTan + rightTan), yScale = 2 / (upTan + downTan);
            out[0] = xScale;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = yScale;
            out[6] = 0;
            out[7] = 0;
            out[8] = -((leftTan - rightTan) * xScale * 0.5);
            out[9] = (upTan - downTan) * yScale * 0.5;
            out[10] = far / (near - far);
            out[11] = -1;
            out[12] = 0;
            out[13] = 0;
            out[14] = far * near / (near - far);
            out[15] = 0;
            return out;
          }
          function mat4_fromRotationTranslation(out, q, v) {
            var x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
            out[0] = 1 - (yy + zz);
            out[1] = xy + wz;
            out[2] = xz - wy;
            out[3] = 0;
            out[4] = xy - wz;
            out[5] = 1 - (xx + zz);
            out[6] = yz + wx;
            out[7] = 0;
            out[8] = xz + wy;
            out[9] = yz - wx;
            out[10] = 1 - (xx + yy);
            out[11] = 0;
            out[12] = v[0];
            out[13] = v[1];
            out[14] = v[2];
            out[15] = 1;
            return out;
          }
          function mat4_translate(out, a, v) {
            var x = v[0], y = v[1], z = v[2], a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23;
            if (a === out) {
              out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
              out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
              out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
              out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
            } else {
              a00 = a[0];
              a01 = a[1];
              a02 = a[2];
              a03 = a[3];
              a10 = a[4];
              a11 = a[5];
              a12 = a[6];
              a13 = a[7];
              a20 = a[8];
              a21 = a[9];
              a22 = a[10];
              a23 = a[11];
              out[0] = a00;
              out[1] = a01;
              out[2] = a02;
              out[3] = a03;
              out[4] = a10;
              out[5] = a11;
              out[6] = a12;
              out[7] = a13;
              out[8] = a20;
              out[9] = a21;
              out[10] = a22;
              out[11] = a23;
              out[12] = a00 * x + a10 * y + a20 * z + a[12];
              out[13] = a01 * x + a11 * y + a21 * z + a[13];
              out[14] = a02 * x + a12 * y + a22 * z + a[14];
              out[15] = a03 * x + a13 * y + a23 * z + a[15];
            }
            return out;
          }
          function mat4_invert(out, a) {
            var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32, det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
            if (!det) {
              return null;
            }
            det = 1 / det;
            out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
            out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
            out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
            out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
            out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
            out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
            out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
            out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
            out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
            out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
            out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
            out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
            out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
            out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
            out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
            out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
            return out;
          }
          var defaultOrientation = new Float32Array([0, 0, 0, 1]);
          var defaultPosition = new Float32Array([0, 0, 0]);
          function updateEyeMatrices(projection, view, pose, fov, offset, vrDisplay) {
            mat4_perspectiveFromFieldOfView(projection, fov || null, vrDisplay.depthNear, vrDisplay.depthFar);
            var orientation = pose.orientation || defaultOrientation;
            var position = pose.position || defaultPosition;
            mat4_fromRotationTranslation(view, orientation, position);
            if (offset)
              mat4_translate(view, view, offset);
            mat4_invert(view, view);
          }
          return function(frameData, pose, vrDisplay) {
            if (!frameData || !pose)
              return false;
            frameData.pose = pose;
            frameData.timestamp = pose.timestamp;
            updateEyeMatrices(frameData.leftProjectionMatrix, frameData.leftViewMatrix, pose, vrDisplay._getFieldOfView("left"), vrDisplay._getEyeOffset("left"), vrDisplay);
            updateEyeMatrices(frameData.rightProjectionMatrix, frameData.rightViewMatrix, pose, vrDisplay._getFieldOfView("right"), vrDisplay._getEyeOffset("right"), vrDisplay);
            return true;
          };
        }();
        var isInsideCrossOriginIFrame = function isInsideCrossOriginIFrame2() {
          var isFramed = window.self !== window.top;
          var refOrigin = getOriginFromUrl(document.referrer);
          var thisOrigin = getOriginFromUrl(window.location.href);
          return isFramed && refOrigin !== thisOrigin;
        };
        var getOriginFromUrl = function getOriginFromUrl2(url) {
          var domainIdx;
          var protoSepIdx = url.indexOf("://");
          if (protoSepIdx !== -1) {
            domainIdx = protoSepIdx + 3;
          } else {
            domainIdx = 0;
          }
          var domainEndIdx = url.indexOf("/", domainIdx);
          if (domainEndIdx === -1) {
            domainEndIdx = url.length;
          }
          return url.substring(0, domainEndIdx);
        };
        var getQuaternionAngle = function getQuaternionAngle2(quat) {
          if (quat.w > 1) {
            console.warn("getQuaternionAngle: w > 1");
            return 0;
          }
          var angle3 = 2 * Math.acos(quat.w);
          return angle3;
        };
        var warnOnce = /* @__PURE__ */ function() {
          var observedWarnings = {};
          return function(key, message) {
            if (observedWarnings[key] === void 0) {
              console.warn("webvr-polyfill: " + message);
              observedWarnings[key] = true;
            }
          };
        }();
        var deprecateWarning = function deprecateWarning2(deprecated, suggested) {
          var alternative = suggested ? "Please use " + suggested + " instead." : "";
          warnOnce(deprecated, deprecated + " has been deprecated. This may not work on native WebVR displays. " + alternative);
        };
        function WGLUPreserveGLState(gl, bindings, callback) {
          if (!bindings) {
            callback(gl);
            return;
          }
          var boundValues = [];
          var activeTexture = null;
          for (var i = 0; i < bindings.length; ++i) {
            var binding = bindings[i];
            switch (binding) {
              case gl.TEXTURE_BINDING_2D:
              case gl.TEXTURE_BINDING_CUBE_MAP:
                var textureUnit = bindings[++i];
                if (textureUnit < gl.TEXTURE0 || textureUnit > gl.TEXTURE31) {
                  console.error("TEXTURE_BINDING_2D or TEXTURE_BINDING_CUBE_MAP must be followed by a valid texture unit");
                  boundValues.push(null, null);
                  break;
                }
                if (!activeTexture) {
                  activeTexture = gl.getParameter(gl.ACTIVE_TEXTURE);
                }
                gl.activeTexture(textureUnit);
                boundValues.push(gl.getParameter(binding), null);
                break;
              case gl.ACTIVE_TEXTURE:
                activeTexture = gl.getParameter(gl.ACTIVE_TEXTURE);
                boundValues.push(null);
                break;
              default:
                boundValues.push(gl.getParameter(binding));
                break;
            }
          }
          callback(gl);
          for (var i = 0; i < bindings.length; ++i) {
            var binding = bindings[i];
            var boundValue = boundValues[i];
            switch (binding) {
              case gl.ACTIVE_TEXTURE:
                break;
              case gl.ARRAY_BUFFER_BINDING:
                gl.bindBuffer(gl.ARRAY_BUFFER, boundValue);
                break;
              case gl.COLOR_CLEAR_VALUE:
                gl.clearColor(boundValue[0], boundValue[1], boundValue[2], boundValue[3]);
                break;
              case gl.COLOR_WRITEMASK:
                gl.colorMask(boundValue[0], boundValue[1], boundValue[2], boundValue[3]);
                break;
              case gl.CURRENT_PROGRAM:
                gl.useProgram(boundValue);
                break;
              case gl.ELEMENT_ARRAY_BUFFER_BINDING:
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boundValue);
                break;
              case gl.FRAMEBUFFER_BINDING:
                gl.bindFramebuffer(gl.FRAMEBUFFER, boundValue);
                break;
              case gl.RENDERBUFFER_BINDING:
                gl.bindRenderbuffer(gl.RENDERBUFFER, boundValue);
                break;
              case gl.TEXTURE_BINDING_2D:
                var textureUnit = bindings[++i];
                if (textureUnit < gl.TEXTURE0 || textureUnit > gl.TEXTURE31)
                  break;
                gl.activeTexture(textureUnit);
                gl.bindTexture(gl.TEXTURE_2D, boundValue);
                break;
              case gl.TEXTURE_BINDING_CUBE_MAP:
                var textureUnit = bindings[++i];
                if (textureUnit < gl.TEXTURE0 || textureUnit > gl.TEXTURE31)
                  break;
                gl.activeTexture(textureUnit);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, boundValue);
                break;
              case gl.VIEWPORT:
                gl.viewport(boundValue[0], boundValue[1], boundValue[2], boundValue[3]);
                break;
              case gl.BLEND:
              case gl.CULL_FACE:
              case gl.DEPTH_TEST:
              case gl.SCISSOR_TEST:
              case gl.STENCIL_TEST:
                if (boundValue) {
                  gl.enable(binding);
                } else {
                  gl.disable(binding);
                }
                break;
              default:
                console.log("No GL restore behavior for 0x" + binding.toString(16));
                break;
            }
            if (activeTexture) {
              gl.activeTexture(activeTexture);
            }
          }
        }
        var glPreserveState = WGLUPreserveGLState;
        var distortionVS = ["attribute vec2 position;", "attribute vec3 texCoord;", "varying vec2 vTexCoord;", "uniform vec4 viewportOffsetScale[2];", "void main() {", "  vec4 viewport = viewportOffsetScale[int(texCoord.z)];", "  vTexCoord = (texCoord.xy * viewport.zw) + viewport.xy;", "  gl_Position = vec4( position, 1.0, 1.0 );", "}"].join("\n");
        var distortionFS = ["precision mediump float;", "uniform sampler2D diffuse;", "varying vec2 vTexCoord;", "void main() {", "  gl_FragColor = texture2D(diffuse, vTexCoord);", "}"].join("\n");
        function CardboardDistorter(gl, cardboardUI, bufferScale, dirtySubmitFrameBindings) {
          this.gl = gl;
          this.cardboardUI = cardboardUI;
          this.bufferScale = bufferScale;
          this.dirtySubmitFrameBindings = dirtySubmitFrameBindings;
          this.ctxAttribs = gl.getContextAttributes();
          this.instanceExt = gl.getExtension("ANGLE_instanced_arrays");
          this.meshWidth = 20;
          this.meshHeight = 20;
          this.bufferWidth = gl.drawingBufferWidth;
          this.bufferHeight = gl.drawingBufferHeight;
          this.realBindFramebuffer = gl.bindFramebuffer;
          this.realEnable = gl.enable;
          this.realDisable = gl.disable;
          this.realColorMask = gl.colorMask;
          this.realClearColor = gl.clearColor;
          this.realViewport = gl.viewport;
          if (!isIOS()) {
            this.realCanvasWidth = Object.getOwnPropertyDescriptor(gl.canvas.__proto__, "width");
            this.realCanvasHeight = Object.getOwnPropertyDescriptor(gl.canvas.__proto__, "height");
          }
          this.isPatched = false;
          this.lastBoundFramebuffer = null;
          this.cullFace = false;
          this.depthTest = false;
          this.blend = false;
          this.scissorTest = false;
          this.stencilTest = false;
          this.viewport = [0, 0, 0, 0];
          this.colorMask = [true, true, true, true];
          this.clearColor = [0, 0, 0, 0];
          this.attribs = {
            position: 0,
            texCoord: 1
          };
          this.program = linkProgram(gl, distortionVS, distortionFS, this.attribs);
          this.uniforms = getProgramUniforms(gl, this.program);
          this.viewportOffsetScale = new Float32Array(8);
          this.setTextureBounds();
          this.vertexBuffer = gl.createBuffer();
          this.indexBuffer = gl.createBuffer();
          this.indexCount = 0;
          this.renderTarget = gl.createTexture();
          this.framebuffer = gl.createFramebuffer();
          this.depthStencilBuffer = null;
          this.depthBuffer = null;
          this.stencilBuffer = null;
          if (this.ctxAttribs.depth && this.ctxAttribs.stencil) {
            this.depthStencilBuffer = gl.createRenderbuffer();
          } else if (this.ctxAttribs.depth) {
            this.depthBuffer = gl.createRenderbuffer();
          } else if (this.ctxAttribs.stencil) {
            this.stencilBuffer = gl.createRenderbuffer();
          }
          this.patch();
          this.onResize();
        }
        CardboardDistorter.prototype.destroy = function() {
          var gl = this.gl;
          this.unpatch();
          gl.deleteProgram(this.program);
          gl.deleteBuffer(this.vertexBuffer);
          gl.deleteBuffer(this.indexBuffer);
          gl.deleteTexture(this.renderTarget);
          gl.deleteFramebuffer(this.framebuffer);
          if (this.depthStencilBuffer) {
            gl.deleteRenderbuffer(this.depthStencilBuffer);
          }
          if (this.depthBuffer) {
            gl.deleteRenderbuffer(this.depthBuffer);
          }
          if (this.stencilBuffer) {
            gl.deleteRenderbuffer(this.stencilBuffer);
          }
          if (this.cardboardUI) {
            this.cardboardUI.destroy();
          }
        };
        CardboardDistorter.prototype.onResize = function() {
          var gl = this.gl;
          var self2 = this;
          var glState = [gl.RENDERBUFFER_BINDING, gl.TEXTURE_BINDING_2D, gl.TEXTURE0];
          glPreserveState(gl, glState, function(gl2) {
            self2.realBindFramebuffer.call(gl2, gl2.FRAMEBUFFER, null);
            if (self2.scissorTest) {
              self2.realDisable.call(gl2, gl2.SCISSOR_TEST);
            }
            self2.realColorMask.call(gl2, true, true, true, true);
            self2.realViewport.call(gl2, 0, 0, gl2.drawingBufferWidth, gl2.drawingBufferHeight);
            self2.realClearColor.call(gl2, 0, 0, 0, 1);
            gl2.clear(gl2.COLOR_BUFFER_BIT);
            self2.realBindFramebuffer.call(gl2, gl2.FRAMEBUFFER, self2.framebuffer);
            gl2.bindTexture(gl2.TEXTURE_2D, self2.renderTarget);
            gl2.texImage2D(gl2.TEXTURE_2D, 0, self2.ctxAttribs.alpha ? gl2.RGBA : gl2.RGB, self2.bufferWidth, self2.bufferHeight, 0, self2.ctxAttribs.alpha ? gl2.RGBA : gl2.RGB, gl2.UNSIGNED_BYTE, null);
            gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MAG_FILTER, gl2.LINEAR);
            gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MIN_FILTER, gl2.LINEAR);
            gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_S, gl2.CLAMP_TO_EDGE);
            gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_T, gl2.CLAMP_TO_EDGE);
            gl2.framebufferTexture2D(gl2.FRAMEBUFFER, gl2.COLOR_ATTACHMENT0, gl2.TEXTURE_2D, self2.renderTarget, 0);
            if (self2.ctxAttribs.depth && self2.ctxAttribs.stencil) {
              gl2.bindRenderbuffer(gl2.RENDERBUFFER, self2.depthStencilBuffer);
              gl2.renderbufferStorage(gl2.RENDERBUFFER, gl2.DEPTH_STENCIL, self2.bufferWidth, self2.bufferHeight);
              gl2.framebufferRenderbuffer(gl2.FRAMEBUFFER, gl2.DEPTH_STENCIL_ATTACHMENT, gl2.RENDERBUFFER, self2.depthStencilBuffer);
            } else if (self2.ctxAttribs.depth) {
              gl2.bindRenderbuffer(gl2.RENDERBUFFER, self2.depthBuffer);
              gl2.renderbufferStorage(gl2.RENDERBUFFER, gl2.DEPTH_COMPONENT16, self2.bufferWidth, self2.bufferHeight);
              gl2.framebufferRenderbuffer(gl2.FRAMEBUFFER, gl2.DEPTH_ATTACHMENT, gl2.RENDERBUFFER, self2.depthBuffer);
            } else if (self2.ctxAttribs.stencil) {
              gl2.bindRenderbuffer(gl2.RENDERBUFFER, self2.stencilBuffer);
              gl2.renderbufferStorage(gl2.RENDERBUFFER, gl2.STENCIL_INDEX8, self2.bufferWidth, self2.bufferHeight);
              gl2.framebufferRenderbuffer(gl2.FRAMEBUFFER, gl2.STENCIL_ATTACHMENT, gl2.RENDERBUFFER, self2.stencilBuffer);
            }
            if (!gl2.checkFramebufferStatus(gl2.FRAMEBUFFER) === gl2.FRAMEBUFFER_COMPLETE) {
              console.error("Framebuffer incomplete!");
            }
            self2.realBindFramebuffer.call(gl2, gl2.FRAMEBUFFER, self2.lastBoundFramebuffer);
            if (self2.scissorTest) {
              self2.realEnable.call(gl2, gl2.SCISSOR_TEST);
            }
            self2.realColorMask.apply(gl2, self2.colorMask);
            self2.realViewport.apply(gl2, self2.viewport);
            self2.realClearColor.apply(gl2, self2.clearColor);
          });
          if (this.cardboardUI) {
            this.cardboardUI.onResize();
          }
        };
        CardboardDistorter.prototype.patch = function() {
          if (this.isPatched) {
            return;
          }
          var self2 = this;
          var canvas = this.gl.canvas;
          var gl = this.gl;
          if (!isIOS()) {
            canvas.width = getScreenWidth() * this.bufferScale;
            canvas.height = getScreenHeight() * this.bufferScale;
            Object.defineProperty(canvas, "width", {
              configurable: true,
              enumerable: true,
              get: function get() {
                return self2.bufferWidth;
              },
              set: function set4(value) {
                self2.bufferWidth = value;
                self2.realCanvasWidth.set.call(canvas, value);
                self2.onResize();
              }
            });
            Object.defineProperty(canvas, "height", {
              configurable: true,
              enumerable: true,
              get: function get() {
                return self2.bufferHeight;
              },
              set: function set4(value) {
                self2.bufferHeight = value;
                self2.realCanvasHeight.set.call(canvas, value);
                self2.onResize();
              }
            });
          }
          this.lastBoundFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
          if (this.lastBoundFramebuffer == null) {
            this.lastBoundFramebuffer = this.framebuffer;
            this.gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
          }
          this.gl.bindFramebuffer = function(target, framebuffer) {
            self2.lastBoundFramebuffer = framebuffer ? framebuffer : self2.framebuffer;
            self2.realBindFramebuffer.call(gl, target, self2.lastBoundFramebuffer);
          };
          this.cullFace = gl.getParameter(gl.CULL_FACE);
          this.depthTest = gl.getParameter(gl.DEPTH_TEST);
          this.blend = gl.getParameter(gl.BLEND);
          this.scissorTest = gl.getParameter(gl.SCISSOR_TEST);
          this.stencilTest = gl.getParameter(gl.STENCIL_TEST);
          gl.enable = function(pname) {
            switch (pname) {
              case gl.CULL_FACE:
                self2.cullFace = true;
                break;
              case gl.DEPTH_TEST:
                self2.depthTest = true;
                break;
              case gl.BLEND:
                self2.blend = true;
                break;
              case gl.SCISSOR_TEST:
                self2.scissorTest = true;
                break;
              case gl.STENCIL_TEST:
                self2.stencilTest = true;
                break;
            }
            self2.realEnable.call(gl, pname);
          };
          gl.disable = function(pname) {
            switch (pname) {
              case gl.CULL_FACE:
                self2.cullFace = false;
                break;
              case gl.DEPTH_TEST:
                self2.depthTest = false;
                break;
              case gl.BLEND:
                self2.blend = false;
                break;
              case gl.SCISSOR_TEST:
                self2.scissorTest = false;
                break;
              case gl.STENCIL_TEST:
                self2.stencilTest = false;
                break;
            }
            self2.realDisable.call(gl, pname);
          };
          this.colorMask = gl.getParameter(gl.COLOR_WRITEMASK);
          gl.colorMask = function(r, g, b, a) {
            self2.colorMask[0] = r;
            self2.colorMask[1] = g;
            self2.colorMask[2] = b;
            self2.colorMask[3] = a;
            self2.realColorMask.call(gl, r, g, b, a);
          };
          this.clearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
          gl.clearColor = function(r, g, b, a) {
            self2.clearColor[0] = r;
            self2.clearColor[1] = g;
            self2.clearColor[2] = b;
            self2.clearColor[3] = a;
            self2.realClearColor.call(gl, r, g, b, a);
          };
          this.viewport = gl.getParameter(gl.VIEWPORT);
          gl.viewport = function(x, y, w, h) {
            self2.viewport[0] = x;
            self2.viewport[1] = y;
            self2.viewport[2] = w;
            self2.viewport[3] = h;
            self2.realViewport.call(gl, x, y, w, h);
          };
          this.isPatched = true;
          safariCssSizeWorkaround(canvas);
        };
        CardboardDistorter.prototype.unpatch = function() {
          if (!this.isPatched) {
            return;
          }
          var gl = this.gl;
          var canvas = this.gl.canvas;
          if (!isIOS()) {
            Object.defineProperty(canvas, "width", this.realCanvasWidth);
            Object.defineProperty(canvas, "height", this.realCanvasHeight);
          }
          canvas.width = this.bufferWidth;
          canvas.height = this.bufferHeight;
          gl.bindFramebuffer = this.realBindFramebuffer;
          gl.enable = this.realEnable;
          gl.disable = this.realDisable;
          gl.colorMask = this.realColorMask;
          gl.clearColor = this.realClearColor;
          gl.viewport = this.realViewport;
          if (this.lastBoundFramebuffer == this.framebuffer) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          }
          this.isPatched = false;
          setTimeout(function() {
            safariCssSizeWorkaround(canvas);
          }, 1);
        };
        CardboardDistorter.prototype.setTextureBounds = function(leftBounds, rightBounds) {
          if (!leftBounds) {
            leftBounds = [0, 0, 0.5, 1];
          }
          if (!rightBounds) {
            rightBounds = [0.5, 0, 0.5, 1];
          }
          this.viewportOffsetScale[0] = leftBounds[0];
          this.viewportOffsetScale[1] = leftBounds[1];
          this.viewportOffsetScale[2] = leftBounds[2];
          this.viewportOffsetScale[3] = leftBounds[3];
          this.viewportOffsetScale[4] = rightBounds[0];
          this.viewportOffsetScale[5] = rightBounds[1];
          this.viewportOffsetScale[6] = rightBounds[2];
          this.viewportOffsetScale[7] = rightBounds[3];
        };
        CardboardDistorter.prototype.submitFrame = function() {
          var gl = this.gl;
          var self2 = this;
          var glState = [];
          if (!this.dirtySubmitFrameBindings) {
            glState.push(gl.CURRENT_PROGRAM, gl.ARRAY_BUFFER_BINDING, gl.ELEMENT_ARRAY_BUFFER_BINDING, gl.TEXTURE_BINDING_2D, gl.TEXTURE0);
          }
          glPreserveState(gl, glState, function(gl2) {
            self2.realBindFramebuffer.call(gl2, gl2.FRAMEBUFFER, null);
            var positionDivisor = 0;
            var texCoordDivisor = 0;
            if (self2.instanceExt) {
              positionDivisor = gl2.getVertexAttrib(self2.attribs.position, self2.instanceExt.VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE);
              texCoordDivisor = gl2.getVertexAttrib(self2.attribs.texCoord, self2.instanceExt.VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE);
            }
            if (self2.cullFace) {
              self2.realDisable.call(gl2, gl2.CULL_FACE);
            }
            if (self2.depthTest) {
              self2.realDisable.call(gl2, gl2.DEPTH_TEST);
            }
            if (self2.blend) {
              self2.realDisable.call(gl2, gl2.BLEND);
            }
            if (self2.scissorTest) {
              self2.realDisable.call(gl2, gl2.SCISSOR_TEST);
            }
            if (self2.stencilTest) {
              self2.realDisable.call(gl2, gl2.STENCIL_TEST);
            }
            self2.realColorMask.call(gl2, true, true, true, true);
            self2.realViewport.call(gl2, 0, 0, gl2.drawingBufferWidth, gl2.drawingBufferHeight);
            if (self2.ctxAttribs.alpha || isIOS()) {
              self2.realClearColor.call(gl2, 0, 0, 0, 1);
              gl2.clear(gl2.COLOR_BUFFER_BIT);
            }
            gl2.useProgram(self2.program);
            gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, self2.indexBuffer);
            gl2.bindBuffer(gl2.ARRAY_BUFFER, self2.vertexBuffer);
            gl2.enableVertexAttribArray(self2.attribs.position);
            gl2.enableVertexAttribArray(self2.attribs.texCoord);
            gl2.vertexAttribPointer(self2.attribs.position, 2, gl2.FLOAT, false, 20, 0);
            gl2.vertexAttribPointer(self2.attribs.texCoord, 3, gl2.FLOAT, false, 20, 8);
            if (self2.instanceExt) {
              if (positionDivisor != 0) {
                self2.instanceExt.vertexAttribDivisorANGLE(self2.attribs.position, 0);
              }
              if (texCoordDivisor != 0) {
                self2.instanceExt.vertexAttribDivisorANGLE(self2.attribs.texCoord, 0);
              }
            }
            gl2.activeTexture(gl2.TEXTURE0);
            gl2.uniform1i(self2.uniforms.diffuse, 0);
            gl2.bindTexture(gl2.TEXTURE_2D, self2.renderTarget);
            gl2.uniform4fv(self2.uniforms.viewportOffsetScale, self2.viewportOffsetScale);
            gl2.drawElements(gl2.TRIANGLES, self2.indexCount, gl2.UNSIGNED_SHORT, 0);
            if (self2.cardboardUI) {
              self2.cardboardUI.renderNoState();
            }
            self2.realBindFramebuffer.call(self2.gl, gl2.FRAMEBUFFER, self2.framebuffer);
            if (!self2.ctxAttribs.preserveDrawingBuffer) {
              self2.realClearColor.call(gl2, 0, 0, 0, 0);
              gl2.clear(gl2.COLOR_BUFFER_BIT);
            }
            if (!self2.dirtySubmitFrameBindings) {
              self2.realBindFramebuffer.call(gl2, gl2.FRAMEBUFFER, self2.lastBoundFramebuffer);
            }
            if (self2.cullFace) {
              self2.realEnable.call(gl2, gl2.CULL_FACE);
            }
            if (self2.depthTest) {
              self2.realEnable.call(gl2, gl2.DEPTH_TEST);
            }
            if (self2.blend) {
              self2.realEnable.call(gl2, gl2.BLEND);
            }
            if (self2.scissorTest) {
              self2.realEnable.call(gl2, gl2.SCISSOR_TEST);
            }
            if (self2.stencilTest) {
              self2.realEnable.call(gl2, gl2.STENCIL_TEST);
            }
            self2.realColorMask.apply(gl2, self2.colorMask);
            self2.realViewport.apply(gl2, self2.viewport);
            if (self2.ctxAttribs.alpha || !self2.ctxAttribs.preserveDrawingBuffer) {
              self2.realClearColor.apply(gl2, self2.clearColor);
            }
            if (self2.instanceExt) {
              if (positionDivisor != 0) {
                self2.instanceExt.vertexAttribDivisorANGLE(self2.attribs.position, positionDivisor);
              }
              if (texCoordDivisor != 0) {
                self2.instanceExt.vertexAttribDivisorANGLE(self2.attribs.texCoord, texCoordDivisor);
              }
            }
          });
          if (isIOS()) {
            var canvas = gl.canvas;
            if (canvas.width != self2.bufferWidth || canvas.height != self2.bufferHeight) {
              self2.bufferWidth = canvas.width;
              self2.bufferHeight = canvas.height;
              self2.onResize();
            }
          }
        };
        CardboardDistorter.prototype.updateDeviceInfo = function(deviceInfo) {
          var gl = this.gl;
          var self2 = this;
          var glState = [gl.ARRAY_BUFFER_BINDING, gl.ELEMENT_ARRAY_BUFFER_BINDING];
          glPreserveState(gl, glState, function(gl2) {
            var vertices = self2.computeMeshVertices_(self2.meshWidth, self2.meshHeight, deviceInfo);
            gl2.bindBuffer(gl2.ARRAY_BUFFER, self2.vertexBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, vertices, gl2.STATIC_DRAW);
            if (!self2.indexCount) {
              var indices = self2.computeMeshIndices_(self2.meshWidth, self2.meshHeight);
              gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, self2.indexBuffer);
              gl2.bufferData(gl2.ELEMENT_ARRAY_BUFFER, indices, gl2.STATIC_DRAW);
              self2.indexCount = indices.length;
            }
          });
        };
        CardboardDistorter.prototype.computeMeshVertices_ = function(width, height, deviceInfo) {
          var vertices = new Float32Array(2 * width * height * 5);
          var lensFrustum = deviceInfo.getLeftEyeVisibleTanAngles();
          var noLensFrustum = deviceInfo.getLeftEyeNoLensTanAngles();
          var viewport = deviceInfo.getLeftEyeVisibleScreenRect(noLensFrustum);
          var vidx = 0;
          for (var e = 0; e < 2; e++) {
            for (var j = 0; j < height; j++) {
              for (var i = 0; i < width; i++, vidx++) {
                var u = i / (width - 1);
                var v = j / (height - 1);
                var s = u;
                var t = v;
                var x = lerp3(lensFrustum[0], lensFrustum[2], u);
                var y = lerp3(lensFrustum[3], lensFrustum[1], v);
                var d = Math.sqrt(x * x + y * y);
                var r = deviceInfo.distortion.distortInverse(d);
                var p = x * r / d;
                var q = y * r / d;
                u = (p - noLensFrustum[0]) / (noLensFrustum[2] - noLensFrustum[0]);
                v = (q - noLensFrustum[3]) / (noLensFrustum[1] - noLensFrustum[3]);
                u = (viewport.x + u * viewport.width - 0.5) * 2;
                v = (viewport.y + v * viewport.height - 0.5) * 2;
                vertices[vidx * 5 + 0] = u;
                vertices[vidx * 5 + 1] = v;
                vertices[vidx * 5 + 2] = s;
                vertices[vidx * 5 + 3] = t;
                vertices[vidx * 5 + 4] = e;
              }
            }
            var w = lensFrustum[2] - lensFrustum[0];
            lensFrustum[0] = -(w + lensFrustum[0]);
            lensFrustum[2] = w - lensFrustum[2];
            w = noLensFrustum[2] - noLensFrustum[0];
            noLensFrustum[0] = -(w + noLensFrustum[0]);
            noLensFrustum[2] = w - noLensFrustum[2];
            viewport.x = 1 - (viewport.x + viewport.width);
          }
          return vertices;
        };
        CardboardDistorter.prototype.computeMeshIndices_ = function(width, height) {
          var indices = new Uint16Array(2 * (width - 1) * (height - 1) * 6);
          var halfwidth = width / 2;
          var halfheight = height / 2;
          var vidx = 0;
          var iidx = 0;
          for (var e = 0; e < 2; e++) {
            for (var j = 0; j < height; j++) {
              for (var i = 0; i < width; i++, vidx++) {
                if (i == 0 || j == 0)
                  continue;
                if (i <= halfwidth == j <= halfheight) {
                  indices[iidx++] = vidx;
                  indices[iidx++] = vidx - width - 1;
                  indices[iidx++] = vidx - width;
                  indices[iidx++] = vidx - width - 1;
                  indices[iidx++] = vidx;
                  indices[iidx++] = vidx - 1;
                } else {
                  indices[iidx++] = vidx - 1;
                  indices[iidx++] = vidx - width;
                  indices[iidx++] = vidx;
                  indices[iidx++] = vidx - width;
                  indices[iidx++] = vidx - 1;
                  indices[iidx++] = vidx - width - 1;
                }
              }
            }
          }
          return indices;
        };
        CardboardDistorter.prototype.getOwnPropertyDescriptor_ = function(proto, attrName) {
          var descriptor = Object.getOwnPropertyDescriptor(proto, attrName);
          if (descriptor.get === void 0 || descriptor.set === void 0) {
            descriptor.configurable = true;
            descriptor.enumerable = true;
            descriptor.get = function() {
              return this.getAttribute(attrName);
            };
            descriptor.set = function(val) {
              this.setAttribute(attrName, val);
            };
          }
          return descriptor;
        };
        var uiVS = ["attribute vec2 position;", "uniform mat4 projectionMat;", "void main() {", "  gl_Position = projectionMat * vec4( position, -1.0, 1.0 );", "}"].join("\n");
        var uiFS = ["precision mediump float;", "uniform vec4 color;", "void main() {", "  gl_FragColor = color;", "}"].join("\n");
        var DEG2RAD = Math.PI / 180;
        var kAnglePerGearSection = 60;
        var kOuterRimEndAngle = 12;
        var kInnerRimBeginAngle = 20;
        var kOuterRadius = 1;
        var kMiddleRadius = 0.75;
        var kInnerRadius = 0.3125;
        var kCenterLineThicknessDp = 4;
        var kButtonWidthDp = 28;
        var kTouchSlopFactor = 1.5;
        function CardboardUI(gl) {
          this.gl = gl;
          this.attribs = {
            position: 0
          };
          this.program = linkProgram(gl, uiVS, uiFS, this.attribs);
          this.uniforms = getProgramUniforms(gl, this.program);
          this.vertexBuffer = gl.createBuffer();
          this.gearOffset = 0;
          this.gearVertexCount = 0;
          this.arrowOffset = 0;
          this.arrowVertexCount = 0;
          this.projMat = new Float32Array(16);
          this.listener = null;
          this.onResize();
        }
        CardboardUI.prototype.destroy = function() {
          var gl = this.gl;
          if (this.listener) {
            gl.canvas.removeEventListener("click", this.listener, false);
          }
          gl.deleteProgram(this.program);
          gl.deleteBuffer(this.vertexBuffer);
        };
        CardboardUI.prototype.listen = function(optionsCallback, backCallback) {
          var canvas = this.gl.canvas;
          this.listener = function(event) {
            var midline = canvas.clientWidth / 2;
            var buttonSize = kButtonWidthDp * kTouchSlopFactor;
            if (event.clientX > midline - buttonSize && event.clientX < midline + buttonSize && event.clientY > canvas.clientHeight - buttonSize) {
              optionsCallback(event);
            } else if (event.clientX < buttonSize && event.clientY < buttonSize) {
              backCallback(event);
            }
          };
          canvas.addEventListener("click", this.listener, false);
        };
        CardboardUI.prototype.onResize = function() {
          var gl = this.gl;
          var self2 = this;
          var glState = [gl.ARRAY_BUFFER_BINDING];
          glPreserveState(gl, glState, function(gl2) {
            var vertices = [];
            var midline = gl2.drawingBufferWidth / 2;
            var physicalPixels = Math.max(screen.width, screen.height) * window.devicePixelRatio;
            var scalingRatio = gl2.drawingBufferWidth / physicalPixels;
            var dps = scalingRatio * window.devicePixelRatio;
            var lineWidth = kCenterLineThicknessDp * dps / 2;
            var buttonSize = kButtonWidthDp * kTouchSlopFactor * dps;
            var buttonScale = kButtonWidthDp * dps / 2;
            var buttonBorder = (kButtonWidthDp * kTouchSlopFactor - kButtonWidthDp) * dps;
            vertices.push(midline - lineWidth, buttonSize);
            vertices.push(midline - lineWidth, gl2.drawingBufferHeight);
            vertices.push(midline + lineWidth, buttonSize);
            vertices.push(midline + lineWidth, gl2.drawingBufferHeight);
            self2.gearOffset = vertices.length / 2;
            function addGearSegment(theta, r) {
              var angle3 = (90 - theta) * DEG2RAD;
              var x = Math.cos(angle3);
              var y = Math.sin(angle3);
              vertices.push(kInnerRadius * x * buttonScale + midline, kInnerRadius * y * buttonScale + buttonScale);
              vertices.push(r * x * buttonScale + midline, r * y * buttonScale + buttonScale);
            }
            for (var i = 0; i <= 6; i++) {
              var segmentTheta = i * kAnglePerGearSection;
              addGearSegment(segmentTheta, kOuterRadius);
              addGearSegment(segmentTheta + kOuterRimEndAngle, kOuterRadius);
              addGearSegment(segmentTheta + kInnerRimBeginAngle, kMiddleRadius);
              addGearSegment(segmentTheta + (kAnglePerGearSection - kInnerRimBeginAngle), kMiddleRadius);
              addGearSegment(segmentTheta + (kAnglePerGearSection - kOuterRimEndAngle), kOuterRadius);
            }
            self2.gearVertexCount = vertices.length / 2 - self2.gearOffset;
            self2.arrowOffset = vertices.length / 2;
            function addArrowVertex(x, y) {
              vertices.push(buttonBorder + x, gl2.drawingBufferHeight - buttonBorder - y);
            }
            var angledLineWidth = lineWidth / Math.sin(45 * DEG2RAD);
            addArrowVertex(0, buttonScale);
            addArrowVertex(buttonScale, 0);
            addArrowVertex(buttonScale + angledLineWidth, angledLineWidth);
            addArrowVertex(angledLineWidth, buttonScale + angledLineWidth);
            addArrowVertex(angledLineWidth, buttonScale - angledLineWidth);
            addArrowVertex(0, buttonScale);
            addArrowVertex(buttonScale, buttonScale * 2);
            addArrowVertex(buttonScale + angledLineWidth, buttonScale * 2 - angledLineWidth);
            addArrowVertex(angledLineWidth, buttonScale - angledLineWidth);
            addArrowVertex(0, buttonScale);
            addArrowVertex(angledLineWidth, buttonScale - lineWidth);
            addArrowVertex(kButtonWidthDp * dps, buttonScale - lineWidth);
            addArrowVertex(angledLineWidth, buttonScale + lineWidth);
            addArrowVertex(kButtonWidthDp * dps, buttonScale + lineWidth);
            self2.arrowVertexCount = vertices.length / 2 - self2.arrowOffset;
            gl2.bindBuffer(gl2.ARRAY_BUFFER, self2.vertexBuffer);
            gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array(vertices), gl2.STATIC_DRAW);
          });
        };
        CardboardUI.prototype.render = function() {
          var gl = this.gl;
          var self2 = this;
          var glState = [gl.CULL_FACE, gl.DEPTH_TEST, gl.BLEND, gl.SCISSOR_TEST, gl.STENCIL_TEST, gl.COLOR_WRITEMASK, gl.VIEWPORT, gl.CURRENT_PROGRAM, gl.ARRAY_BUFFER_BINDING];
          glPreserveState(gl, glState, function(gl2) {
            gl2.disable(gl2.CULL_FACE);
            gl2.disable(gl2.DEPTH_TEST);
            gl2.disable(gl2.BLEND);
            gl2.disable(gl2.SCISSOR_TEST);
            gl2.disable(gl2.STENCIL_TEST);
            gl2.colorMask(true, true, true, true);
            gl2.viewport(0, 0, gl2.drawingBufferWidth, gl2.drawingBufferHeight);
            self2.renderNoState();
          });
        };
        CardboardUI.prototype.renderNoState = function() {
          var gl = this.gl;
          gl.useProgram(this.program);
          gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
          gl.enableVertexAttribArray(this.attribs.position);
          gl.vertexAttribPointer(this.attribs.position, 2, gl.FLOAT, false, 8, 0);
          gl.uniform4f(this.uniforms.color, 1, 1, 1, 1);
          orthoMatrix(this.projMat, 0, gl.drawingBufferWidth, 0, gl.drawingBufferHeight, 0.1, 1024);
          gl.uniformMatrix4fv(this.uniforms.projectionMat, false, this.projMat);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          gl.drawArrays(gl.TRIANGLE_STRIP, this.gearOffset, this.gearVertexCount);
          gl.drawArrays(gl.TRIANGLE_STRIP, this.arrowOffset, this.arrowVertexCount);
        };
        function Distortion(coefficients) {
          this.coefficients = coefficients;
        }
        Distortion.prototype.distortInverse = function(radius) {
          var r0 = 0;
          var r1 = 1;
          var dr0 = radius - this.distort(r0);
          while (Math.abs(r1 - r0) > 1e-4) {
            var dr1 = radius - this.distort(r1);
            var r2 = r1 - dr1 * ((r1 - r0) / (dr1 - dr0));
            r0 = r1;
            r1 = r2;
            dr0 = dr1;
          }
          return r1;
        };
        Distortion.prototype.distort = function(radius) {
          var r2 = radius * radius;
          var ret = 0;
          for (var i = 0; i < this.coefficients.length; i++) {
            ret = r2 * (ret + this.coefficients[i]);
          }
          return (ret + 1) * radius;
        };
        var degToRad = Math.PI / 180;
        var radToDeg = 180 / Math.PI;
        var Vector3 = function Vector32(x, y, z) {
          this.x = x || 0;
          this.y = y || 0;
          this.z = z || 0;
        };
        Vector3.prototype = {
          constructor: Vector3,
          set: function set4(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
          },
          copy: function copy7(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
          },
          length: function length4() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
          },
          normalize: function normalize5() {
            var scalar = this.length();
            if (scalar !== 0) {
              var invScalar = 1 / scalar;
              this.multiplyScalar(invScalar);
            } else {
              this.x = 0;
              this.y = 0;
              this.z = 0;
            }
            return this;
          },
          multiplyScalar: function multiplyScalar2(scalar) {
            this.x *= scalar;
            this.y *= scalar;
            this.z *= scalar;
          },
          applyQuaternion: function applyQuaternion(q) {
            var x = this.x;
            var y = this.y;
            var z = this.z;
            var qx = q.x;
            var qy = q.y;
            var qz = q.z;
            var qw = q.w;
            var ix = qw * x + qy * z - qz * y;
            var iy = qw * y + qz * x - qx * z;
            var iz = qw * z + qx * y - qy * x;
            var iw = -qx * x - qy * y - qz * z;
            this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
            this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
            this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
            return this;
          },
          dot: function dot4(v) {
            return this.x * v.x + this.y * v.y + this.z * v.z;
          },
          crossVectors: function crossVectors(a, b) {
            var ax = a.x, ay = a.y, az = a.z;
            var bx = b.x, by = b.y, bz = b.z;
            this.x = ay * bz - az * by;
            this.y = az * bx - ax * bz;
            this.z = ax * by - ay * bx;
            return this;
          }
        };
        var Quaternion = function Quaternion2(x, y, z, w) {
          this.x = x || 0;
          this.y = y || 0;
          this.z = z || 0;
          this.w = w !== void 0 ? w : 1;
        };
        Quaternion.prototype = {
          constructor: Quaternion,
          set: function set4(x, y, z, w) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
            return this;
          },
          copy: function copy7(quaternion) {
            this.x = quaternion.x;
            this.y = quaternion.y;
            this.z = quaternion.z;
            this.w = quaternion.w;
            return this;
          },
          setFromEulerXYZ: function setFromEulerXYZ(x, y, z) {
            var c1 = Math.cos(x / 2);
            var c2 = Math.cos(y / 2);
            var c3 = Math.cos(z / 2);
            var s1 = Math.sin(x / 2);
            var s2 = Math.sin(y / 2);
            var s3 = Math.sin(z / 2);
            this.x = s1 * c2 * c3 + c1 * s2 * s3;
            this.y = c1 * s2 * c3 - s1 * c2 * s3;
            this.z = c1 * c2 * s3 + s1 * s2 * c3;
            this.w = c1 * c2 * c3 - s1 * s2 * s3;
            return this;
          },
          setFromEulerYXZ: function setFromEulerYXZ(x, y, z) {
            var c1 = Math.cos(x / 2);
            var c2 = Math.cos(y / 2);
            var c3 = Math.cos(z / 2);
            var s1 = Math.sin(x / 2);
            var s2 = Math.sin(y / 2);
            var s3 = Math.sin(z / 2);
            this.x = s1 * c2 * c3 + c1 * s2 * s3;
            this.y = c1 * s2 * c3 - s1 * c2 * s3;
            this.z = c1 * c2 * s3 - s1 * s2 * c3;
            this.w = c1 * c2 * c3 + s1 * s2 * s3;
            return this;
          },
          setFromAxisAngle: function setFromAxisAngle(axis, angle3) {
            var halfAngle = angle3 / 2, s = Math.sin(halfAngle);
            this.x = axis.x * s;
            this.y = axis.y * s;
            this.z = axis.z * s;
            this.w = Math.cos(halfAngle);
            return this;
          },
          multiply: function multiply5(q) {
            return this.multiplyQuaternions(this, q);
          },
          multiplyQuaternions: function multiplyQuaternions(a, b) {
            var qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
            var qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;
            this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
            this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
            this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
            this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
            return this;
          },
          inverse: function inverse2() {
            this.x *= -1;
            this.y *= -1;
            this.z *= -1;
            this.normalize();
            return this;
          },
          normalize: function normalize5() {
            var l = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
            if (l === 0) {
              this.x = 0;
              this.y = 0;
              this.z = 0;
              this.w = 1;
            } else {
              l = 1 / l;
              this.x = this.x * l;
              this.y = this.y * l;
              this.z = this.z * l;
              this.w = this.w * l;
            }
            return this;
          },
          slerp: function slerp3(qb, t) {
            if (t === 0)
              return this;
            if (t === 1)
              return this.copy(qb);
            var x = this.x, y = this.y, z = this.z, w = this.w;
            var cosHalfTheta = w * qb.w + x * qb.x + y * qb.y + z * qb.z;
            if (cosHalfTheta < 0) {
              this.w = -qb.w;
              this.x = -qb.x;
              this.y = -qb.y;
              this.z = -qb.z;
              cosHalfTheta = -cosHalfTheta;
            } else {
              this.copy(qb);
            }
            if (cosHalfTheta >= 1) {
              this.w = w;
              this.x = x;
              this.y = y;
              this.z = z;
              return this;
            }
            var halfTheta = Math.acos(cosHalfTheta);
            var sinHalfTheta = Math.sqrt(1 - cosHalfTheta * cosHalfTheta);
            if (Math.abs(sinHalfTheta) < 1e-3) {
              this.w = 0.5 * (w + this.w);
              this.x = 0.5 * (x + this.x);
              this.y = 0.5 * (y + this.y);
              this.z = 0.5 * (z + this.z);
              return this;
            }
            var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta, ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
            this.w = w * ratioA + this.w * ratioB;
            this.x = x * ratioA + this.x * ratioB;
            this.y = y * ratioA + this.y * ratioB;
            this.z = z * ratioA + this.z * ratioB;
            return this;
          },
          setFromUnitVectors: /* @__PURE__ */ function() {
            var v1, r;
            var EPS = 1e-6;
            return function(vFrom, vTo) {
              if (v1 === void 0)
                v1 = new Vector3();
              r = vFrom.dot(vTo) + 1;
              if (r < EPS) {
                r = 0;
                if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
                  v1.set(-vFrom.y, vFrom.x, 0);
                } else {
                  v1.set(0, -vFrom.z, vFrom.y);
                }
              } else {
                v1.crossVectors(vFrom, vTo);
              }
              this.x = v1.x;
              this.y = v1.y;
              this.z = v1.z;
              this.w = r;
              this.normalize();
              return this;
            };
          }()
        };
        function Device(params) {
          this.width = params.width || getScreenWidth();
          this.height = params.height || getScreenHeight();
          this.widthMeters = params.widthMeters;
          this.heightMeters = params.heightMeters;
          this.bevelMeters = params.bevelMeters;
        }
        var DEFAULT_ANDROID = new Device({
          widthMeters: 0.11,
          heightMeters: 0.062,
          bevelMeters: 4e-3
        });
        var DEFAULT_IOS = new Device({
          widthMeters: 0.1038,
          heightMeters: 0.0584,
          bevelMeters: 4e-3
        });
        var Viewers = {
          CardboardV1: new CardboardViewer({
            id: "CardboardV1",
            label: "Cardboard I/O 2014",
            fov: 40,
            interLensDistance: 0.06,
            baselineLensDistance: 0.035,
            screenLensDistance: 0.042,
            distortionCoefficients: [0.441, 0.156],
            inverseCoefficients: [-0.4410035, 0.42756155, -0.4804439, 0.5460139, -0.58821183, 0.5733938, -0.48303202, 0.33299083, -0.17573841, 0.0651772, -0.01488963, 1559834e-9]
          }),
          CardboardV2: new CardboardViewer({
            id: "CardboardV2",
            label: "Cardboard I/O 2015",
            fov: 60,
            interLensDistance: 0.064,
            baselineLensDistance: 0.035,
            screenLensDistance: 0.039,
            distortionCoefficients: [0.34, 0.55],
            inverseCoefficients: [-0.33836704, -0.18162185, 0.862655, -1.2462051, 1.0560602, -0.58208317, 0.21609078, -0.05444823, 9177956e-9, -9904169e-10, 6183535e-11, -16981803e-13]
          })
        };
        function DeviceInfo(deviceParams, additionalViewers) {
          this.viewer = Viewers.CardboardV2;
          this.updateDeviceParams(deviceParams);
          this.distortion = new Distortion(this.viewer.distortionCoefficients);
          for (var i = 0; i < additionalViewers.length; i++) {
            var viewer = additionalViewers[i];
            Viewers[viewer.id] = new CardboardViewer(viewer);
          }
        }
        DeviceInfo.prototype.updateDeviceParams = function(deviceParams) {
          this.device = this.determineDevice_(deviceParams) || this.device;
        };
        DeviceInfo.prototype.getDevice = function() {
          return this.device;
        };
        DeviceInfo.prototype.setViewer = function(viewer) {
          this.viewer = viewer;
          this.distortion = new Distortion(this.viewer.distortionCoefficients);
        };
        DeviceInfo.prototype.determineDevice_ = function(deviceParams) {
          if (!deviceParams) {
            if (isIOS()) {
              console.warn("Using fallback iOS device measurements.");
              return DEFAULT_IOS;
            } else {
              console.warn("Using fallback Android device measurements.");
              return DEFAULT_ANDROID;
            }
          }
          var METERS_PER_INCH = 0.0254;
          var metersPerPixelX = METERS_PER_INCH / deviceParams.xdpi;
          var metersPerPixelY = METERS_PER_INCH / deviceParams.ydpi;
          var width = getScreenWidth();
          var height = getScreenHeight();
          return new Device({
            widthMeters: metersPerPixelX * width,
            heightMeters: metersPerPixelY * height,
            bevelMeters: deviceParams.bevelMm * 1e-3
          });
        };
        DeviceInfo.prototype.getDistortedFieldOfViewLeftEye = function() {
          var viewer = this.viewer;
          var device2 = this.device;
          var distortion = this.distortion;
          var eyeToScreenDistance = viewer.screenLensDistance;
          var outerDist = (device2.widthMeters - viewer.interLensDistance) / 2;
          var innerDist = viewer.interLensDistance / 2;
          var bottomDist = viewer.baselineLensDistance - device2.bevelMeters;
          var topDist = device2.heightMeters - bottomDist;
          var outerAngle = radToDeg * Math.atan(distortion.distort(outerDist / eyeToScreenDistance));
          var innerAngle = radToDeg * Math.atan(distortion.distort(innerDist / eyeToScreenDistance));
          var bottomAngle = radToDeg * Math.atan(distortion.distort(bottomDist / eyeToScreenDistance));
          var topAngle = radToDeg * Math.atan(distortion.distort(topDist / eyeToScreenDistance));
          return {
            leftDegrees: Math.min(outerAngle, viewer.fov),
            rightDegrees: Math.min(innerAngle, viewer.fov),
            downDegrees: Math.min(bottomAngle, viewer.fov),
            upDegrees: Math.min(topAngle, viewer.fov)
          };
        };
        DeviceInfo.prototype.getLeftEyeVisibleTanAngles = function() {
          var viewer = this.viewer;
          var device2 = this.device;
          var distortion = this.distortion;
          var fovLeft = Math.tan(-degToRad * viewer.fov);
          var fovTop = Math.tan(degToRad * viewer.fov);
          var fovRight = Math.tan(degToRad * viewer.fov);
          var fovBottom = Math.tan(-degToRad * viewer.fov);
          var halfWidth = device2.widthMeters / 4;
          var halfHeight = device2.heightMeters / 2;
          var verticalLensOffset = viewer.baselineLensDistance - device2.bevelMeters - halfHeight;
          var centerX = viewer.interLensDistance / 2 - halfWidth;
          var centerY = -verticalLensOffset;
          var centerZ = viewer.screenLensDistance;
          var screenLeft = distortion.distort((centerX - halfWidth) / centerZ);
          var screenTop = distortion.distort((centerY + halfHeight) / centerZ);
          var screenRight = distortion.distort((centerX + halfWidth) / centerZ);
          var screenBottom = distortion.distort((centerY - halfHeight) / centerZ);
          var result = new Float32Array(4);
          result[0] = Math.max(fovLeft, screenLeft);
          result[1] = Math.min(fovTop, screenTop);
          result[2] = Math.min(fovRight, screenRight);
          result[3] = Math.max(fovBottom, screenBottom);
          return result;
        };
        DeviceInfo.prototype.getLeftEyeNoLensTanAngles = function() {
          var viewer = this.viewer;
          var device2 = this.device;
          var distortion = this.distortion;
          var result = new Float32Array(4);
          var fovLeft = distortion.distortInverse(Math.tan(-degToRad * viewer.fov));
          var fovTop = distortion.distortInverse(Math.tan(degToRad * viewer.fov));
          var fovRight = distortion.distortInverse(Math.tan(degToRad * viewer.fov));
          var fovBottom = distortion.distortInverse(Math.tan(-degToRad * viewer.fov));
          var halfWidth = device2.widthMeters / 4;
          var halfHeight = device2.heightMeters / 2;
          var verticalLensOffset = viewer.baselineLensDistance - device2.bevelMeters - halfHeight;
          var centerX = viewer.interLensDistance / 2 - halfWidth;
          var centerY = -verticalLensOffset;
          var centerZ = viewer.screenLensDistance;
          var screenLeft = (centerX - halfWidth) / centerZ;
          var screenTop = (centerY + halfHeight) / centerZ;
          var screenRight = (centerX + halfWidth) / centerZ;
          var screenBottom = (centerY - halfHeight) / centerZ;
          result[0] = Math.max(fovLeft, screenLeft);
          result[1] = Math.min(fovTop, screenTop);
          result[2] = Math.min(fovRight, screenRight);
          result[3] = Math.max(fovBottom, screenBottom);
          return result;
        };
        DeviceInfo.prototype.getLeftEyeVisibleScreenRect = function(undistortedFrustum) {
          var viewer = this.viewer;
          var device2 = this.device;
          var dist2 = viewer.screenLensDistance;
          var eyeX = (device2.widthMeters - viewer.interLensDistance) / 2;
          var eyeY = viewer.baselineLensDistance - device2.bevelMeters;
          var left = (undistortedFrustum[0] * dist2 + eyeX) / device2.widthMeters;
          var top = (undistortedFrustum[1] * dist2 + eyeY) / device2.heightMeters;
          var right = (undistortedFrustum[2] * dist2 + eyeX) / device2.widthMeters;
          var bottom = (undistortedFrustum[3] * dist2 + eyeY) / device2.heightMeters;
          return {
            x: left,
            y: bottom,
            width: right - left,
            height: top - bottom
          };
        };
        DeviceInfo.prototype.getFieldOfViewLeftEye = function(opt_isUndistorted) {
          return opt_isUndistorted ? this.getUndistortedFieldOfViewLeftEye() : this.getDistortedFieldOfViewLeftEye();
        };
        DeviceInfo.prototype.getFieldOfViewRightEye = function(opt_isUndistorted) {
          var fov = this.getFieldOfViewLeftEye(opt_isUndistorted);
          return {
            leftDegrees: fov.rightDegrees,
            rightDegrees: fov.leftDegrees,
            upDegrees: fov.upDegrees,
            downDegrees: fov.downDegrees
          };
        };
        DeviceInfo.prototype.getUndistortedFieldOfViewLeftEye = function() {
          var p = this.getUndistortedParams_();
          return {
            leftDegrees: radToDeg * Math.atan(p.outerDist),
            rightDegrees: radToDeg * Math.atan(p.innerDist),
            downDegrees: radToDeg * Math.atan(p.bottomDist),
            upDegrees: radToDeg * Math.atan(p.topDist)
          };
        };
        DeviceInfo.prototype.getUndistortedViewportLeftEye = function() {
          var p = this.getUndistortedParams_();
          var viewer = this.viewer;
          var device2 = this.device;
          var eyeToScreenDistance = viewer.screenLensDistance;
          var screenWidth = device2.widthMeters / eyeToScreenDistance;
          var screenHeight = device2.heightMeters / eyeToScreenDistance;
          var xPxPerTanAngle = device2.width / screenWidth;
          var yPxPerTanAngle = device2.height / screenHeight;
          var x = Math.round((p.eyePosX - p.outerDist) * xPxPerTanAngle);
          var y = Math.round((p.eyePosY - p.bottomDist) * yPxPerTanAngle);
          return {
            x,
            y,
            width: Math.round((p.eyePosX + p.innerDist) * xPxPerTanAngle) - x,
            height: Math.round((p.eyePosY + p.topDist) * yPxPerTanAngle) - y
          };
        };
        DeviceInfo.prototype.getUndistortedParams_ = function() {
          var viewer = this.viewer;
          var device2 = this.device;
          var distortion = this.distortion;
          var eyeToScreenDistance = viewer.screenLensDistance;
          var halfLensDistance = viewer.interLensDistance / 2 / eyeToScreenDistance;
          var screenWidth = device2.widthMeters / eyeToScreenDistance;
          var screenHeight = device2.heightMeters / eyeToScreenDistance;
          var eyePosX = screenWidth / 2 - halfLensDistance;
          var eyePosY = (viewer.baselineLensDistance - device2.bevelMeters) / eyeToScreenDistance;
          var maxFov = viewer.fov;
          var viewerMax = distortion.distortInverse(Math.tan(degToRad * maxFov));
          var outerDist = Math.min(eyePosX, viewerMax);
          var innerDist = Math.min(halfLensDistance, viewerMax);
          var bottomDist = Math.min(eyePosY, viewerMax);
          var topDist = Math.min(screenHeight - eyePosY, viewerMax);
          return {
            outerDist,
            innerDist,
            topDist,
            bottomDist,
            eyePosX,
            eyePosY
          };
        };
        function CardboardViewer(params) {
          this.id = params.id;
          this.label = params.label;
          this.fov = params.fov;
          this.interLensDistance = params.interLensDistance;
          this.baselineLensDistance = params.baselineLensDistance;
          this.screenLensDistance = params.screenLensDistance;
          this.distortionCoefficients = params.distortionCoefficients;
          this.inverseCoefficients = params.inverseCoefficients;
        }
        DeviceInfo.Viewers = Viewers;
        var format = 1;
        var last_updated = "2019-11-09T17:36:14Z";
        var devices = [{ "type": "android", "rules": [{ "mdmh": "asus/*/Nexus 7/*" }, { "ua": "Nexus 7" }], "dpi": [320.8, 323], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "asus/*/ASUS_X00PD/*" }, { "ua": "ASUS_X00PD" }], "dpi": 245, "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "asus/*/ASUS_X008D/*" }, { "ua": "ASUS_X008D" }], "dpi": 282, "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "asus/*/ASUS_Z00AD/*" }, { "ua": "ASUS_Z00AD" }], "dpi": [403, 404.6], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "Google/*/Pixel 2 XL/*" }, { "ua": "Pixel 2 XL" }], "dpi": 537.9, "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "Google/*/Pixel 3 XL/*" }, { "ua": "Pixel 3 XL" }], "dpi": [558.5, 553.8], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "Google/*/Pixel XL/*" }, { "ua": "Pixel XL" }], "dpi": [537.9, 533], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "Google/*/Pixel 3/*" }, { "ua": "Pixel 3" }], "dpi": 442.4, "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "Google/*/Pixel 2/*" }, { "ua": "Pixel 2" }], "dpi": 441, "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "Google/*/Pixel/*" }, { "ua": "Pixel" }], "dpi": [432.6, 436.7], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "HTC/*/HTC6435LVW/*" }, { "ua": "HTC6435LVW" }], "dpi": [449.7, 443.3], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "HTC/*/HTC One XL/*" }, { "ua": "HTC One XL" }], "dpi": [315.3, 314.6], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "htc/*/Nexus 9/*" }, { "ua": "Nexus 9" }], "dpi": 289, "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "HTC/*/HTC One M9/*" }, { "ua": "HTC One M9" }], "dpi": [442.5, 443.3], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "HTC/*/HTC One_M8/*" }, { "ua": "HTC One_M8" }], "dpi": [449.7, 447.4], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "HTC/*/HTC One/*" }, { "ua": "HTC One" }], "dpi": 472.8, "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "Huawei/*/Nexus 6P/*" }, { "ua": "Nexus 6P" }], "dpi": [515.1, 518], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "Huawei/*/BLN-L24/*" }, { "ua": "HONORBLN-L24" }], "dpi": 480, "bw": 4, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "Huawei/*/BKL-L09/*" }, { "ua": "BKL-L09" }], "dpi": 403, "bw": 3.47, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "LENOVO/*/Lenovo PB2-690Y/*" }, { "ua": "Lenovo PB2-690Y" }], "dpi": [457.2, 454.713], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "LGE/*/Nexus 5X/*" }, { "ua": "Nexus 5X" }], "dpi": [422, 419.9], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "LGE/*/LGMS345/*" }, { "ua": "LGMS345" }], "dpi": [221.7, 219.1], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "LGE/*/LG-D800/*" }, { "ua": "LG-D800" }], "dpi": [422, 424.1], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "LGE/*/LG-D850/*" }, { "ua": "LG-D850" }], "dpi": [537.9, 541.9], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "LGE/*/VS985 4G/*" }, { "ua": "VS985 4G" }], "dpi": [537.9, 535.6], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "LGE/*/Nexus 5/*" }, { "ua": "Nexus 5 B" }], "dpi": [442.4, 444.8], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "LGE/*/Nexus 4/*" }, { "ua": "Nexus 4" }], "dpi": [319.8, 318.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "LGE/*/LG-P769/*" }, { "ua": "LG-P769" }], "dpi": [240.6, 247.5], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "LGE/*/LGMS323/*" }, { "ua": "LGMS323" }], "dpi": [206.6, 204.6], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "LGE/*/LGLS996/*" }, { "ua": "LGLS996" }], "dpi": [403.4, 401.5], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "Micromax/*/4560MMX/*" }, { "ua": "4560MMX" }], "dpi": [240, 219.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "Micromax/*/A250/*" }, { "ua": "Micromax A250" }], "dpi": [480, 446.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "Micromax/*/Micromax AQ4501/*" }, { "ua": "Micromax AQ4501" }], "dpi": 240, "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "motorola/*/G5/*" }, { "ua": "Moto G (5) Plus" }], "dpi": [403.4, 403], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "motorola/*/DROID RAZR/*" }, { "ua": "DROID RAZR" }], "dpi": [368.1, 256.7], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "motorola/*/XT830C/*" }, { "ua": "XT830C" }], "dpi": [254, 255.9], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "motorola/*/XT1021/*" }, { "ua": "XT1021" }], "dpi": [254, 256.7], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "motorola/*/XT1023/*" }, { "ua": "XT1023" }], "dpi": [254, 256.7], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "motorola/*/XT1028/*" }, { "ua": "XT1028" }], "dpi": [326.6, 327.6], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "motorola/*/XT1034/*" }, { "ua": "XT1034" }], "dpi": [326.6, 328.4], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "motorola/*/XT1053/*" }, { "ua": "XT1053" }], "dpi": [315.3, 316.1], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "motorola/*/XT1562/*" }, { "ua": "XT1562" }], "dpi": [403.4, 402.7], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "motorola/*/Nexus 6/*" }, { "ua": "Nexus 6 B" }], "dpi": [494.3, 489.7], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "motorola/*/XT1063/*" }, { "ua": "XT1063" }], "dpi": [295, 296.6], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "motorola/*/XT1064/*" }, { "ua": "XT1064" }], "dpi": [295, 295.6], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "motorola/*/XT1092/*" }, { "ua": "XT1092" }], "dpi": [422, 424.1], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "motorola/*/XT1095/*" }, { "ua": "XT1095" }], "dpi": [422, 423.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "motorola/*/G4/*" }, { "ua": "Moto G (4)" }], "dpi": 401, "bw": 4, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "OnePlus/*/A0001/*" }, { "ua": "A0001" }], "dpi": [403.4, 401], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "OnePlus/*/ONE E1001/*" }, { "ua": "ONE E1001" }], "dpi": [442.4, 441.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "OnePlus/*/ONE E1003/*" }, { "ua": "ONE E1003" }], "dpi": [442.4, 441.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "OnePlus/*/ONE E1005/*" }, { "ua": "ONE E1005" }], "dpi": [442.4, 441.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "OnePlus/*/ONE A2001/*" }, { "ua": "ONE A2001" }], "dpi": [391.9, 405.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "OnePlus/*/ONE A2003/*" }, { "ua": "ONE A2003" }], "dpi": [391.9, 405.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "OnePlus/*/ONE A2005/*" }, { "ua": "ONE A2005" }], "dpi": [391.9, 405.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "OnePlus/*/ONEPLUS A3000/*" }, { "ua": "ONEPLUS A3000" }], "dpi": 401, "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "OnePlus/*/ONEPLUS A3003/*" }, { "ua": "ONEPLUS A3003" }], "dpi": 401, "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "OnePlus/*/ONEPLUS A3010/*" }, { "ua": "ONEPLUS A3010" }], "dpi": 401, "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "OnePlus/*/ONEPLUS A5000/*" }, { "ua": "ONEPLUS A5000 " }], "dpi": [403.411, 399.737], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "OnePlus/*/ONE A5010/*" }, { "ua": "ONEPLUS A5010" }], "dpi": [403, 400], "bw": 2, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "OnePlus/*/ONEPLUS A6000/*" }, { "ua": "ONEPLUS A6000" }], "dpi": 401, "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "OnePlus/*/ONEPLUS A6003/*" }, { "ua": "ONEPLUS A6003" }], "dpi": 401, "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "OnePlus/*/ONEPLUS A6010/*" }, { "ua": "ONEPLUS A6010" }], "dpi": 401, "bw": 2, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "OnePlus/*/ONEPLUS A6013/*" }, { "ua": "ONEPLUS A6013" }], "dpi": 401, "bw": 2, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "OPPO/*/X909/*" }, { "ua": "X909" }], "dpi": [442.4, 444.1], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/GT-I9082/*" }, { "ua": "GT-I9082" }], "dpi": [184.7, 185.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G360P/*" }, { "ua": "SM-G360P" }], "dpi": [196.7, 205.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/Nexus S/*" }, { "ua": "Nexus S" }], "dpi": [234.5, 229.8], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/GT-I9300/*" }, { "ua": "GT-I9300" }], "dpi": [304.8, 303.9], "bw": 5, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-T230NU/*" }, { "ua": "SM-T230NU" }], "dpi": 216, "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SGH-T399/*" }, { "ua": "SGH-T399" }], "dpi": [217.7, 231.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SGH-M919/*" }, { "ua": "SGH-M919" }], "dpi": [440.8, 437.7], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-N9005/*" }, { "ua": "SM-N9005" }], "dpi": [386.4, 387], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SAMSUNG-SM-N900A/*" }, { "ua": "SAMSUNG-SM-N900A" }], "dpi": [386.4, 387.7], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/GT-I9500/*" }, { "ua": "GT-I9500" }], "dpi": [442.5, 443.3], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/GT-I9505/*" }, { "ua": "GT-I9505" }], "dpi": 439.4, "bw": 4, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G900F/*" }, { "ua": "SM-G900F" }], "dpi": [415.6, 431.6], "bw": 5, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G900M/*" }, { "ua": "SM-G900M" }], "dpi": [415.6, 431.6], "bw": 5, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G800F/*" }, { "ua": "SM-G800F" }], "dpi": 326.8, "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G906S/*" }, { "ua": "SM-G906S" }], "dpi": [562.7, 572.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/GT-I9300/*" }, { "ua": "GT-I9300" }], "dpi": [306.7, 304.8], "bw": 5, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-T535/*" }, { "ua": "SM-T535" }], "dpi": [142.6, 136.4], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-N920C/*" }, { "ua": "SM-N920C" }], "dpi": [515.1, 518.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-N920P/*" }, { "ua": "SM-N920P" }], "dpi": [386.3655, 390.144], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-N920W8/*" }, { "ua": "SM-N920W8" }], "dpi": [515.1, 518.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/GT-I9300I/*" }, { "ua": "GT-I9300I" }], "dpi": [304.8, 305.8], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/GT-I9195/*" }, { "ua": "GT-I9195" }], "dpi": [249.4, 256.7], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SPH-L520/*" }, { "ua": "SPH-L520" }], "dpi": [249.4, 255.9], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SAMSUNG-SGH-I717/*" }, { "ua": "SAMSUNG-SGH-I717" }], "dpi": 285.8, "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SPH-D710/*" }, { "ua": "SPH-D710" }], "dpi": [217.7, 204.2], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/GT-N7100/*" }, { "ua": "GT-N7100" }], "dpi": 265.1, "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SCH-I605/*" }, { "ua": "SCH-I605" }], "dpi": 265.1, "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/Galaxy Nexus/*" }, { "ua": "Galaxy Nexus" }], "dpi": [315.3, 314.2], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-N910H/*" }, { "ua": "SM-N910H" }], "dpi": [515.1, 518], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-N910C/*" }, { "ua": "SM-N910C" }], "dpi": [515.2, 520.2], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G130M/*" }, { "ua": "SM-G130M" }], "dpi": [165.9, 164.8], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G928I/*" }, { "ua": "SM-G928I" }], "dpi": [515.1, 518.4], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G920F/*" }, { "ua": "SM-G920F" }], "dpi": 580.6, "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G920P/*" }, { "ua": "SM-G920P" }], "dpi": [522.5, 577], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G925F/*" }, { "ua": "SM-G925F" }], "dpi": 580.6, "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G925V/*" }, { "ua": "SM-G925V" }], "dpi": [522.5, 576.6], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G930F/*" }, { "ua": "SM-G930F" }], "dpi": 576.6, "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G935F/*" }, { "ua": "SM-G935F" }], "dpi": 533, "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G950F/*" }, { "ua": "SM-G950F" }], "dpi": [562.707, 565.293], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G955U/*" }, { "ua": "SM-G955U" }], "dpi": [522.514, 525.762], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G955F/*" }, { "ua": "SM-G955F" }], "dpi": [522.514, 525.762], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G960F/*" }, { "ua": "SM-G960F" }], "dpi": [569.575, 571.5], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G9600/*" }, { "ua": "SM-G9600" }], "dpi": [569.575, 571.5], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G960T/*" }, { "ua": "SM-G960T" }], "dpi": [569.575, 571.5], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G960N/*" }, { "ua": "SM-G960N" }], "dpi": [569.575, 571.5], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G960U/*" }, { "ua": "SM-G960U" }], "dpi": [569.575, 571.5], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G9608/*" }, { "ua": "SM-G9608" }], "dpi": [569.575, 571.5], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G960FD/*" }, { "ua": "SM-G960FD" }], "dpi": [569.575, 571.5], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G960W/*" }, { "ua": "SM-G960W" }], "dpi": [569.575, 571.5], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G965F/*" }, { "ua": "SM-G965F" }], "dpi": 529, "bw": 2, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "Sony/*/C6903/*" }, { "ua": "C6903" }], "dpi": [442.5, 443.3], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "Sony/*/D6653/*" }, { "ua": "D6653" }], "dpi": [428.6, 427.6], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "Sony/*/E6653/*" }, { "ua": "E6653" }], "dpi": [428.6, 425.7], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "Sony/*/E6853/*" }, { "ua": "E6853" }], "dpi": [403.4, 401.9], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "Sony/*/SGP321/*" }, { "ua": "SGP321" }], "dpi": [224.7, 224.1], "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "TCT/*/ALCATEL ONE TOUCH Fierce/*" }, { "ua": "ALCATEL ONE TOUCH Fierce" }], "dpi": [240, 247.5], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "THL/*/thl 5000/*" }, { "ua": "thl 5000" }], "dpi": [480, 443.3], "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "Fly/*/IQ4412/*" }, { "ua": "IQ4412" }], "dpi": 307.9, "bw": 3, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "ZTE/*/ZTE Blade L2/*" }, { "ua": "ZTE Blade L2" }], "dpi": 240, "bw": 3, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "BENEVE/*/VR518/*" }, { "ua": "VR518" }], "dpi": 480, "bw": 3, "ac": 500 }, { "type": "ios", "rules": [{ "res": [640, 960] }], "dpi": [325.1, 328.4], "bw": 4, "ac": 1e3 }, { "type": "ios", "rules": [{ "res": [640, 1136] }], "dpi": [317.1, 320.2], "bw": 3, "ac": 1e3 }, { "type": "ios", "rules": [{ "res": [750, 1334] }], "dpi": 326.4, "bw": 4, "ac": 1e3 }, { "type": "ios", "rules": [{ "res": [1242, 2208] }], "dpi": [453.6, 458.4], "bw": 4, "ac": 1e3 }, { "type": "ios", "rules": [{ "res": [1125, 2001] }], "dpi": [410.9, 415.4], "bw": 4, "ac": 1e3 }, { "type": "ios", "rules": [{ "res": [1125, 2436] }], "dpi": 458, "bw": 4, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "Huawei/*/EML-L29/*" }, { "ua": "EML-L29" }], "dpi": 428, "bw": 3.45, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "Nokia/*/Nokia 7.1/*" }, { "ua": "Nokia 7.1" }], "dpi": [432, 431.9], "bw": 3, "ac": 500 }, { "type": "ios", "rules": [{ "res": [1242, 2688] }], "dpi": 458, "bw": 4, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G570M/*" }, { "ua": "SM-G570M" }], "dpi": 320, "bw": 3.684, "ac": 1e3 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G970F/*" }, { "ua": "SM-G970F" }], "dpi": 438, "bw": 2.281, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G973F/*" }, { "ua": "SM-G973F" }], "dpi": 550, "bw": 2.002, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G975F/*" }, { "ua": "SM-G975F" }], "dpi": 522, "bw": 2.054, "ac": 500 }, { "type": "android", "rules": [{ "mdmh": "samsung/*/SM-G977F/*" }, { "ua": "SM-G977F" }], "dpi": 505, "bw": 2.334, "ac": 500 }, { "type": "ios", "rules": [{ "res": [828, 1792] }], "dpi": 326, "bw": 5, "ac": 500 }];
        var DPDB_CACHE = {
          format,
          last_updated,
          devices
        };
        function Dpdb(url, onDeviceParamsUpdated) {
          this.dpdb = DPDB_CACHE;
          this.recalculateDeviceParams_();
          if (url) {
            this.onDeviceParamsUpdated = onDeviceParamsUpdated;
            var xhr = new XMLHttpRequest();
            var obj = this;
            xhr.open("GET", url, true);
            xhr.addEventListener("load", function() {
              obj.loading = false;
              if (xhr.status >= 200 && xhr.status <= 299) {
                obj.dpdb = JSON.parse(xhr.response);
                obj.recalculateDeviceParams_();
              } else {
                console.error("Error loading online DPDB!");
              }
            });
            xhr.send();
          }
        }
        Dpdb.prototype.getDeviceParams = function() {
          return this.deviceParams;
        };
        Dpdb.prototype.recalculateDeviceParams_ = function() {
          var newDeviceParams = this.calcDeviceParams_();
          if (newDeviceParams) {
            this.deviceParams = newDeviceParams;
            if (this.onDeviceParamsUpdated) {
              this.onDeviceParamsUpdated(this.deviceParams);
            }
          } else {
            console.error("Failed to recalculate device parameters.");
          }
        };
        Dpdb.prototype.calcDeviceParams_ = function() {
          var db = this.dpdb;
          if (!db) {
            console.error("DPDB not available.");
            return null;
          }
          if (db.format != 1) {
            console.error("DPDB has unexpected format version.");
            return null;
          }
          if (!db.devices || !db.devices.length) {
            console.error("DPDB does not have a devices section.");
            return null;
          }
          var userAgent = navigator.userAgent || navigator.vendor || window.opera;
          var width = getScreenWidth();
          var height = getScreenHeight();
          if (!db.devices) {
            console.error("DPDB has no devices section.");
            return null;
          }
          for (var i = 0; i < db.devices.length; i++) {
            var device2 = db.devices[i];
            if (!device2.rules) {
              console.warn("Device[" + i + "] has no rules section.");
              continue;
            }
            if (device2.type != "ios" && device2.type != "android") {
              console.warn("Device[" + i + "] has invalid type.");
              continue;
            }
            if (isIOS() != (device2.type == "ios"))
              continue;
            var matched = false;
            for (var j = 0; j < device2.rules.length; j++) {
              var rule = device2.rules[j];
              if (this.ruleMatches_(rule, userAgent, width, height)) {
                matched = true;
                break;
              }
            }
            if (!matched)
              continue;
            var xdpi = device2.dpi[0] || device2.dpi;
            var ydpi = device2.dpi[1] || device2.dpi;
            return new DeviceParams({ xdpi, ydpi, bevelMm: device2.bw });
          }
          console.warn("No DPDB device match.");
          return null;
        };
        Dpdb.prototype.ruleMatches_ = function(rule, ua, screenWidth, screenHeight) {
          if (!rule.ua && !rule.res)
            return false;
          if (rule.ua && rule.ua.substring(0, 2) === "SM")
            rule.ua = rule.ua.substring(0, 7);
          if (rule.ua && ua.indexOf(rule.ua) < 0)
            return false;
          if (rule.res) {
            if (!rule.res[0] || !rule.res[1])
              return false;
            var resX = rule.res[0];
            var resY = rule.res[1];
            if (Math.min(screenWidth, screenHeight) != Math.min(resX, resY) || Math.max(screenWidth, screenHeight) != Math.max(resX, resY)) {
              return false;
            }
          }
          return true;
        };
        function DeviceParams(params) {
          this.xdpi = params.xdpi;
          this.ydpi = params.ydpi;
          this.bevelMm = params.bevelMm;
        }
        function SensorSample(sample, timestampS) {
          this.set(sample, timestampS);
        }
        SensorSample.prototype.set = function(sample, timestampS) {
          this.sample = sample;
          this.timestampS = timestampS;
        };
        SensorSample.prototype.copy = function(sensorSample) {
          this.set(sensorSample.sample, sensorSample.timestampS);
        };
        function ComplementaryFilter(kFilter, isDebug) {
          this.kFilter = kFilter;
          this.isDebug = isDebug;
          this.currentAccelMeasurement = new SensorSample();
          this.currentGyroMeasurement = new SensorSample();
          this.previousGyroMeasurement = new SensorSample();
          if (isIOS()) {
            this.filterQ = new Quaternion(-1, 0, 0, 1);
          } else {
            this.filterQ = new Quaternion(1, 0, 0, 1);
          }
          this.previousFilterQ = new Quaternion();
          this.previousFilterQ.copy(this.filterQ);
          this.accelQ = new Quaternion();
          this.isOrientationInitialized = false;
          this.estimatedGravity = new Vector3();
          this.measuredGravity = new Vector3();
          this.gyroIntegralQ = new Quaternion();
        }
        ComplementaryFilter.prototype.addAccelMeasurement = function(vector, timestampS) {
          this.currentAccelMeasurement.set(vector, timestampS);
        };
        ComplementaryFilter.prototype.addGyroMeasurement = function(vector, timestampS) {
          this.currentGyroMeasurement.set(vector, timestampS);
          var deltaT = timestampS - this.previousGyroMeasurement.timestampS;
          if (isTimestampDeltaValid(deltaT)) {
            this.run_();
          }
          this.previousGyroMeasurement.copy(this.currentGyroMeasurement);
        };
        ComplementaryFilter.prototype.run_ = function() {
          if (!this.isOrientationInitialized) {
            this.accelQ = this.accelToQuaternion_(this.currentAccelMeasurement.sample);
            this.previousFilterQ.copy(this.accelQ);
            this.isOrientationInitialized = true;
            return;
          }
          var deltaT = this.currentGyroMeasurement.timestampS - this.previousGyroMeasurement.timestampS;
          var gyroDeltaQ = this.gyroToQuaternionDelta_(this.currentGyroMeasurement.sample, deltaT);
          this.gyroIntegralQ.multiply(gyroDeltaQ);
          this.filterQ.copy(this.previousFilterQ);
          this.filterQ.multiply(gyroDeltaQ);
          var invFilterQ = new Quaternion();
          invFilterQ.copy(this.filterQ);
          invFilterQ.inverse();
          this.estimatedGravity.set(0, 0, -1);
          this.estimatedGravity.applyQuaternion(invFilterQ);
          this.estimatedGravity.normalize();
          this.measuredGravity.copy(this.currentAccelMeasurement.sample);
          this.measuredGravity.normalize();
          var deltaQ = new Quaternion();
          deltaQ.setFromUnitVectors(this.estimatedGravity, this.measuredGravity);
          deltaQ.inverse();
          if (this.isDebug) {
            console.log("Delta: %d deg, G_est: (%s, %s, %s), G_meas: (%s, %s, %s)", radToDeg * getQuaternionAngle(deltaQ), this.estimatedGravity.x.toFixed(1), this.estimatedGravity.y.toFixed(1), this.estimatedGravity.z.toFixed(1), this.measuredGravity.x.toFixed(1), this.measuredGravity.y.toFixed(1), this.measuredGravity.z.toFixed(1));
          }
          var targetQ = new Quaternion();
          targetQ.copy(this.filterQ);
          targetQ.multiply(deltaQ);
          this.filterQ.slerp(targetQ, 1 - this.kFilter);
          this.previousFilterQ.copy(this.filterQ);
        };
        ComplementaryFilter.prototype.getOrientation = function() {
          return this.filterQ;
        };
        ComplementaryFilter.prototype.accelToQuaternion_ = function(accel) {
          var normAccel = new Vector3();
          normAccel.copy(accel);
          normAccel.normalize();
          var quat = new Quaternion();
          quat.setFromUnitVectors(new Vector3(0, 0, -1), normAccel);
          quat.inverse();
          return quat;
        };
        ComplementaryFilter.prototype.gyroToQuaternionDelta_ = function(gyro, dt) {
          var quat = new Quaternion();
          var axis = new Vector3();
          axis.copy(gyro);
          axis.normalize();
          quat.setFromAxisAngle(axis, gyro.length() * dt);
          return quat;
        };
        function PosePredictor(predictionTimeS, isDebug) {
          this.predictionTimeS = predictionTimeS;
          this.isDebug = isDebug;
          this.previousQ = new Quaternion();
          this.previousTimestampS = null;
          this.deltaQ = new Quaternion();
          this.outQ = new Quaternion();
        }
        PosePredictor.prototype.getPrediction = function(currentQ, gyro, timestampS) {
          if (!this.previousTimestampS) {
            this.previousQ.copy(currentQ);
            this.previousTimestampS = timestampS;
            return currentQ;
          }
          var axis = new Vector3();
          axis.copy(gyro);
          axis.normalize();
          var angularSpeed = gyro.length();
          if (angularSpeed < degToRad * 20) {
            if (this.isDebug) {
              console.log("Moving slowly, at %s deg/s: no prediction", (radToDeg * angularSpeed).toFixed(1));
            }
            this.outQ.copy(currentQ);
            this.previousQ.copy(currentQ);
            return this.outQ;
          }
          var predictAngle = angularSpeed * this.predictionTimeS;
          this.deltaQ.setFromAxisAngle(axis, predictAngle);
          this.outQ.copy(this.previousQ);
          this.outQ.multiply(this.deltaQ);
          this.previousQ.copy(currentQ);
          this.previousTimestampS = timestampS;
          return this.outQ;
        };
        function FusionPoseSensor(kFilter, predictionTime, yawOnly, isDebug) {
          this.yawOnly = yawOnly;
          this.accelerometer = new Vector3();
          this.gyroscope = new Vector3();
          this.filter = new ComplementaryFilter(kFilter, isDebug);
          this.posePredictor = new PosePredictor(predictionTime, isDebug);
          this.isFirefoxAndroid = isFirefoxAndroid();
          this.isIOS = isIOS();
          var chromeVersion = getChromeVersion();
          this.isDeviceMotionInRadians = !this.isIOS && chromeVersion && chromeVersion < 66;
          this.isWithoutDeviceMotion = isChromeWithoutDeviceMotion() || isSafariWithoutDeviceMotion();
          this.filterToWorldQ = new Quaternion();
          if (isIOS()) {
            this.filterToWorldQ.setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);
          } else {
            this.filterToWorldQ.setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
          }
          this.inverseWorldToScreenQ = new Quaternion();
          this.worldToScreenQ = new Quaternion();
          this.originalPoseAdjustQ = new Quaternion();
          this.originalPoseAdjustQ.setFromAxisAngle(new Vector3(0, 0, 1), -window.orientation * Math.PI / 180);
          this.setScreenTransform_();
          if (isLandscapeMode()) {
            this.filterToWorldQ.multiply(this.inverseWorldToScreenQ);
          }
          this.resetQ = new Quaternion();
          this.orientationOut_ = new Float32Array(4);
          this.start();
        }
        FusionPoseSensor.prototype.getPosition = function() {
          return null;
        };
        FusionPoseSensor.prototype.getOrientation = function() {
          var orientation = void 0;
          if (this.isWithoutDeviceMotion && this._deviceOrientationQ) {
            this.deviceOrientationFixQ = this.deviceOrientationFixQ || function() {
              var z = new Quaternion().setFromAxisAngle(new Vector3(0, 0, -1), 0);
              var y = new Quaternion();
              if (window.orientation === -90) {
                y.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / -2);
              } else {
                y.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
              }
              return z.multiply(y);
            }();
            this.deviceOrientationFilterToWorldQ = this.deviceOrientationFilterToWorldQ || function() {
              var q = new Quaternion();
              q.setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
              return q;
            }();
            orientation = this._deviceOrientationQ;
            var out = new Quaternion();
            out.copy(orientation);
            out.multiply(this.deviceOrientationFilterToWorldQ);
            out.multiply(this.resetQ);
            out.multiply(this.worldToScreenQ);
            out.multiplyQuaternions(this.deviceOrientationFixQ, out);
            if (this.yawOnly) {
              out.x = 0;
              out.z = 0;
              out.normalize();
            }
            this.orientationOut_[0] = out.x;
            this.orientationOut_[1] = out.y;
            this.orientationOut_[2] = out.z;
            this.orientationOut_[3] = out.w;
            return this.orientationOut_;
          } else {
            var filterOrientation = this.filter.getOrientation();
            orientation = this.posePredictor.getPrediction(filterOrientation, this.gyroscope, this.previousTimestampS);
          }
          var out = new Quaternion();
          out.copy(this.filterToWorldQ);
          out.multiply(this.resetQ);
          out.multiply(orientation);
          out.multiply(this.worldToScreenQ);
          if (this.yawOnly) {
            out.x = 0;
            out.z = 0;
            out.normalize();
          }
          this.orientationOut_[0] = out.x;
          this.orientationOut_[1] = out.y;
          this.orientationOut_[2] = out.z;
          this.orientationOut_[3] = out.w;
          return this.orientationOut_;
        };
        FusionPoseSensor.prototype.resetPose = function() {
          this.resetQ.copy(this.filter.getOrientation());
          this.resetQ.x = 0;
          this.resetQ.y = 0;
          this.resetQ.z *= -1;
          this.resetQ.normalize();
          if (isLandscapeMode()) {
            this.resetQ.multiply(this.inverseWorldToScreenQ);
          }
          this.resetQ.multiply(this.originalPoseAdjustQ);
        };
        FusionPoseSensor.prototype.onDeviceOrientation_ = function(e) {
          this._deviceOrientationQ = this._deviceOrientationQ || new Quaternion();
          var alpha = e.alpha, beta = e.beta, gamma = e.gamma;
          alpha = (alpha || 0) * Math.PI / 180;
          beta = (beta || 0) * Math.PI / 180;
          gamma = (gamma || 0) * Math.PI / 180;
          this._deviceOrientationQ.setFromEulerYXZ(beta, alpha, -gamma);
        };
        FusionPoseSensor.prototype.onDeviceMotion_ = function(deviceMotion) {
          this.updateDeviceMotion_(deviceMotion);
        };
        FusionPoseSensor.prototype.updateDeviceMotion_ = function(deviceMotion) {
          var accGravity = deviceMotion.accelerationIncludingGravity;
          var rotRate = deviceMotion.rotationRate;
          var timestampS = deviceMotion.timeStamp / 1e3;
          var deltaS = timestampS - this.previousTimestampS;
          if (deltaS < 0) {
            warnOnce("fusion-pose-sensor:invalid:non-monotonic", "Invalid timestamps detected: non-monotonic timestamp from devicemotion");
            this.previousTimestampS = timestampS;
            return;
          } else if (deltaS <= MIN_TIMESTEP || deltaS > MAX_TIMESTEP) {
            warnOnce("fusion-pose-sensor:invalid:outside-threshold", "Invalid timestamps detected: Timestamp from devicemotion outside expected range.");
            this.previousTimestampS = timestampS;
            return;
          }
          this.accelerometer.set(-accGravity.x, -accGravity.y, -accGravity.z);
          if (rotRate) {
            if (isR7()) {
              this.gyroscope.set(-rotRate.beta, rotRate.alpha, rotRate.gamma);
            } else {
              this.gyroscope.set(rotRate.alpha, rotRate.beta, rotRate.gamma);
            }
            if (!this.isDeviceMotionInRadians) {
              this.gyroscope.multiplyScalar(Math.PI / 180);
            }
            this.filter.addGyroMeasurement(this.gyroscope, timestampS);
          }
          this.filter.addAccelMeasurement(this.accelerometer, timestampS);
          this.previousTimestampS = timestampS;
        };
        FusionPoseSensor.prototype.onOrientationChange_ = function(screenOrientation) {
          this.setScreenTransform_();
        };
        FusionPoseSensor.prototype.onMessage_ = function(event) {
          var message = event.data;
          if (!message || !message.type) {
            return;
          }
          var type = message.type.toLowerCase();
          if (type !== "devicemotion") {
            return;
          }
          this.updateDeviceMotion_(message.deviceMotionEvent);
        };
        FusionPoseSensor.prototype.setScreenTransform_ = function() {
          this.worldToScreenQ.set(0, 0, 0, 1);
          switch (window.orientation) {
            case 0:
              break;
            case 90:
              this.worldToScreenQ.setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 2);
              break;
            case -90:
              this.worldToScreenQ.setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
              break;
            case 180:
              break;
          }
          this.inverseWorldToScreenQ.copy(this.worldToScreenQ);
          this.inverseWorldToScreenQ.inverse();
        };
        FusionPoseSensor.prototype.start = function() {
          this.onDeviceMotionCallback_ = this.onDeviceMotion_.bind(this);
          this.onOrientationChangeCallback_ = this.onOrientationChange_.bind(this);
          this.onMessageCallback_ = this.onMessage_.bind(this);
          this.onDeviceOrientationCallback_ = this.onDeviceOrientation_.bind(this);
          if (isIOS() && isInsideCrossOriginIFrame()) {
            window.addEventListener("message", this.onMessageCallback_);
          }
          window.addEventListener("orientationchange", this.onOrientationChangeCallback_);
          if (this.isWithoutDeviceMotion) {
            window.addEventListener("deviceorientation", this.onDeviceOrientationCallback_);
          } else {
            window.addEventListener("devicemotion", this.onDeviceMotionCallback_);
          }
        };
        FusionPoseSensor.prototype.stop = function() {
          window.removeEventListener("devicemotion", this.onDeviceMotionCallback_);
          window.removeEventListener("deviceorientation", this.onDeviceOrientationCallback_);
          window.removeEventListener("orientationchange", this.onOrientationChangeCallback_);
          window.removeEventListener("message", this.onMessageCallback_);
        };
        var SENSOR_FREQUENCY = 60;
        var X_AXIS = new Vector3(1, 0, 0);
        var Z_AXIS = new Vector3(0, 0, 1);
        var SENSOR_TO_VR = new Quaternion();
        SENSOR_TO_VR.setFromAxisAngle(X_AXIS, -Math.PI / 2);
        SENSOR_TO_VR.multiply(new Quaternion().setFromAxisAngle(Z_AXIS, Math.PI / 2));
        var PoseSensor = function() {
          function PoseSensor2(config3) {
            classCallCheck(this, PoseSensor2);
            this.config = config3;
            this.sensor = null;
            this.fusionSensor = null;
            this._out = new Float32Array(4);
            this.api = null;
            this.errors = [];
            this._sensorQ = new Quaternion();
            this._outQ = new Quaternion();
            this._onSensorRead = this._onSensorRead.bind(this);
            this._onSensorError = this._onSensorError.bind(this);
            this.init();
          }
          createClass(PoseSensor2, [{
            key: "init",
            value: function init() {
              var sensor = null;
              try {
                sensor = new RelativeOrientationSensor({
                  frequency: SENSOR_FREQUENCY,
                  referenceFrame: "screen"
                });
                sensor.addEventListener("error", this._onSensorError);
              } catch (error) {
                this.errors.push(error);
                if (error.name === "SecurityError") {
                  console.error("Cannot construct sensors due to the Feature Policy");
                  console.warn('Attempting to fall back using "devicemotion"; however this will fail in the future without correct permissions.');
                  this.useDeviceMotion();
                } else if (error.name === "ReferenceError") {
                  this.useDeviceMotion();
                } else {
                  console.error(error);
                }
              }
              if (sensor) {
                this.api = "sensor";
                this.sensor = sensor;
                this.sensor.addEventListener("reading", this._onSensorRead);
                this.sensor.start();
              }
            }
          }, {
            key: "useDeviceMotion",
            value: function useDeviceMotion() {
              this.api = "devicemotion";
              this.fusionSensor = new FusionPoseSensor(this.config.K_FILTER, this.config.PREDICTION_TIME_S, this.config.YAW_ONLY, this.config.DEBUG);
              if (this.sensor) {
                this.sensor.removeEventListener("reading", this._onSensorRead);
                this.sensor.removeEventListener("error", this._onSensorError);
                this.sensor = null;
              }
            }
          }, {
            key: "getOrientation",
            value: function getOrientation() {
              if (this.fusionSensor) {
                return this.fusionSensor.getOrientation();
              }
              if (!this.sensor || !this.sensor.quaternion) {
                this._out[0] = this._out[1] = this._out[2] = 0;
                this._out[3] = 1;
                return this._out;
              }
              var q = this.sensor.quaternion;
              this._sensorQ.set(q[0], q[1], q[2], q[3]);
              var out = this._outQ;
              out.copy(SENSOR_TO_VR);
              out.multiply(this._sensorQ);
              if (this.config.YAW_ONLY) {
                out.x = out.z = 0;
                out.normalize();
              }
              this._out[0] = out.x;
              this._out[1] = out.y;
              this._out[2] = out.z;
              this._out[3] = out.w;
              return this._out;
            }
          }, {
            key: "_onSensorError",
            value: function _onSensorError(event) {
              this.errors.push(event.error);
              if (event.error.name === "NotAllowedError") {
                console.error("Permission to access sensor was denied");
              } else if (event.error.name === "NotReadableError") {
                console.error("Sensor could not be read");
              } else {
                console.error(event.error);
              }
              this.useDeviceMotion();
            }
          }, {
            key: "_onSensorRead",
            value: function _onSensorRead() {
            }
          }]);
          return PoseSensor2;
        }();
        var rotateInstructionsAsset = "<svg width='198' height='240' viewBox='0 0 198 240' xmlns='http://www.w3.org/2000/svg'><g fill='none' fill-rule='evenodd'><path d='M149.625 109.527l6.737 3.891v.886c0 .177.013.36.038.549.01.081.02.162.027.242.14 1.415.974 2.998 2.105 3.999l5.72 5.062.081-.09s4.382-2.53 5.235-3.024l25.97 14.993v54.001c0 .771-.386 1.217-.948 1.217-.233 0-.495-.076-.772-.236l-23.967-13.838-.014.024-27.322 15.775-.85-1.323c-4.731-1.529-9.748-2.74-14.951-3.61a.27.27 0 0 0-.007.024l-5.067 16.961-7.891 4.556-.037-.063v27.59c0 .772-.386 1.217-.948 1.217-.232 0-.495-.076-.772-.236l-42.473-24.522c-.95-.549-1.72-1.877-1.72-2.967v-1.035l-.021.047a5.111 5.111 0 0 0-1.816-.399 5.682 5.682 0 0 0-.546.001 13.724 13.724 0 0 1-1.918-.041c-1.655-.153-3.2-.6-4.404-1.296l-46.576-26.89.005.012-10.278-18.75c-1.001-1.827-.241-4.216 1.698-5.336l56.011-32.345a4.194 4.194 0 0 1 2.099-.572c1.326 0 2.572.659 3.227 1.853l.005-.003.227.413-.006.004a9.63 9.63 0 0 0 1.477 2.018l.277.27c1.914 1.85 4.468 2.801 7.113 2.801 1.949 0 3.948-.517 5.775-1.572.013 0 7.319-4.219 7.319-4.219a4.194 4.194 0 0 1 2.099-.572c1.326 0 2.572.658 3.226 1.853l3.25 5.928.022-.018 6.785 3.917-.105-.182 46.881-26.965m0-1.635c-.282 0-.563.073-.815.218l-46.169 26.556-5.41-3.124-3.005-5.481c-.913-1.667-2.699-2.702-4.66-2.703-1.011 0-2.02.274-2.917.792a3825 3825 0 0 1-7.275 4.195l-.044.024a9.937 9.937 0 0 1-4.957 1.353c-2.292 0-4.414-.832-5.976-2.342l-.252-.245a7.992 7.992 0 0 1-1.139-1.534 1.379 1.379 0 0 0-.06-.122l-.227-.414a1.718 1.718 0 0 0-.095-.154c-.938-1.574-2.673-2.545-4.571-2.545-1.011 0-2.02.274-2.917.792L3.125 155.502c-2.699 1.559-3.738 4.94-2.314 7.538l10.278 18.75c.177.323.448.563.761.704l46.426 26.804c1.403.81 3.157 1.332 5.072 1.508a15.661 15.661 0 0 0 2.146.046 4.766 4.766 0 0 1 .396 0c.096.004.19.011.283.022.109 1.593 1.159 3.323 2.529 4.114l42.472 24.522c.524.302 1.058.455 1.59.455 1.497 0 2.583-1.2 2.583-2.852v-26.562l7.111-4.105a1.64 1.64 0 0 0 .749-.948l4.658-15.593c4.414.797 8.692 1.848 12.742 3.128l.533.829a1.634 1.634 0 0 0 2.193.531l26.532-15.317L193 192.433c.523.302 1.058.455 1.59.455 1.497 0 2.583-1.199 2.583-2.852v-54.001c0-.584-.312-1.124-.818-1.416l-25.97-14.993a1.633 1.633 0 0 0-1.636.001c-.606.351-2.993 1.73-4.325 2.498l-4.809-4.255c-.819-.725-1.461-1.933-1.561-2.936a7.776 7.776 0 0 0-.033-.294 2.487 2.487 0 0 1-.023-.336v-.886c0-.584-.312-1.123-.817-1.416l-6.739-3.891a1.633 1.633 0 0 0-.817-.219' fill='#455A64'/><path d='M96.027 132.636l46.576 26.891c1.204.695 1.979 1.587 2.242 2.541l-.01.007-81.374 46.982h-.001c-1.654-.152-3.199-.6-4.403-1.295l-46.576-26.891 83.546-48.235' fill='#FAFAFA'/><path d='M63.461 209.174c-.008 0-.015 0-.022-.002-1.693-.156-3.228-.609-4.441-1.309l-46.576-26.89a.118.118 0 0 1 0-.203l83.546-48.235a.117.117 0 0 1 .117 0l46.576 26.891c1.227.708 2.021 1.612 2.296 2.611a.116.116 0 0 1-.042.124l-.021.016-81.375 46.981a.11.11 0 0 1-.058.016zm-50.747-28.303l46.401 26.79c1.178.68 2.671 1.121 4.32 1.276l81.272-46.922c-.279-.907-1.025-1.73-2.163-2.387l-46.517-26.857-83.313 48.1z' fill='#607D8B'/><path d='M148.327 165.471a5.85 5.85 0 0 1-.546.001c-1.894-.083-3.302-1.038-3.145-2.132a2.693 2.693 0 0 0-.072-1.105l-81.103 46.822c.628.058 1.272.073 1.918.042.182-.009.364-.009.546-.001 1.894.083 3.302 1.038 3.145 2.132l79.257-45.759' fill='#FFF'/><path d='M69.07 211.347a.118.118 0 0 1-.115-.134c.045-.317-.057-.637-.297-.925-.505-.61-1.555-1.022-2.738-1.074a5.966 5.966 0 0 0-.535.001 14.03 14.03 0 0 1-1.935-.041.117.117 0 0 1-.103-.092.116.116 0 0 1 .055-.126l81.104-46.822a.117.117 0 0 1 .171.07c.104.381.129.768.074 1.153-.045.316.057.637.296.925.506.61 1.555 1.021 2.739 1.073.178.008.357.008.535-.001a.117.117 0 0 1 .064.218l-79.256 45.759a.114.114 0 0 1-.059.016zm-3.405-2.372c.089 0 .177.002.265.006 1.266.056 2.353.488 2.908 1.158.227.274.35.575.36.882l78.685-45.429c-.036 0-.072-.001-.107-.003-1.267-.056-2.354-.489-2.909-1.158-.282-.34-.402-.724-.347-1.107a2.604 2.604 0 0 0-.032-.91L63.846 208.97a13.91 13.91 0 0 0 1.528.012c.097-.005.194-.007.291-.007z' fill='#607D8B'/><path d='M2.208 162.134c-1.001-1.827-.241-4.217 1.698-5.337l56.011-32.344c1.939-1.12 4.324-.546 5.326 1.281l.232.41a9.344 9.344 0 0 0 1.47 2.021l.278.27c3.325 3.214 8.583 3.716 12.888 1.23l7.319-4.22c1.94-1.119 4.324-.546 5.325 1.282l3.25 5.928-83.519 48.229-10.278-18.75z' fill='#FAFAFA'/><path d='M12.486 181.001a.112.112 0 0 1-.031-.005.114.114 0 0 1-.071-.056L2.106 162.19c-1.031-1.88-.249-4.345 1.742-5.494l56.01-32.344a4.328 4.328 0 0 1 2.158-.588c1.415 0 2.65.702 3.311 1.882.01.008.018.017.024.028l.227.414a.122.122 0 0 1 .013.038 9.508 9.508 0 0 0 1.439 1.959l.275.266c1.846 1.786 4.344 2.769 7.031 2.769 1.977 0 3.954-.538 5.717-1.557a.148.148 0 0 1 .035-.013l7.284-4.206a4.321 4.321 0 0 1 2.157-.588c1.427 0 2.672.716 3.329 1.914l3.249 5.929a.116.116 0 0 1-.044.157l-83.518 48.229a.116.116 0 0 1-.059.016zm49.53-57.004c-.704 0-1.41.193-2.041.557l-56.01 32.345c-1.882 1.086-2.624 3.409-1.655 5.179l10.221 18.645 83.317-48.112-3.195-5.829c-.615-1.122-1.783-1.792-3.124-1.792a4.08 4.08 0 0 0-2.04.557l-7.317 4.225a.148.148 0 0 1-.035.013 11.7 11.7 0 0 1-5.801 1.569c-2.748 0-5.303-1.007-7.194-2.835l-.278-.27a9.716 9.716 0 0 1-1.497-2.046.096.096 0 0 1-.013-.037l-.191-.347a.11.11 0 0 1-.023-.029c-.615-1.123-1.783-1.793-3.124-1.793z' fill='#607D8B'/><path d='M42.434 155.808c-2.51-.001-4.697-1.258-5.852-3.365-1.811-3.304-.438-7.634 3.059-9.654l12.291-7.098a7.599 7.599 0 0 1 3.789-1.033c2.51 0 4.697 1.258 5.852 3.365 1.811 3.304.439 7.634-3.059 9.654l-12.291 7.098a7.606 7.606 0 0 1-3.789 1.033zm13.287-20.683a7.128 7.128 0 0 0-3.555.971l-12.291 7.098c-3.279 1.893-4.573 5.942-2.883 9.024 1.071 1.955 3.106 3.122 5.442 3.122a7.13 7.13 0 0 0 3.556-.97l12.291-7.098c3.279-1.893 4.572-5.942 2.883-9.024-1.072-1.955-3.106-3.123-5.443-3.123z' fill='#607D8B'/><path d='M149.588 109.407l6.737 3.89v.887c0 .176.013.36.037.549.011.081.02.161.028.242.14 1.415.973 2.998 2.105 3.999l7.396 6.545c.177.156.358.295.541.415 1.579 1.04 2.95.466 3.062-1.282.049-.784.057-1.595.023-2.429l-.003-.16v-1.151l25.987 15.003v54c0 1.09-.77 1.53-1.72.982l-42.473-24.523c-.95-.548-1.72-1.877-1.72-2.966v-34.033' fill='#FAFAFA'/><path d='M194.553 191.25c-.257 0-.54-.085-.831-.253l-42.472-24.521c-.981-.567-1.779-1.943-1.779-3.068v-34.033h.234v34.033c0 1.051.745 2.336 1.661 2.866l42.473 24.521c.424.245.816.288 1.103.122.285-.164.442-.52.442-1.002v-53.933l-25.753-14.868.003 1.106c.034.832.026 1.654-.024 2.439-.054.844-.396 1.464-.963 1.746-.619.309-1.45.173-2.28-.373a5.023 5.023 0 0 1-.553-.426l-7.397-6.544c-1.158-1.026-1.999-2.625-2.143-4.076a9.624 9.624 0 0 0-.027-.238 4.241 4.241 0 0 1-.038-.564v-.82l-6.68-3.856.117-.202 6.738 3.89.058.034v.954c0 .171.012.351.036.533.011.083.021.165.029.246.138 1.395.948 2.935 2.065 3.923l7.397 6.545c.173.153.35.289.527.406.758.499 1.504.63 2.047.359.49-.243.786-.795.834-1.551.05-.778.057-1.591.024-2.417l-.004-.163v-1.355l.175.1 25.987 15.004.059.033v54.068c0 .569-.198.996-.559 1.204a1.002 1.002 0 0 1-.506.131' fill='#607D8B'/><path d='M145.685 163.161l24.115 13.922-25.978 14.998-1.462-.307c-6.534-2.17-13.628-3.728-21.019-4.616-4.365-.524-8.663 1.096-9.598 3.62a2.746 2.746 0 0 0-.011 1.928c1.538 4.267 4.236 8.363 7.995 12.135l.532.845-25.977 14.997-24.115-13.922 75.518-43.6' fill='#FFF'/><path d='M94.282 220.818l-.059-.033-24.29-14.024.175-.101 75.577-43.634.058.033 24.29 14.024-26.191 15.122-.045-.01-1.461-.307c-6.549-2.174-13.613-3.725-21.009-4.614a13.744 13.744 0 0 0-1.638-.097c-3.758 0-7.054 1.531-7.837 3.642a2.62 2.62 0 0 0-.01 1.848c1.535 4.258 4.216 8.326 7.968 12.091l.016.021.526.835.006.01.064.102-.105.061-25.977 14.998-.058.033zm-23.881-14.057l23.881 13.788 24.802-14.32c.546-.315.846-.489 1.017-.575l-.466-.74c-3.771-3.787-6.467-7.881-8.013-12.168a2.851 2.851 0 0 1 .011-2.008c.815-2.199 4.203-3.795 8.056-3.795.557 0 1.117.033 1.666.099 7.412.891 14.491 2.445 21.041 4.621.836.175 1.215.254 1.39.304l25.78-14.884-23.881-13.788-75.284 43.466z' fill='#607D8B'/><path d='M167.23 125.979v50.871l-27.321 15.773-6.461-14.167c-.91-1.996-3.428-1.738-5.624.574a10.238 10.238 0 0 0-2.33 4.018l-6.46 21.628-27.322 15.774v-50.871l75.518-43.6' fill='#FFF'/><path d='M91.712 220.567a.127.127 0 0 1-.059-.016.118.118 0 0 1-.058-.101v-50.871c0-.042.023-.08.058-.101l75.519-43.6a.117.117 0 0 1 .175.101v50.871c0 .041-.023.08-.059.1l-27.321 15.775a.118.118 0 0 1-.094.01.12.12 0 0 1-.071-.063l-6.46-14.168c-.375-.822-1.062-1.275-1.934-1.275-1.089 0-2.364.686-3.5 1.881a10.206 10.206 0 0 0-2.302 3.972l-6.46 21.627a.118.118 0 0 1-.054.068L91.77 220.551a.12.12 0 0 1-.058.016zm.117-50.92v50.601l27.106-15.65 6.447-21.583a10.286 10.286 0 0 1 2.357-4.065c1.18-1.242 2.517-1.954 3.669-1.954.969 0 1.731.501 2.146 1.411l6.407 14.051 27.152-15.676v-50.601l-75.284 43.466z' fill='#607D8B'/><path d='M168.543 126.213v50.87l-27.322 15.774-6.46-14.168c-.91-1.995-3.428-1.738-5.624.574a10.248 10.248 0 0 0-2.33 4.019l-6.461 21.627-27.321 15.774v-50.87l75.518-43.6' fill='#FFF'/><path d='M93.025 220.8a.123.123 0 0 1-.059-.015.12.12 0 0 1-.058-.101v-50.871c0-.042.023-.08.058-.101l75.518-43.6a.112.112 0 0 1 .117 0c.036.02.059.059.059.1v50.871a.116.116 0 0 1-.059.101l-27.321 15.774a.111.111 0 0 1-.094.01.115.115 0 0 1-.071-.062l-6.46-14.168c-.375-.823-1.062-1.275-1.935-1.275-1.088 0-2.363.685-3.499 1.881a10.19 10.19 0 0 0-2.302 3.971l-6.461 21.628a.108.108 0 0 1-.053.067l-27.322 15.775a.12.12 0 0 1-.058.015zm.117-50.919v50.6l27.106-15.649 6.447-21.584a10.293 10.293 0 0 1 2.357-4.065c1.179-1.241 2.516-1.954 3.668-1.954.969 0 1.732.502 2.147 1.412l6.407 14.051 27.152-15.676v-50.601l-75.284 43.466z' fill='#607D8B'/><path d='M169.8 177.083l-27.322 15.774-6.46-14.168c-.91-1.995-3.428-1.738-5.625.574a10.246 10.246 0 0 0-2.329 4.019l-6.461 21.627-27.321 15.774v-50.87l75.518-43.6v50.87z' fill='#FAFAFA'/><path d='M94.282 220.917a.234.234 0 0 1-.234-.233v-50.871c0-.083.045-.161.117-.202l75.518-43.601a.234.234 0 1 1 .35.202v50.871a.233.233 0 0 1-.116.202l-27.322 15.775a.232.232 0 0 1-.329-.106l-6.461-14.168c-.36-.789-.992-1.206-1.828-1.206-1.056 0-2.301.672-3.415 1.844a10.099 10.099 0 0 0-2.275 3.924l-6.46 21.628a.235.235 0 0 1-.107.136l-27.322 15.774a.23.23 0 0 1-.116.031zm.233-50.969v50.331l26.891-15.525 6.434-21.539a10.41 10.41 0 0 1 2.384-4.112c1.201-1.265 2.569-1.991 3.753-1.991 1.018 0 1.818.526 2.253 1.48l6.354 13.934 26.982-15.578v-50.331l-75.051 43.331z' fill='#607D8B'/><path d='M109.894 199.943c-1.774 0-3.241-.725-4.244-2.12a.224.224 0 0 1 .023-.294.233.233 0 0 1 .301-.023c.78.547 1.705.827 2.75.827 1.323 0 2.754-.439 4.256-1.306 5.311-3.067 9.631-10.518 9.631-16.611 0-1.927-.442-3.56-1.278-4.724a.232.232 0 0 1 .323-.327c1.671 1.172 2.591 3.381 2.591 6.219 0 6.242-4.426 13.863-9.865 17.003-1.574.908-3.084 1.356-4.488 1.356zm-2.969-1.542c.813.651 1.82.877 2.968.877h.001c1.321 0 2.753-.327 4.254-1.194 5.311-3.067 9.632-10.463 9.632-16.556 0-1.979-.463-3.599-1.326-4.761.411 1.035.625 2.275.625 3.635 0 6.243-4.426 13.883-9.865 17.023-1.574.909-3.084 1.317-4.49 1.317-.641 0-1.243-.149-1.799-.341z' fill='#607D8B'/><path d='M113.097 197.23c5.384-3.108 9.748-10.636 9.748-16.814 0-2.051-.483-3.692-1.323-4.86-1.784-1.252-4.374-1.194-7.257.47-5.384 3.108-9.748 10.636-9.748 16.814 0 2.051.483 3.692 1.323 4.86 1.784 1.252 4.374 1.194 7.257-.47' fill='#FAFAFA'/><path d='M108.724 198.614c-1.142 0-2.158-.213-3.019-.817-.021-.014-.04.014-.055-.007-.894-1.244-1.367-2.948-1.367-4.973 0-6.242 4.426-13.864 9.865-17.005 1.574-.908 3.084-1.363 4.49-1.363 1.142 0 2.158.309 3.018.913a.23.23 0 0 1 .056.056c.894 1.244 1.367 2.972 1.367 4.997 0 6.243-4.426 13.783-9.865 16.923-1.574.909-3.084 1.276-4.49 1.276zm-2.718-1.109c.774.532 1.688.776 2.718.776 1.323 0 2.754-.413 4.256-1.28 5.311-3.066 9.631-10.505 9.631-16.598 0-1.909-.434-3.523-1.255-4.685-.774-.533-1.688-.799-2.718-.799-1.323 0-2.755.441-4.256 1.308-5.311 3.066-9.631 10.506-9.631 16.599 0 1.909.434 3.517 1.255 4.679z' fill='#607D8B'/><path d='M149.318 114.262l-9.984 8.878 15.893 11.031 5.589-6.112-11.498-13.797' fill='#FAFAFA'/><path d='M169.676 120.84l-9.748 5.627c-3.642 2.103-9.528 2.113-13.147.024-3.62-2.089-3.601-5.488.041-7.591l9.495-5.608-6.729-3.885-81.836 47.071 45.923 26.514 3.081-1.779c.631-.365.869-.898.618-1.39-2.357-4.632-2.593-9.546-.683-14.262 5.638-13.92 24.509-24.815 48.618-28.07 8.169-1.103 16.68-.967 24.704.394.852.145 1.776.008 2.407-.357l3.081-1.778-25.825-14.91' fill='#FAFAFA'/><path d='M113.675 183.459a.47.47 0 0 1-.233-.062l-45.924-26.515a.468.468 0 0 1 .001-.809l81.836-47.071a.467.467 0 0 1 .466 0l6.729 3.885a.467.467 0 0 1-.467.809l-6.496-3.75-80.9 46.533 44.988 25.973 2.848-1.644c.192-.111.62-.409.435-.773-2.416-4.748-2.658-9.814-.7-14.65 2.806-6.927 8.885-13.242 17.582-18.263 8.657-4.998 19.518-8.489 31.407-10.094 8.198-1.107 16.79-.97 24.844.397.739.125 1.561.007 2.095-.301l2.381-1.374-25.125-14.506a.467.467 0 0 1 .467-.809l25.825 14.91a.467.467 0 0 1 0 .809l-3.081 1.779c-.721.417-1.763.575-2.718.413-7.963-1.351-16.457-1.486-24.563-.392-11.77 1.589-22.512 5.039-31.065 9.977-8.514 4.916-14.456 11.073-17.183 17.805-1.854 4.578-1.623 9.376.666 13.875.37.725.055 1.513-.8 2.006l-3.081 1.78a.476.476 0 0 1-.234.062' fill='#455A64'/><path d='M153.316 128.279c-2.413 0-4.821-.528-6.652-1.586-1.818-1.049-2.82-2.461-2.82-3.975 0-1.527 1.016-2.955 2.861-4.02l9.493-5.607a.233.233 0 1 1 .238.402l-9.496 5.609c-1.696.979-2.628 2.263-2.628 3.616 0 1.34.918 2.608 2.585 3.571 3.549 2.049 9.343 2.038 12.914-.024l9.748-5.628a.234.234 0 0 1 .234.405l-9.748 5.628c-1.858 1.072-4.296 1.609-6.729 1.609' fill='#607D8B'/><path d='M113.675 182.992l-45.913-26.508M113.675 183.342a.346.346 0 0 1-.175-.047l-45.913-26.508a.35.35 0 1 1 .35-.607l45.913 26.508a.35.35 0 0 1-.175.654' fill='#455A64'/><path d='M67.762 156.484v54.001c0 1.09.77 2.418 1.72 2.967l42.473 24.521c.95.549 1.72.11 1.72-.98v-54.001' fill='#FAFAFA'/><path d='M112.727 238.561c-.297 0-.62-.095-.947-.285l-42.473-24.521c-1.063-.613-1.895-2.05-1.895-3.27v-54.001a.35.35 0 1 1 .701 0v54.001c0 .96.707 2.18 1.544 2.663l42.473 24.522c.344.198.661.243.87.122.206-.119.325-.411.325-.799v-54.001a.35.35 0 1 1 .7 0v54.001c0 .655-.239 1.154-.675 1.406a1.235 1.235 0 0 1-.623.162' fill='#455A64'/><path d='M112.86 147.512h-.001c-2.318 0-4.499-.522-6.142-1.471-1.705-.984-2.643-2.315-2.643-3.749 0-1.445.952-2.791 2.68-3.788l12.041-6.953c1.668-.962 3.874-1.493 6.212-1.493 2.318 0 4.499.523 6.143 1.472 1.704.984 2.643 2.315 2.643 3.748 0 1.446-.952 2.791-2.68 3.789l-12.042 6.952c-1.668.963-3.874 1.493-6.211 1.493zm12.147-16.753c-2.217 0-4.298.497-5.861 1.399l-12.042 6.952c-1.502.868-2.33 1.998-2.33 3.182 0 1.173.815 2.289 2.293 3.142 1.538.889 3.596 1.378 5.792 1.378h.001c2.216 0 4.298-.497 5.861-1.399l12.041-6.953c1.502-.867 2.33-1.997 2.33-3.182 0-1.172-.814-2.288-2.292-3.142-1.539-.888-3.596-1.377-5.793-1.377z' fill='#607D8B'/><path d='M165.63 123.219l-5.734 3.311c-3.167 1.828-8.286 1.837-11.433.02-3.147-1.817-3.131-4.772.036-6.601l5.734-3.31 11.397 6.58' fill='#FAFAFA'/><path d='M154.233 117.448l9.995 5.771-4.682 2.704c-1.434.827-3.352 1.283-5.399 1.283-2.029 0-3.923-.449-5.333-1.263-1.29-.744-2-1.694-2-2.674 0-.991.723-1.955 2.036-2.713l5.383-3.108m0-.809l-5.734 3.31c-3.167 1.829-3.183 4.784-.036 6.601 1.568.905 3.623 1.357 5.684 1.357 2.077 0 4.159-.46 5.749-1.377l5.734-3.311-11.397-6.58M145.445 179.667c-1.773 0-3.241-.85-4.243-2.245-.067-.092-.057-.275.023-.356.08-.081.207-.12.3-.055.781.548 1.706.812 2.751.811 1.322 0 2.754-.446 4.256-1.313 5.31-3.066 9.631-10.522 9.631-16.615 0-1.927-.442-3.562-1.279-4.726a.235.235 0 0 1 .024-.301.232.232 0 0 1 .3-.027c1.67 1.172 2.59 3.38 2.59 6.219 0 6.242-4.425 13.987-9.865 17.127-1.573.908-3.083 1.481-4.488 1.481zM142.476 178c.814.651 1.82 1.002 2.969 1.002 1.322 0 2.753-.452 4.255-1.32 5.31-3.065 9.631-10.523 9.631-16.617 0-1.98-.463-3.63-1.325-4.793.411 1.035.624 2.26.624 3.62 0 6.242-4.425 13.875-9.865 17.015-1.573.909-3.084 1.376-4.489 1.376a5.49 5.49 0 0 1-1.8-.283z' fill='#607D8B'/><path d='M148.648 176.704c5.384-3.108 9.748-10.636 9.748-16.813 0-2.052-.483-3.693-1.322-4.861-1.785-1.252-4.375-1.194-7.258.471-5.383 3.108-9.748 10.636-9.748 16.813 0 2.051.484 3.692 1.323 4.86 1.785 1.253 4.374 1.195 7.257-.47' fill='#FAFAFA'/><path d='M144.276 178.276c-1.143 0-2.158-.307-3.019-.911a.217.217 0 0 1-.055-.054c-.895-1.244-1.367-2.972-1.367-4.997 0-6.241 4.425-13.875 9.865-17.016 1.573-.908 3.084-1.369 4.489-1.369 1.143 0 2.158.307 3.019.91a.24.24 0 0 1 .055.055c.894 1.244 1.367 2.971 1.367 4.997 0 6.241-4.425 13.875-9.865 17.016-1.573.908-3.084 1.369-4.489 1.369zm-2.718-1.172c.773.533 1.687.901 2.718.901 1.322 0 2.754-.538 4.256-1.405 5.31-3.066 9.631-10.567 9.631-16.661 0-1.908-.434-3.554-1.256-4.716-.774-.532-1.688-.814-2.718-.814-1.322 0-2.754.433-4.256 1.3-5.31 3.066-9.631 10.564-9.631 16.657 0 1.91.434 3.576 1.256 4.738z' fill='#607D8B'/><path d='M150.72 172.361l-.363-.295a24.105 24.105 0 0 0 2.148-3.128 24.05 24.05 0 0 0 1.977-4.375l.443.149a24.54 24.54 0 0 1-2.015 4.46 24.61 24.61 0 0 1-2.19 3.189M115.917 191.514l-.363-.294a24.174 24.174 0 0 0 2.148-3.128 24.038 24.038 0 0 0 1.976-4.375l.443.148a24.48 24.48 0 0 1-2.015 4.461 24.662 24.662 0 0 1-2.189 3.188M114 237.476V182.584 237.476' fill='#607D8B'/><g><path d='M81.822 37.474c.017-.135-.075-.28-.267-.392-.327-.188-.826-.21-1.109-.045l-6.012 3.471c-.131.076-.194.178-.191.285.002.132.002.461.002.578v.043l-.007.128-6.591 3.779c-.001 0-2.077 1.046-2.787 5.192 0 0-.912 6.961-.898 19.745.015 12.57.606 17.07 1.167 21.351.22 1.684 3.001 2.125 3.001 2.125.331.04.698-.027 1.08-.248l75.273-43.551c1.808-1.069 2.667-3.719 3.056-6.284 1.213-7.99 1.675-32.978-.275-39.878-.196-.693-.51-1.083-.868-1.282l-2.086-.79c-.727.028-1.416.467-1.534.535L82.032 37.072l-.21.402' fill='#FFF'/><path d='M144.311 1.701l2.085.79c.358.199.672.589.868 1.282 1.949 6.9 1.487 31.887.275 39.878-.39 2.565-1.249 5.215-3.056 6.284L69.21 93.486a1.78 1.78 0 0 1-.896.258l-.183-.011c0 .001-2.782-.44-3.003-2.124-.56-4.282-1.151-8.781-1.165-21.351-.015-12.784.897-19.745.897-19.745.71-4.146 2.787-5.192 2.787-5.192l6.591-3.779.007-.128v-.043c0-.117 0-.446-.002-.578-.003-.107.059-.21.191-.285l6.012-3.472a.98.98 0 0 1 .481-.11c.218 0 .449.053.627.156.193.112.285.258.268.392l.211-.402 60.744-34.836c.117-.068.806-.507 1.534-.535m0-.997l-.039.001c-.618.023-1.283.244-1.974.656l-.021.012-60.519 34.706a2.358 2.358 0 0 0-.831-.15c-.365 0-.704.084-.98.244l-6.012 3.471c-.442.255-.699.69-.689 1.166l.001.15-6.08 3.487c-.373.199-2.542 1.531-3.29 5.898l-.006.039c-.009.07-.92 7.173-.906 19.875.014 12.62.603 17.116 1.172 21.465l.002.015c.308 2.355 3.475 2.923 3.836 2.98l.034.004c.101.013.204.019.305.019a2.77 2.77 0 0 0 1.396-.392l75.273-43.552c1.811-1.071 2.999-3.423 3.542-6.997 1.186-7.814 1.734-33.096-.301-40.299-.253-.893-.704-1.527-1.343-1.882l-.132-.062-2.085-.789a.973.973 0 0 0-.353-.065' fill='#455A64'/><path d='M128.267 11.565l1.495.434-56.339 32.326' fill='#FFF'/><path d='M74.202 90.545a.5.5 0 0 1-.25-.931l18.437-10.645a.499.499 0 1 1 .499.864L74.451 90.478l-.249.067M75.764 42.654l-.108-.062.046-.171 5.135-2.964.17.045-.045.171-5.135 2.964-.063.017M70.52 90.375V46.421l.063-.036L137.84 7.554v43.954l-.062.036L70.52 90.375zm.25-43.811v43.38l66.821-38.579V7.985L70.77 46.564z' fill='#607D8B'/><path d='M86.986 83.182c-.23.149-.612.384-.849.523l-11.505 6.701c-.237.139-.206.252.068.252h.565c.275 0 .693-.113.93-.252L87.7 83.705c.237-.139.428-.253.425-.256a11.29 11.29 0 0 1-.006-.503c0-.274-.188-.377-.418-.227l-.715.463' fill='#607D8B'/><path d='M75.266 90.782H74.7c-.2 0-.316-.056-.346-.166-.03-.11.043-.217.215-.317l11.505-6.702c.236-.138.615-.371.844-.519l.715-.464a.488.488 0 0 1 .266-.089c.172 0 .345.13.345.421 0 .214.001.363.003.437l.006.004-.004.069c-.003.075-.003.075-.486.356l-11.505 6.702a2.282 2.282 0 0 1-.992.268zm-.6-.25l.034.001h.566c.252 0 .649-.108.866-.234l11.505-6.702c.168-.098.294-.173.361-.214-.004-.084-.004-.218-.004-.437l-.095-.171-.131.049-.714.463c-.232.15-.616.386-.854.525l-11.505 6.702-.029.018z' fill='#607D8B'/><path d='M75.266 89.871H74.7c-.2 0-.316-.056-.346-.166-.03-.11.043-.217.215-.317l11.505-6.702c.258-.151.694-.268.993-.268h.565c.2 0 .316.056.346.166.03.11-.043.217-.215.317l-11.505 6.702a2.282 2.282 0 0 1-.992.268zm-.6-.25l.034.001h.566c.252 0 .649-.107.866-.234l11.505-6.702.03-.018-.035-.001h-.565c-.252 0-.649.108-.867.234l-11.505 6.702-.029.018zM74.37 90.801v-1.247 1.247' fill='#607D8B'/><path d='M68.13 93.901c-.751-.093-1.314-.737-1.439-1.376-.831-4.238-1.151-8.782-1.165-21.352-.015-12.784.897-19.745.897-19.745.711-4.146 2.787-5.192 2.787-5.192l74.859-43.219c.223-.129 2.487-1.584 3.195.923 1.95 6.9 1.488 31.887.275 39.878-.389 2.565-1.248 5.215-3.056 6.283L69.21 93.653c-.382.221-.749.288-1.08.248 0 0-2.781-.441-3.001-2.125-.561-4.281-1.152-8.781-1.167-21.351-.014-12.784.898-19.745.898-19.745.71-4.146 2.787-5.191 2.787-5.191l6.598-3.81.871-.119 6.599-3.83.046-.461L68.13 93.901' fill='#FAFAFA'/><path d='M68.317 94.161l-.215-.013h-.001l-.244-.047c-.719-.156-2.772-.736-2.976-2.292-.568-4.34-1.154-8.813-1.168-21.384-.014-12.654.891-19.707.9-19.777.725-4.231 2.832-5.338 2.922-5.382l6.628-3.827.87-.119 6.446-3.742.034-.334a.248.248 0 0 1 .273-.223.248.248 0 0 1 .223.272l-.059.589-6.752 3.919-.87.118-6.556 3.785c-.031.016-1.99 1.068-2.666 5.018-.007.06-.908 7.086-.894 19.702.014 12.539.597 16.996 1.161 21.305.091.691.689 1.154 1.309 1.452a1.95 1.95 0 0 1-.236-.609c-.781-3.984-1.155-8.202-1.17-21.399-.014-12.653.891-19.707.9-19.777.725-4.231 2.832-5.337 2.922-5.382-.004.001 74.444-42.98 74.846-43.212l.028-.017c.904-.538 1.72-.688 2.36-.433.555.221.949.733 1.172 1.52 2.014 7.128 1.46 32.219.281 39.983-.507 3.341-1.575 5.515-3.175 6.462L69.335 93.869a2.023 2.023 0 0 1-1.018.292zm-.147-.507c.293.036.604-.037.915-.217l75.273-43.551c1.823-1.078 2.602-3.915 2.934-6.106 1.174-7.731 1.731-32.695-.268-39.772-.178-.631-.473-1.032-.876-1.192-.484-.193-1.166-.052-1.921.397l-.034.021-74.858 43.218c-.031.017-1.989 1.069-2.666 5.019-.007.059-.908 7.085-.894 19.702.015 13.155.386 17.351 1.161 21.303.09.461.476.983 1.037 1.139.114.025.185.037.196.039h.001z' fill='#455A64'/><path d='M69.317 68.982c.489-.281.885-.056.885.505 0 .56-.396 1.243-.885 1.525-.488.282-.884.057-.884-.504 0-.56.396-1.243.884-1.526' fill='#FFF'/><path d='M68.92 71.133c-.289 0-.487-.228-.487-.625 0-.56.396-1.243.884-1.526a.812.812 0 0 1 .397-.121c.289 0 .488.229.488.626 0 .56-.396 1.243-.885 1.525a.812.812 0 0 1-.397.121m.794-2.459a.976.976 0 0 0-.49.147c-.548.317-.978 1.058-.978 1.687 0 .486.271.812.674.812a.985.985 0 0 0 .491-.146c.548-.317.978-1.057.978-1.687 0-.486-.272-.813-.675-.813' fill='#8097A2'/><path d='M68.92 70.947c-.271 0-.299-.307-.299-.439 0-.491.361-1.116.79-1.363a.632.632 0 0 1 .303-.096c.272 0 .301.306.301.438 0 .491-.363 1.116-.791 1.364a.629.629 0 0 1-.304.096m.794-2.086a.812.812 0 0 0-.397.121c-.488.283-.884.966-.884 1.526 0 .397.198.625.487.625a.812.812 0 0 0 .397-.121c.489-.282.885-.965.885-1.525 0-.397-.199-.626-.488-.626' fill='#8097A2'/><path d='M69.444 85.35c.264-.152.477-.031.477.272 0 .303-.213.67-.477.822-.263.153-.477.031-.477-.271 0-.302.214-.671.477-.823' fill='#FFF'/><path d='M69.23 86.51c-.156 0-.263-.123-.263-.337 0-.302.214-.671.477-.823a.431.431 0 0 1 .214-.066c.156 0 .263.124.263.338 0 .303-.213.67-.477.822a.431.431 0 0 1-.214.066m.428-1.412c-.1 0-.203.029-.307.09-.32.185-.57.618-.57.985 0 .309.185.524.449.524a.63.63 0 0 0 .308-.09c.32-.185.57-.618.57-.985 0-.309-.185-.524-.45-.524' fill='#8097A2'/><path d='M69.23 86.322l-.076-.149c0-.235.179-.544.384-.661l.12-.041.076.151c0 .234-.179.542-.383.66l-.121.04m.428-1.038a.431.431 0 0 0-.214.066c-.263.152-.477.521-.477.823 0 .214.107.337.263.337a.431.431 0 0 0 .214-.066c.264-.152.477-.519.477-.822 0-.214-.107-.338-.263-.338' fill='#8097A2'/><path d='M139.278 7.769v43.667L72.208 90.16V46.493l67.07-38.724' fill='#455A64'/><path d='M72.083 90.375V46.421l.063-.036 67.257-38.831v43.954l-.062.036-67.258 38.831zm.25-43.811v43.38l66.821-38.579V7.985L72.333 46.564z' fill='#607D8B'/></g><path d='M125.737 88.647l-7.639 3.334V84l-11.459 4.713v8.269L99 100.315l13.369 3.646 13.368-15.314' fill='#455A64'/></g></svg>";
        function RotateInstructions() {
          this.loadIcon_();
          var overlay = document.createElement("div");
          var s = overlay.style;
          s.position = "fixed";
          s.top = 0;
          s.right = 0;
          s.bottom = 0;
          s.left = 0;
          s.backgroundColor = "gray";
          s.fontFamily = "sans-serif";
          s.zIndex = 1e6;
          var img = document.createElement("img");
          img.src = this.icon;
          var s = img.style;
          s.marginLeft = "25%";
          s.marginTop = "25%";
          s.width = "50%";
          overlay.appendChild(img);
          var text = document.createElement("div");
          var s = text.style;
          s.textAlign = "center";
          s.fontSize = "16px";
          s.lineHeight = "24px";
          s.margin = "24px 25%";
          s.width = "50%";
          text.innerHTML = "Place your phone into your Cardboard viewer.";
          overlay.appendChild(text);
          var snackbar = document.createElement("div");
          var s = snackbar.style;
          s.backgroundColor = "#CFD8DC";
          s.position = "fixed";
          s.bottom = 0;
          s.width = "100%";
          s.height = "48px";
          s.padding = "14px 24px";
          s.boxSizing = "border-box";
          s.color = "#656A6B";
          overlay.appendChild(snackbar);
          var snackbarText = document.createElement("div");
          snackbarText.style.float = "left";
          snackbarText.innerHTML = "No Cardboard viewer?";
          var snackbarButton = document.createElement("a");
          snackbarButton.href = "https://www.google.com/get/cardboard/get-cardboard/";
          snackbarButton.innerHTML = "get one";
          snackbarButton.target = "_blank";
          var s = snackbarButton.style;
          s.float = "right";
          s.fontWeight = 600;
          s.textTransform = "uppercase";
          s.borderLeft = "1px solid gray";
          s.paddingLeft = "24px";
          s.textDecoration = "none";
          s.color = "#656A6B";
          snackbar.appendChild(snackbarText);
          snackbar.appendChild(snackbarButton);
          this.overlay = overlay;
          this.text = text;
          this.hide();
        }
        RotateInstructions.prototype.show = function(parent) {
          if (!parent && !this.overlay.parentElement) {
            document.body.appendChild(this.overlay);
          } else if (parent) {
            if (this.overlay.parentElement && this.overlay.parentElement != parent)
              this.overlay.parentElement.removeChild(this.overlay);
            parent.appendChild(this.overlay);
          }
          this.overlay.style.display = "block";
          var img = this.overlay.querySelector("img");
          var s = img.style;
          if (isLandscapeMode()) {
            s.width = "20%";
            s.marginLeft = "40%";
            s.marginTop = "3%";
          } else {
            s.width = "50%";
            s.marginLeft = "25%";
            s.marginTop = "25%";
          }
        };
        RotateInstructions.prototype.hide = function() {
          this.overlay.style.display = "none";
        };
        RotateInstructions.prototype.showTemporarily = function(ms, parent) {
          this.show(parent);
          this.timer = setTimeout(this.hide.bind(this), ms);
        };
        RotateInstructions.prototype.disableShowTemporarily = function() {
          clearTimeout(this.timer);
        };
        RotateInstructions.prototype.update = function() {
          this.disableShowTemporarily();
          if (!isLandscapeMode() && isMobile2()) {
            this.show();
          } else {
            this.hide();
          }
        };
        RotateInstructions.prototype.loadIcon_ = function() {
          this.icon = dataUri("image/svg+xml", rotateInstructionsAsset);
        };
        var DEFAULT_VIEWER = "CardboardV1";
        var VIEWER_KEY = "WEBVR_CARDBOARD_VIEWER";
        var CLASS_NAME = "webvr-polyfill-viewer-selector";
        function ViewerSelector(defaultViewer) {
          try {
            this.selectedKey = localStorage.getItem(VIEWER_KEY);
          } catch (error) {
            console.error("Failed to load viewer profile: %s", error);
          }
          if (!this.selectedKey) {
            this.selectedKey = defaultViewer || DEFAULT_VIEWER;
          }
          this.dialog = this.createDialog_(DeviceInfo.Viewers);
          this.root = null;
          this.onChangeCallbacks_ = [];
        }
        ViewerSelector.prototype.show = function(root) {
          this.root = root;
          root.appendChild(this.dialog);
          var selected = this.dialog.querySelector("#" + this.selectedKey);
          selected.checked = true;
          this.dialog.style.display = "block";
        };
        ViewerSelector.prototype.hide = function() {
          if (this.root && this.root.contains(this.dialog)) {
            this.root.removeChild(this.dialog);
          }
          this.dialog.style.display = "none";
        };
        ViewerSelector.prototype.getCurrentViewer = function() {
          return DeviceInfo.Viewers[this.selectedKey];
        };
        ViewerSelector.prototype.getSelectedKey_ = function() {
          var input = this.dialog.querySelector("input[name=field]:checked");
          if (input) {
            return input.id;
          }
          return null;
        };
        ViewerSelector.prototype.onChange = function(cb) {
          this.onChangeCallbacks_.push(cb);
        };
        ViewerSelector.prototype.fireOnChange_ = function(viewer) {
          for (var i = 0; i < this.onChangeCallbacks_.length; i++) {
            this.onChangeCallbacks_[i](viewer);
          }
        };
        ViewerSelector.prototype.onSave_ = function() {
          this.selectedKey = this.getSelectedKey_();
          if (!this.selectedKey || !DeviceInfo.Viewers[this.selectedKey]) {
            console.error("ViewerSelector.onSave_: this should never happen!");
            return;
          }
          this.fireOnChange_(DeviceInfo.Viewers[this.selectedKey]);
          try {
            localStorage.setItem(VIEWER_KEY, this.selectedKey);
          } catch (error) {
            console.error("Failed to save viewer profile: %s", error);
          }
          this.hide();
        };
        ViewerSelector.prototype.createDialog_ = function(options) {
          var container = document.createElement("div");
          container.classList.add(CLASS_NAME);
          container.style.display = "none";
          var overlay = document.createElement("div");
          var s = overlay.style;
          s.position = "fixed";
          s.left = 0;
          s.top = 0;
          s.width = "100%";
          s.height = "100%";
          s.background = "rgba(0, 0, 0, 0.3)";
          overlay.addEventListener("click", this.hide.bind(this));
          var width = 280;
          var dialog = document.createElement("div");
          var s = dialog.style;
          s.boxSizing = "border-box";
          s.position = "fixed";
          s.top = "24px";
          s.left = "50%";
          s.marginLeft = -width / 2 + "px";
          s.width = width + "px";
          s.padding = "24px";
          s.overflow = "hidden";
          s.background = "#fafafa";
          s.fontFamily = "'Roboto', sans-serif";
          s.boxShadow = "0px 5px 20px #666";
          dialog.appendChild(this.createH1_("Select your viewer"));
          for (var id in options) {
            dialog.appendChild(this.createChoice_(id, options[id].label));
          }
          dialog.appendChild(this.createButton_("Save", this.onSave_.bind(this)));
          container.appendChild(overlay);
          container.appendChild(dialog);
          return container;
        };
        ViewerSelector.prototype.createH1_ = function(name) {
          var h1 = document.createElement("h1");
          var s = h1.style;
          s.color = "black";
          s.fontSize = "20px";
          s.fontWeight = "bold";
          s.marginTop = 0;
          s.marginBottom = "24px";
          h1.innerHTML = name;
          return h1;
        };
        ViewerSelector.prototype.createChoice_ = function(id, name) {
          var div2 = document.createElement("div");
          div2.style.marginTop = "8px";
          div2.style.color = "black";
          var input = document.createElement("input");
          input.style.fontSize = "30px";
          input.setAttribute("id", id);
          input.setAttribute("type", "radio");
          input.setAttribute("value", id);
          input.setAttribute("name", "field");
          var label = document.createElement("label");
          label.style.marginLeft = "4px";
          label.setAttribute("for", id);
          label.innerHTML = name;
          div2.appendChild(input);
          div2.appendChild(label);
          return div2;
        };
        ViewerSelector.prototype.createButton_ = function(label, onclick) {
          var button = document.createElement("button");
          button.innerHTML = label;
          var s = button.style;
          s.float = "right";
          s.textTransform = "uppercase";
          s.color = "#1094f7";
          s.fontSize = "14px";
          s.letterSpacing = 0;
          s.border = 0;
          s.background = "none";
          s.marginTop = "16px";
          button.addEventListener("click", onclick);
          return button;
        };
        var commonjsGlobal = typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
        function unwrapExports(x) {
          return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
        }
        function createCommonjsModule(fn, module2) {
          return module2 = { exports: {} }, fn(module2, module2.exports), module2.exports;
        }
        var NoSleep = createCommonjsModule(function(module2, exports2) {
          (function webpackUniversalModuleDefinition(root, factory) {
            module2.exports = factory();
          })(commonjsGlobal, function() {
            return function(modules) {
              var installedModules = {};
              function __webpack_require__(moduleId) {
                if (installedModules[moduleId]) {
                  return installedModules[moduleId].exports;
                }
                var module3 = installedModules[moduleId] = {
                  i: moduleId,
                  l: false,
                  exports: {}
                };
                modules[moduleId].call(module3.exports, module3, module3.exports, __webpack_require__);
                module3.l = true;
                return module3.exports;
              }
              __webpack_require__.m = modules;
              __webpack_require__.c = installedModules;
              __webpack_require__.d = function(exports3, name, getter) {
                if (!__webpack_require__.o(exports3, name)) {
                  Object.defineProperty(exports3, name, {
                    configurable: false,
                    enumerable: true,
                    get: getter
                  });
                }
              };
              __webpack_require__.n = function(module3) {
                var getter = module3 && module3.__esModule ? function getDefault() {
                  return module3["default"];
                } : function getModuleExports() {
                  return module3;
                };
                __webpack_require__.d(getter, "a", getter);
                return getter;
              };
              __webpack_require__.o = function(object, property) {
                return Object.prototype.hasOwnProperty.call(object, property);
              };
              __webpack_require__.p = "";
              return __webpack_require__(__webpack_require__.s = 0);
            }([
              function(module3, exports3, __webpack_require__) {
                "use strict";
                var _createClass = /* @__PURE__ */ function() {
                  function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                      var descriptor = props[i];
                      descriptor.enumerable = descriptor.enumerable || false;
                      descriptor.configurable = true;
                      if ("value" in descriptor)
                        descriptor.writable = true;
                      Object.defineProperty(target, descriptor.key, descriptor);
                    }
                  }
                  return function(Constructor, protoProps, staticProps) {
                    if (protoProps)
                      defineProperties(Constructor.prototype, protoProps);
                    if (staticProps)
                      defineProperties(Constructor, staticProps);
                    return Constructor;
                  };
                }();
                function _classCallCheck(instance, Constructor) {
                  if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                  }
                }
                var mediaFile = __webpack_require__(1);
                var oldIOS = typeof navigator !== "undefined" && parseFloat(("" + (/CPU.*OS ([0-9_]{3,4})[0-9_]{0,1}|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0, ""])[1]).replace("undefined", "3_2").replace("_", ".").replace("_", "")) < 10 && !window.MSStream;
                var NoSleep2 = function() {
                  function NoSleep3() {
                    _classCallCheck(this, NoSleep3);
                    if (oldIOS) {
                      this.noSleepTimer = null;
                    } else {
                      this.noSleepVideo = document.createElement("video");
                      this.noSleepVideo.setAttribute("playsinline", "");
                      this.noSleepVideo.setAttribute("src", mediaFile);
                      this.noSleepVideo.addEventListener("timeupdate", function(e) {
                        if (this.noSleepVideo.currentTime > 0.5) {
                          this.noSleepVideo.currentTime = Math.random();
                        }
                      }.bind(this));
                    }
                  }
                  _createClass(NoSleep3, [{
                    key: "enable",
                    value: function enable() {
                      if (oldIOS) {
                        this.disable();
                        this.noSleepTimer = window.setInterval(function() {
                          window.location.href = "/";
                          window.setTimeout(window.stop, 0);
                        }, 15e3);
                      } else {
                        this.noSleepVideo.play();
                      }
                    }
                  }, {
                    key: "disable",
                    value: function disable() {
                      if (oldIOS) {
                        if (this.noSleepTimer) {
                          window.clearInterval(this.noSleepTimer);
                          this.noSleepTimer = null;
                        }
                      } else {
                        this.noSleepVideo.pause();
                      }
                    }
                  }]);
                  return NoSleep3;
                }();
                module3.exports = NoSleep2;
              },
              function(module3, exports3, __webpack_require__) {
                "use strict";
                module3.exports = "data:video/mp4;base64,AAAAIGZ0eXBtcDQyAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAACKBtZGF0AAAC8wYF///v3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0MiByMjQ3OSBkZDc5YTYxIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNCAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTEgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MToweDExMSBtZT1oZXggc3VibWU9MiBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0wIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MCA4eDhkY3Q9MCBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0wIHRocmVhZHM9NiBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTMgYl9weXJhbWlkPTIgYl9hZGFwdD0xIGJfYmlhcz0wIGRpcmVjdD0xIHdlaWdodGI9MSBvcGVuX2dvcD0wIHdlaWdodHA9MSBrZXlpbnQ9MzAwIGtleWludF9taW49MzAgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD0xMCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIwLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IHZidl9tYXhyYXRlPTIwMDAwIHZidl9idWZzaXplPTI1MDAwIGNyZl9tYXg9MC4wIG5hbF9ocmQ9bm9uZSBmaWxsZXI9MCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAOWWIhAA3//p+C7v8tDDSTjf97w55i3SbRPO4ZY+hkjD5hbkAkL3zpJ6h/LR1CAABzgB1kqqzUorlhQAAAAxBmiQYhn/+qZYADLgAAAAJQZ5CQhX/AAj5IQADQGgcIQADQGgcAAAACQGeYUQn/wALKCEAA0BoHAAAAAkBnmNEJ/8ACykhAANAaBwhAANAaBwAAAANQZpoNExDP/6plgAMuSEAA0BoHAAAAAtBnoZFESwr/wAI+SEAA0BoHCEAA0BoHAAAAAkBnqVEJ/8ACykhAANAaBwAAAAJAZ6nRCf/AAsoIQADQGgcIQADQGgcAAAADUGarDRMQz/+qZYADLghAANAaBwAAAALQZ7KRRUsK/8ACPkhAANAaBwAAAAJAZ7pRCf/AAsoIQADQGgcIQADQGgcAAAACQGe60Qn/wALKCEAA0BoHAAAAA1BmvA0TEM//qmWAAy5IQADQGgcIQADQGgcAAAAC0GfDkUVLCv/AAj5IQADQGgcAAAACQGfLUQn/wALKSEAA0BoHCEAA0BoHAAAAAkBny9EJ/8ACyghAANAaBwAAAANQZs0NExDP/6plgAMuCEAA0BoHAAAAAtBn1JFFSwr/wAI+SEAA0BoHCEAA0BoHAAAAAkBn3FEJ/8ACyghAANAaBwAAAAJAZ9zRCf/AAsoIQADQGgcIQADQGgcAAAADUGbeDRMQz/+qZYADLkhAANAaBwAAAALQZ+WRRUsK/8ACPghAANAaBwhAANAaBwAAAAJAZ+1RCf/AAspIQADQGgcAAAACQGft0Qn/wALKSEAA0BoHCEAA0BoHAAAAA1Bm7w0TEM//qmWAAy4IQADQGgcAAAAC0Gf2kUVLCv/AAj5IQADQGgcAAAACQGf+UQn/wALKCEAA0BoHCEAA0BoHAAAAAkBn/tEJ/8ACykhAANAaBwAAAANQZvgNExDP/6plgAMuSEAA0BoHCEAA0BoHAAAAAtBnh5FFSwr/wAI+CEAA0BoHAAAAAkBnj1EJ/8ACyghAANAaBwhAANAaBwAAAAJAZ4/RCf/AAspIQADQGgcAAAADUGaJDRMQz/+qZYADLghAANAaBwAAAALQZ5CRRUsK/8ACPkhAANAaBwhAANAaBwAAAAJAZ5hRCf/AAsoIQADQGgcAAAACQGeY0Qn/wALKSEAA0BoHCEAA0BoHAAAAA1Bmmg0TEM//qmWAAy5IQADQGgcAAAAC0GehkUVLCv/AAj5IQADQGgcIQADQGgcAAAACQGepUQn/wALKSEAA0BoHAAAAAkBnqdEJ/8ACyghAANAaBwAAAANQZqsNExDP/6plgAMuCEAA0BoHCEAA0BoHAAAAAtBnspFFSwr/wAI+SEAA0BoHAAAAAkBnulEJ/8ACyghAANAaBwhAANAaBwAAAAJAZ7rRCf/AAsoIQADQGgcAAAADUGa8DRMQz/+qZYADLkhAANAaBwhAANAaBwAAAALQZ8ORRUsK/8ACPkhAANAaBwAAAAJAZ8tRCf/AAspIQADQGgcIQADQGgcAAAACQGfL0Qn/wALKCEAA0BoHAAAAA1BmzQ0TEM//qmWAAy4IQADQGgcAAAAC0GfUkUVLCv/AAj5IQADQGgcIQADQGgcAAAACQGfcUQn/wALKCEAA0BoHAAAAAkBn3NEJ/8ACyghAANAaBwhAANAaBwAAAANQZt4NExC//6plgAMuSEAA0BoHAAAAAtBn5ZFFSwr/wAI+CEAA0BoHCEAA0BoHAAAAAkBn7VEJ/8ACykhAANAaBwAAAAJAZ+3RCf/AAspIQADQGgcAAAADUGbuzRMQn/+nhAAYsAhAANAaBwhAANAaBwAAAAJQZ/aQhP/AAspIQADQGgcAAAACQGf+UQn/wALKCEAA0BoHCEAA0BoHCEAA0BoHCEAA0BoHCEAA0BoHCEAA0BoHAAACiFtb292AAAAbG12aGQAAAAA1YCCX9WAgl8AAAPoAAAH/AABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAGGlvZHMAAAAAEICAgAcAT////v7/AAAF+XRyYWsAAABcdGtoZAAAAAPVgIJf1YCCXwAAAAEAAAAAAAAH0AAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAygAAAMoAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAB9AAABdwAAEAAAAABXFtZGlhAAAAIG1kaGQAAAAA1YCCX9WAgl8AAV+QAAK/IFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAUcbWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAE3HN0YmwAAACYc3RzZAAAAAAAAAABAAAAiGF2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAygDKAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAyYXZjQwFNQCj/4QAbZ01AKOyho3ySTUBAQFAAAAMAEAAr8gDxgxlgAQAEaO+G8gAAABhzdHRzAAAAAAAAAAEAAAA8AAALuAAAABRzdHNzAAAAAAAAAAEAAAABAAAB8GN0dHMAAAAAAAAAPAAAAAEAABdwAAAAAQAAOpgAAAABAAAXcAAAAAEAAAAAAAAAAQAAC7gAAAABAAA6mAAAAAEAABdwAAAAAQAAAAAAAAABAAALuAAAAAEAADqYAAAAAQAAF3AAAAABAAAAAAAAAAEAAAu4AAAAAQAAOpgAAAABAAAXcAAAAAEAAAAAAAAAAQAAC7gAAAABAAA6mAAAAAEAABdwAAAAAQAAAAAAAAABAAALuAAAAAEAADqYAAAAAQAAF3AAAAABAAAAAAAAAAEAAAu4AAAAAQAAOpgAAAABAAAXcAAAAAEAAAAAAAAAAQAAC7gAAAABAAA6mAAAAAEAABdwAAAAAQAAAAAAAAABAAALuAAAAAEAADqYAAAAAQAAF3AAAAABAAAAAAAAAAEAAAu4AAAAAQAAOpgAAAABAAAXcAAAAAEAAAAAAAAAAQAAC7gAAAABAAA6mAAAAAEAABdwAAAAAQAAAAAAAAABAAALuAAAAAEAADqYAAAAAQAAF3AAAAABAAAAAAAAAAEAAAu4AAAAAQAAOpgAAAABAAAXcAAAAAEAAAAAAAAAAQAAC7gAAAABAAA6mAAAAAEAABdwAAAAAQAAAAAAAAABAAALuAAAAAEAAC7gAAAAAQAAF3AAAAABAAAAAAAAABxzdHNjAAAAAAAAAAEAAAABAAAAAQAAAAEAAAEEc3RzegAAAAAAAAAAAAAAPAAAAzQAAAAQAAAADQAAAA0AAAANAAAAEQAAAA8AAAANAAAADQAAABEAAAAPAAAADQAAAA0AAAARAAAADwAAAA0AAAANAAAAEQAAAA8AAAANAAAADQAAABEAAAAPAAAADQAAAA0AAAARAAAADwAAAA0AAAANAAAAEQAAAA8AAAANAAAADQAAABEAAAAPAAAADQAAAA0AAAARAAAADwAAAA0AAAANAAAAEQAAAA8AAAANAAAADQAAABEAAAAPAAAADQAAAA0AAAARAAAADwAAAA0AAAANAAAAEQAAAA8AAAANAAAADQAAABEAAAANAAAADQAAAQBzdGNvAAAAAAAAADwAAAAwAAADZAAAA3QAAAONAAADoAAAA7kAAAPQAAAD6wAAA/4AAAQXAAAELgAABEMAAARcAAAEbwAABIwAAAShAAAEugAABM0AAATkAAAE/wAABRIAAAUrAAAFQgAABV0AAAVwAAAFiQAABaAAAAW1AAAFzgAABeEAAAX+AAAGEwAABiwAAAY/AAAGVgAABnEAAAaEAAAGnQAABrQAAAbPAAAG4gAABvUAAAcSAAAHJwAAB0AAAAdTAAAHcAAAB4UAAAeeAAAHsQAAB8gAAAfjAAAH9gAACA8AAAgmAAAIQQAACFQAAAhnAAAIhAAACJcAAAMsdHJhawAAAFx0a2hkAAAAA9WAgl/VgIJfAAAAAgAAAAAAAAf8AAAAAAAAAAAAAAABAQAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAACsm1kaWEAAAAgbWRoZAAAAADVgIJf1YCCXwAArEQAAWAAVcQAAAAAACdoZGxyAAAAAAAAAABzb3VuAAAAAAAAAAAAAAAAU3RlcmVvAAAAAmNtaW5mAAAAEHNtaGQAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAidzdGJsAAAAZ3N0c2QAAAAAAAAAAQAAAFdtcDRhAAAAAAAAAAEAAAAAAAAAAAACABAAAAAArEQAAAAAADNlc2RzAAAAAAOAgIAiAAIABICAgBRAFQAAAAADDUAAAAAABYCAgAISEAaAgIABAgAAABhzdHRzAAAAAAAAAAEAAABYAAAEAAAAABxzdHNjAAAAAAAAAAEAAAABAAAAAQAAAAEAAAAUc3RzegAAAAAAAAAGAAAAWAAAAXBzdGNvAAAAAAAAAFgAAAOBAAADhwAAA5oAAAOtAAADswAAA8oAAAPfAAAD5QAAA/gAAAQLAAAEEQAABCgAAAQ9AAAEUAAABFYAAARpAAAEgAAABIYAAASbAAAErgAABLQAAATHAAAE3gAABPMAAAT5AAAFDAAABR8AAAUlAAAFPAAABVEAAAVXAAAFagAABX0AAAWDAAAFmgAABa8AAAXCAAAFyAAABdsAAAXyAAAF+AAABg0AAAYgAAAGJgAABjkAAAZQAAAGZQAABmsAAAZ+AAAGkQAABpcAAAauAAAGwwAABskAAAbcAAAG7wAABwYAAAcMAAAHIQAABzQAAAc6AAAHTQAAB2QAAAdqAAAHfwAAB5IAAAeYAAAHqwAAB8IAAAfXAAAH3QAAB/AAAAgDAAAICQAACCAAAAg1AAAIOwAACE4AAAhhAAAIeAAACH4AAAiRAAAIpAAACKoAAAiwAAAItgAACLwAAAjCAAAAFnVkdGEAAAAObmFtZVN0ZXJlbwAAAHB1ZHRhAAAAaG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAO2lsc3QAAAAzqXRvbwAAACtkYXRhAAAAAQAAAABIYW5kQnJha2UgMC4xMC4yIDIwMTUwNjExMDA=";
              }
            ]);
          });
        });
        var NoSleep$1 = unwrapExports(NoSleep);
        var nextDisplayId = 1e3;
        var defaultLeftBounds = [0, 0, 0.5, 1];
        var defaultRightBounds = [0.5, 0, 0.5, 1];
        var raf = window.requestAnimationFrame;
        var caf = window.cancelAnimationFrame;
        function VRFrameData() {
          this.leftProjectionMatrix = new Float32Array(16);
          this.leftViewMatrix = new Float32Array(16);
          this.rightProjectionMatrix = new Float32Array(16);
          this.rightViewMatrix = new Float32Array(16);
          this.pose = null;
        }
        function VRDisplayCapabilities(config3) {
          Object.defineProperties(this, {
            hasPosition: {
              writable: false,
              enumerable: true,
              value: config3.hasPosition
            },
            hasExternalDisplay: {
              writable: false,
              enumerable: true,
              value: config3.hasExternalDisplay
            },
            canPresent: {
              writable: false,
              enumerable: true,
              value: config3.canPresent
            },
            maxLayers: {
              writable: false,
              enumerable: true,
              value: config3.maxLayers
            },
            hasOrientation: {
              enumerable: true,
              get: function get() {
                deprecateWarning("VRDisplayCapabilities.prototype.hasOrientation", "VRDisplay.prototype.getFrameData");
                return config3.hasOrientation;
              }
            }
          });
        }
        function VRDisplay(config3) {
          config3 = config3 || {};
          var USE_WAKELOCK = "wakelock" in config3 ? config3.wakelock : true;
          this.isPolyfilled = true;
          this.displayId = nextDisplayId++;
          this.displayName = "";
          this.depthNear = 0.01;
          this.depthFar = 1e4;
          this.isPresenting = false;
          Object.defineProperty(this, "isConnected", {
            get: function get() {
              deprecateWarning("VRDisplay.prototype.isConnected", "VRDisplayCapabilities.prototype.hasExternalDisplay");
              return false;
            }
          });
          this.capabilities = new VRDisplayCapabilities({
            hasPosition: false,
            hasOrientation: false,
            hasExternalDisplay: false,
            canPresent: false,
            maxLayers: 1
          });
          this.stageParameters = null;
          this.waitingForPresent_ = false;
          this.layer_ = null;
          this.originalParent_ = null;
          this.fullscreenElement_ = null;
          this.fullscreenWrapper_ = null;
          this.fullscreenElementCachedStyle_ = null;
          this.fullscreenEventTarget_ = null;
          this.fullscreenChangeHandler_ = null;
          this.fullscreenErrorHandler_ = null;
          if (USE_WAKELOCK && isMobile2()) {
            this.wakelock_ = new NoSleep$1();
          }
        }
        VRDisplay.prototype.getFrameData = function(frameData) {
          return frameDataFromPose(frameData, this._getPose(), this);
        };
        VRDisplay.prototype.getPose = function() {
          deprecateWarning("VRDisplay.prototype.getPose", "VRDisplay.prototype.getFrameData");
          return this._getPose();
        };
        VRDisplay.prototype.resetPose = function() {
          deprecateWarning("VRDisplay.prototype.resetPose");
          return this._resetPose();
        };
        VRDisplay.prototype.getImmediatePose = function() {
          deprecateWarning("VRDisplay.prototype.getImmediatePose", "VRDisplay.prototype.getFrameData");
          return this._getPose();
        };
        VRDisplay.prototype.requestAnimationFrame = function(callback) {
          return raf(callback);
        };
        VRDisplay.prototype.cancelAnimationFrame = function(id) {
          return caf(id);
        };
        VRDisplay.prototype.wrapForFullscreen = function(element) {
          if (isIOS()) {
            return element;
          }
          if (!this.fullscreenWrapper_) {
            this.fullscreenWrapper_ = document.createElement("div");
            var cssProperties = ["height: " + Math.min(screen.height, screen.width) + "px !important", "top: 0 !important", "left: 0 !important", "right: 0 !important", "border: 0", "margin: 0", "padding: 0", "z-index: 999999 !important", "position: fixed"];
            this.fullscreenWrapper_.setAttribute("style", cssProperties.join("; ") + ";");
            this.fullscreenWrapper_.classList.add("webvr-polyfill-fullscreen-wrapper");
          }
          if (this.fullscreenElement_ == element) {
            return this.fullscreenWrapper_;
          }
          if (this.fullscreenElement_) {
            if (this.originalParent_) {
              this.originalParent_.appendChild(this.fullscreenElement_);
            } else {
              this.fullscreenElement_.parentElement.removeChild(this.fullscreenElement_);
            }
          }
          this.fullscreenElement_ = element;
          this.originalParent_ = element.parentElement;
          if (!this.originalParent_) {
            document.body.appendChild(element);
          }
          if (!this.fullscreenWrapper_.parentElement) {
            var parent = this.fullscreenElement_.parentElement;
            parent.insertBefore(this.fullscreenWrapper_, this.fullscreenElement_);
            parent.removeChild(this.fullscreenElement_);
          }
          this.fullscreenWrapper_.insertBefore(this.fullscreenElement_, this.fullscreenWrapper_.firstChild);
          this.fullscreenElementCachedStyle_ = this.fullscreenElement_.getAttribute("style");
          var self2 = this;
          function applyFullscreenElementStyle() {
            if (!self2.fullscreenElement_) {
              return;
            }
            var cssProperties2 = ["position: absolute", "top: 0", "left: 0", "width: " + Math.max(screen.width, screen.height) + "px", "height: " + Math.min(screen.height, screen.width) + "px", "border: 0", "margin: 0", "padding: 0"];
            self2.fullscreenElement_.setAttribute("style", cssProperties2.join("; ") + ";");
          }
          applyFullscreenElementStyle();
          return this.fullscreenWrapper_;
        };
        VRDisplay.prototype.removeFullscreenWrapper = function() {
          if (!this.fullscreenElement_) {
            return;
          }
          var element = this.fullscreenElement_;
          if (this.fullscreenElementCachedStyle_) {
            element.setAttribute("style", this.fullscreenElementCachedStyle_);
          } else {
            element.removeAttribute("style");
          }
          this.fullscreenElement_ = null;
          this.fullscreenElementCachedStyle_ = null;
          var parent = this.fullscreenWrapper_.parentElement;
          this.fullscreenWrapper_.removeChild(element);
          if (this.originalParent_ === parent) {
            parent.insertBefore(element, this.fullscreenWrapper_);
          } else if (this.originalParent_) {
            this.originalParent_.appendChild(element);
          }
          parent.removeChild(this.fullscreenWrapper_);
          return element;
        };
        VRDisplay.prototype.requestPresent = function(layers) {
          var wasPresenting = this.isPresenting;
          var self2 = this;
          if (!(layers instanceof Array)) {
            deprecateWarning("VRDisplay.prototype.requestPresent with non-array argument", "an array of VRLayers as the first argument");
            layers = [layers];
          }
          return new Promise(function(resolve, reject) {
            if (!self2.capabilities.canPresent) {
              reject(new Error("VRDisplay is not capable of presenting."));
              return;
            }
            if (layers.length == 0 || layers.length > self2.capabilities.maxLayers) {
              reject(new Error("Invalid number of layers."));
              return;
            }
            var incomingLayer = layers[0];
            if (!incomingLayer.source) {
              resolve();
              return;
            }
            var leftBounds = incomingLayer.leftBounds || defaultLeftBounds;
            var rightBounds = incomingLayer.rightBounds || defaultRightBounds;
            if (wasPresenting) {
              var layer = self2.layer_;
              if (layer.source !== incomingLayer.source) {
                layer.source = incomingLayer.source;
              }
              for (var i = 0; i < 4; i++) {
                layer.leftBounds[i] = leftBounds[i];
                layer.rightBounds[i] = rightBounds[i];
              }
              self2.wrapForFullscreen(self2.layer_.source);
              self2.updatePresent_();
              resolve();
              return;
            }
            self2.layer_ = {
              predistorted: incomingLayer.predistorted,
              source: incomingLayer.source,
              leftBounds: leftBounds.slice(0),
              rightBounds: rightBounds.slice(0)
            };
            self2.waitingForPresent_ = false;
            if (self2.layer_ && self2.layer_.source) {
              var fullscreenElement = self2.wrapForFullscreen(self2.layer_.source);
              var onFullscreenChange = function onFullscreenChange2() {
                var actualFullscreenElement = getFullscreenElement();
                self2.isPresenting = fullscreenElement === actualFullscreenElement;
                if (self2.isPresenting) {
                  if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock("landscape-primary").catch(function(error) {
                      console.error("screen.orientation.lock() failed due to", error.message);
                    });
                  }
                  self2.waitingForPresent_ = false;
                  self2.beginPresent_();
                  resolve();
                } else {
                  if (screen.orientation && screen.orientation.unlock) {
                    screen.orientation.unlock();
                  }
                  self2.removeFullscreenWrapper();
                  self2.disableWakeLock();
                  self2.endPresent_();
                  self2.removeFullscreenListeners_();
                }
                self2.fireVRDisplayPresentChange_();
              };
              var onFullscreenError = function onFullscreenError2() {
                if (!self2.waitingForPresent_) {
                  return;
                }
                self2.removeFullscreenWrapper();
                self2.removeFullscreenListeners_();
                self2.disableWakeLock();
                self2.waitingForPresent_ = false;
                self2.isPresenting = false;
                reject(new Error("Unable to present."));
              };
              self2.addFullscreenListeners_(fullscreenElement, onFullscreenChange, onFullscreenError);
              if (requestFullscreen(fullscreenElement)) {
                self2.enableWakeLock();
                self2.waitingForPresent_ = true;
              } else if (isIOS() || isWebViewAndroid()) {
                self2.enableWakeLock();
                self2.isPresenting = true;
                self2.beginPresent_();
                self2.fireVRDisplayPresentChange_();
                resolve();
              }
            }
            if (!self2.waitingForPresent_ && !isIOS()) {
              exitFullscreen();
              reject(new Error("Unable to present."));
            }
          });
        };
        VRDisplay.prototype.exitPresent = function() {
          var wasPresenting = this.isPresenting;
          var self2 = this;
          this.isPresenting = false;
          this.layer_ = null;
          this.disableWakeLock();
          return new Promise(function(resolve, reject) {
            if (wasPresenting) {
              if (!exitFullscreen() && isIOS()) {
                self2.endPresent_();
                self2.fireVRDisplayPresentChange_();
              }
              if (isWebViewAndroid()) {
                self2.removeFullscreenWrapper();
                self2.removeFullscreenListeners_();
                self2.endPresent_();
                self2.fireVRDisplayPresentChange_();
              }
              resolve();
            } else {
              reject(new Error("Was not presenting to VRDisplay."));
            }
          });
        };
        VRDisplay.prototype.getLayers = function() {
          if (this.layer_) {
            return [this.layer_];
          }
          return [];
        };
        VRDisplay.prototype.fireVRDisplayPresentChange_ = function() {
          var event = new CustomEvent("vrdisplaypresentchange", { detail: { display: this } });
          window.dispatchEvent(event);
        };
        VRDisplay.prototype.fireVRDisplayConnect_ = function() {
          var event = new CustomEvent("vrdisplayconnect", { detail: { display: this } });
          window.dispatchEvent(event);
        };
        VRDisplay.prototype.addFullscreenListeners_ = function(element, changeHandler, errorHandler) {
          this.removeFullscreenListeners_();
          this.fullscreenEventTarget_ = element;
          this.fullscreenChangeHandler_ = changeHandler;
          this.fullscreenErrorHandler_ = errorHandler;
          if (changeHandler) {
            if (document.fullscreenEnabled) {
              element.addEventListener("fullscreenchange", changeHandler, false);
            } else if (document.webkitFullscreenEnabled) {
              element.addEventListener("webkitfullscreenchange", changeHandler, false);
            } else if (document.mozFullScreenEnabled) {
              document.addEventListener("mozfullscreenchange", changeHandler, false);
            } else if (document.msFullscreenEnabled) {
              element.addEventListener("msfullscreenchange", changeHandler, false);
            }
          }
          if (errorHandler) {
            if (document.fullscreenEnabled) {
              element.addEventListener("fullscreenerror", errorHandler, false);
            } else if (document.webkitFullscreenEnabled) {
              element.addEventListener("webkitfullscreenerror", errorHandler, false);
            } else if (document.mozFullScreenEnabled) {
              document.addEventListener("mozfullscreenerror", errorHandler, false);
            } else if (document.msFullscreenEnabled) {
              element.addEventListener("msfullscreenerror", errorHandler, false);
            }
          }
        };
        VRDisplay.prototype.removeFullscreenListeners_ = function() {
          if (!this.fullscreenEventTarget_)
            return;
          var element = this.fullscreenEventTarget_;
          if (this.fullscreenChangeHandler_) {
            var changeHandler = this.fullscreenChangeHandler_;
            element.removeEventListener("fullscreenchange", changeHandler, false);
            element.removeEventListener("webkitfullscreenchange", changeHandler, false);
            document.removeEventListener("mozfullscreenchange", changeHandler, false);
            element.removeEventListener("msfullscreenchange", changeHandler, false);
          }
          if (this.fullscreenErrorHandler_) {
            var errorHandler = this.fullscreenErrorHandler_;
            element.removeEventListener("fullscreenerror", errorHandler, false);
            element.removeEventListener("webkitfullscreenerror", errorHandler, false);
            document.removeEventListener("mozfullscreenerror", errorHandler, false);
            element.removeEventListener("msfullscreenerror", errorHandler, false);
          }
          this.fullscreenEventTarget_ = null;
          this.fullscreenChangeHandler_ = null;
          this.fullscreenErrorHandler_ = null;
        };
        VRDisplay.prototype.enableWakeLock = function() {
          if (this.wakelock_) {
            this.wakelock_.enable();
          }
        };
        VRDisplay.prototype.disableWakeLock = function() {
          if (this.wakelock_) {
            this.wakelock_.disable();
          }
        };
        VRDisplay.prototype.beginPresent_ = function() {
        };
        VRDisplay.prototype.endPresent_ = function() {
        };
        VRDisplay.prototype.submitFrame = function(pose) {
        };
        VRDisplay.prototype.getEyeParameters = function(whichEye) {
          return null;
        };
        var config2 = {
          ADDITIONAL_VIEWERS: [],
          DEFAULT_VIEWER: "",
          MOBILE_WAKE_LOCK: true,
          DEBUG: false,
          DPDB_URL: "https://dpdb.webvr.rocks/dpdb.json",
          K_FILTER: 0.98,
          PREDICTION_TIME_S: 0.04,
          CARDBOARD_UI_DISABLED: false,
          ROTATE_INSTRUCTIONS_DISABLED: false,
          YAW_ONLY: false,
          BUFFER_SCALE: 0.5,
          DIRTY_SUBMIT_FRAME_BINDINGS: false
        };
        var Eye = {
          LEFT: "left",
          RIGHT: "right"
        };
        function CardboardVRDisplay2(config$$1) {
          var defaults = extend({}, config2);
          config$$1 = extend(defaults, config$$1 || {});
          VRDisplay.call(this, {
            wakelock: config$$1.MOBILE_WAKE_LOCK
          });
          this.config = config$$1;
          this.displayName = "Cardboard VRDisplay";
          this.capabilities = new VRDisplayCapabilities({
            hasPosition: false,
            hasOrientation: true,
            hasExternalDisplay: false,
            canPresent: true,
            maxLayers: 1
          });
          this.stageParameters = null;
          this.bufferScale_ = this.config.BUFFER_SCALE;
          this.poseSensor_ = new PoseSensor(this.config);
          this.distorter_ = null;
          this.cardboardUI_ = null;
          this.dpdb_ = new Dpdb(this.config.DPDB_URL, this.onDeviceParamsUpdated_.bind(this));
          this.deviceInfo_ = new DeviceInfo(this.dpdb_.getDeviceParams(), config$$1.ADDITIONAL_VIEWERS);
          this.viewerSelector_ = new ViewerSelector(config$$1.DEFAULT_VIEWER);
          this.viewerSelector_.onChange(this.onViewerChanged_.bind(this));
          this.deviceInfo_.setViewer(this.viewerSelector_.getCurrentViewer());
          if (!this.config.ROTATE_INSTRUCTIONS_DISABLED) {
            this.rotateInstructions_ = new RotateInstructions();
          }
          if (isIOS()) {
            window.addEventListener("resize", this.onResize_.bind(this));
          }
        }
        CardboardVRDisplay2.prototype = Object.create(VRDisplay.prototype);
        CardboardVRDisplay2.prototype._getPose = function() {
          return {
            position: null,
            orientation: this.poseSensor_.getOrientation(),
            linearVelocity: null,
            linearAcceleration: null,
            angularVelocity: null,
            angularAcceleration: null
          };
        };
        CardboardVRDisplay2.prototype._resetPose = function() {
          if (this.poseSensor_.resetPose) {
            this.poseSensor_.resetPose();
          }
        };
        CardboardVRDisplay2.prototype._getFieldOfView = function(whichEye) {
          var fieldOfView;
          if (whichEye == Eye.LEFT) {
            fieldOfView = this.deviceInfo_.getFieldOfViewLeftEye();
          } else if (whichEye == Eye.RIGHT) {
            fieldOfView = this.deviceInfo_.getFieldOfViewRightEye();
          } else {
            console.error("Invalid eye provided: %s", whichEye);
            return null;
          }
          return fieldOfView;
        };
        CardboardVRDisplay2.prototype._getEyeOffset = function(whichEye) {
          var offset;
          if (whichEye == Eye.LEFT) {
            offset = [-this.deviceInfo_.viewer.interLensDistance * 0.5, 0, 0];
          } else if (whichEye == Eye.RIGHT) {
            offset = [this.deviceInfo_.viewer.interLensDistance * 0.5, 0, 0];
          } else {
            console.error("Invalid eye provided: %s", whichEye);
            return null;
          }
          return offset;
        };
        CardboardVRDisplay2.prototype.getEyeParameters = function(whichEye) {
          var offset = this._getEyeOffset(whichEye);
          var fieldOfView = this._getFieldOfView(whichEye);
          var eyeParams = {
            offset,
            renderWidth: this.deviceInfo_.device.width * 0.5 * this.bufferScale_,
            renderHeight: this.deviceInfo_.device.height * this.bufferScale_
          };
          Object.defineProperty(eyeParams, "fieldOfView", {
            enumerable: true,
            get: function get() {
              deprecateWarning("VRFieldOfView", "VRFrameData's projection matrices");
              return fieldOfView;
            }
          });
          return eyeParams;
        };
        CardboardVRDisplay2.prototype.onDeviceParamsUpdated_ = function(newParams) {
          if (this.config.DEBUG) {
            console.log("DPDB reported that device params were updated.");
          }
          this.deviceInfo_.updateDeviceParams(newParams);
          if (this.distorter_) {
            this.distorter_.updateDeviceInfo(this.deviceInfo_);
          }
        };
        CardboardVRDisplay2.prototype.updateBounds_ = function() {
          if (this.layer_ && this.distorter_ && (this.layer_.leftBounds || this.layer_.rightBounds)) {
            this.distorter_.setTextureBounds(this.layer_.leftBounds, this.layer_.rightBounds);
          }
        };
        CardboardVRDisplay2.prototype.beginPresent_ = function() {
          var gl = this.layer_.source.getContext("webgl");
          if (!gl)
            gl = this.layer_.source.getContext("experimental-webgl");
          if (!gl)
            gl = this.layer_.source.getContext("webgl2");
          if (!gl)
            return;
          if (this.layer_.predistorted) {
            if (!this.config.CARDBOARD_UI_DISABLED) {
              gl.canvas.width = getScreenWidth() * this.bufferScale_;
              gl.canvas.height = getScreenHeight() * this.bufferScale_;
              this.cardboardUI_ = new CardboardUI(gl);
            }
          } else {
            if (!this.config.CARDBOARD_UI_DISABLED) {
              this.cardboardUI_ = new CardboardUI(gl);
            }
            this.distorter_ = new CardboardDistorter(gl, this.cardboardUI_, this.config.BUFFER_SCALE, this.config.DIRTY_SUBMIT_FRAME_BINDINGS);
            this.distorter_.updateDeviceInfo(this.deviceInfo_);
          }
          if (this.cardboardUI_) {
            this.cardboardUI_.listen(function(e) {
              this.viewerSelector_.show(this.layer_.source.parentElement);
              e.stopPropagation();
              e.preventDefault();
            }.bind(this), function(e) {
              this.exitPresent();
              e.stopPropagation();
              e.preventDefault();
            }.bind(this));
          }
          if (this.rotateInstructions_) {
            if (isLandscapeMode() && isMobile2()) {
              this.rotateInstructions_.showTemporarily(3e3, this.layer_.source.parentElement);
            } else {
              this.rotateInstructions_.update();
            }
          }
          this.orientationHandler = this.onOrientationChange_.bind(this);
          window.addEventListener("orientationchange", this.orientationHandler);
          this.vrdisplaypresentchangeHandler = this.updateBounds_.bind(this);
          window.addEventListener("vrdisplaypresentchange", this.vrdisplaypresentchangeHandler);
          this.fireVRDisplayDeviceParamsChange_();
        };
        CardboardVRDisplay2.prototype.endPresent_ = function() {
          if (this.distorter_) {
            this.distorter_.destroy();
            this.distorter_ = null;
          }
          if (this.cardboardUI_) {
            this.cardboardUI_.destroy();
            this.cardboardUI_ = null;
          }
          if (this.rotateInstructions_) {
            this.rotateInstructions_.hide();
          }
          this.viewerSelector_.hide();
          window.removeEventListener("orientationchange", this.orientationHandler);
          window.removeEventListener("vrdisplaypresentchange", this.vrdisplaypresentchangeHandler);
        };
        CardboardVRDisplay2.prototype.updatePresent_ = function() {
          this.endPresent_();
          this.beginPresent_();
        };
        CardboardVRDisplay2.prototype.submitFrame = function(pose) {
          if (this.distorter_) {
            this.updateBounds_();
            this.distorter_.submitFrame();
          } else if (this.cardboardUI_ && this.layer_) {
            var gl = this.layer_.source.getContext("webgl");
            if (!gl)
              gl = this.layer_.source.getContext("experimental-webgl");
            if (!gl)
              gl = this.layer_.source.getContext("webgl2");
            var canvas = gl.canvas;
            if (canvas.width != this.lastWidth || canvas.height != this.lastHeight) {
              this.cardboardUI_.onResize();
            }
            this.lastWidth = canvas.width;
            this.lastHeight = canvas.height;
            this.cardboardUI_.render();
          }
        };
        CardboardVRDisplay2.prototype.onOrientationChange_ = function(e) {
          this.viewerSelector_.hide();
          if (this.rotateInstructions_) {
            this.rotateInstructions_.update();
          }
          this.onResize_();
        };
        CardboardVRDisplay2.prototype.onResize_ = function(e) {
          if (this.layer_) {
            var gl = this.layer_.source.getContext("webgl");
            if (!gl)
              gl = this.layer_.source.getContext("experimental-webgl");
            if (!gl)
              gl = this.layer_.source.getContext("webgl2");
            var cssProperties = [
              "position: absolute",
              "top: 0",
              "left: 0",
              "width: 100vw",
              "height: 100vh",
              "border: 0",
              "margin: 0",
              "padding: 0px",
              "box-sizing: content-box"
            ];
            gl.canvas.setAttribute("style", cssProperties.join("; ") + ";");
            safariCssSizeWorkaround(gl.canvas);
          }
        };
        CardboardVRDisplay2.prototype.onViewerChanged_ = function(viewer) {
          this.deviceInfo_.setViewer(viewer);
          if (this.distorter_) {
            this.distorter_.updateDeviceInfo(this.deviceInfo_);
          }
          this.fireVRDisplayDeviceParamsChange_();
        };
        CardboardVRDisplay2.prototype.fireVRDisplayDeviceParamsChange_ = function() {
          var event = new CustomEvent("vrdisplaydeviceparamschange", {
            detail: {
              vrdisplay: this,
              deviceInfo: this.deviceInfo_
            }
          });
          window.dispatchEvent(event);
        };
        CardboardVRDisplay2.VRFrameData = VRFrameData;
        CardboardVRDisplay2.VRDisplay = VRDisplay;
        return CardboardVRDisplay2;
      });
    }
  });

  // node_modules/webxr-polyfill/src/lib/global.js
  var _global = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};
  var global_default = _global;

  // node_modules/webxr-polyfill/src/lib/EventTarget.js
  var PRIVATE = Symbol("@@webxr-polyfill/EventTarget");
  var EventTarget = class {
    constructor() {
      this[PRIVATE] = {
        listeners: /* @__PURE__ */ new Map()
      };
    }
    /**
     * @param {string} type
     * @param {Function} listener
     */
    addEventListener(type, listener) {
      if (typeof type !== "string") {
        throw new Error("`type` must be a string");
      }
      if (typeof listener !== "function") {
        throw new Error("`listener` must be a function");
      }
      const typedListeners = this[PRIVATE].listeners.get(type) || [];
      typedListeners.push(listener);
      this[PRIVATE].listeners.set(type, typedListeners);
    }
    /**
     * @param {string} type
     * @param {Function} listener
     */
    removeEventListener(type, listener) {
      if (typeof type !== "string") {
        throw new Error("`type` must be a string");
      }
      if (typeof listener !== "function") {
        throw new Error("`listener` must be a function");
      }
      const typedListeners = this[PRIVATE].listeners.get(type) || [];
      for (let i = typedListeners.length; i >= 0; i--) {
        if (typedListeners[i] === listener) {
          typedListeners.pop();
        }
      }
    }
    /**
     * @param {string} type
     * @param {object} event
     */
    dispatchEvent(type, event) {
      const typedListeners = this[PRIVATE].listeners.get(type) || [];
      const queue = [];
      for (let i = 0; i < typedListeners.length; i++) {
        queue[i] = typedListeners[i];
      }
      for (let listener of queue) {
        listener(event);
      }
      if (typeof this[`on${type}`] === "function") {
        this[`on${type}`](event);
      }
    }
  };

  // node_modules/webxr-polyfill/node_modules/gl-matrix/src/gl-matrix/common.js
  var EPSILON = 1e-6;
  var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
  var degree = Math.PI / 180;

  // node_modules/webxr-polyfill/node_modules/gl-matrix/src/gl-matrix/mat4.js
  function create() {
    let out = new ARRAY_TYPE(16);
    if (ARRAY_TYPE != Float32Array) {
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
    }
    out[0] = 1;
    out[5] = 1;
    out[10] = 1;
    out[15] = 1;
    return out;
  }
  function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
  }
  function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  function invert(out, a) {
    let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    let b00 = a00 * a11 - a01 * a10;
    let b01 = a00 * a12 - a02 * a10;
    let b02 = a00 * a13 - a03 * a10;
    let b03 = a01 * a12 - a02 * a11;
    let b04 = a01 * a13 - a03 * a11;
    let b05 = a02 * a13 - a03 * a12;
    let b06 = a20 * a31 - a21 * a30;
    let b07 = a20 * a32 - a22 * a30;
    let b08 = a20 * a33 - a23 * a30;
    let b09 = a21 * a32 - a22 * a31;
    let b10 = a21 * a33 - a23 * a31;
    let b11 = a22 * a33 - a23 * a32;
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) {
      return null;
    }
    det = 1 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  }
  function multiply(out, a, b) {
    let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
  }
  function fromRotationTranslation(out, q, v) {
    let x = q[0], y = q[1], z = q[2], w = q[3];
    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;
    let xx = x * x2;
    let xy = x * y2;
    let xz = x * z2;
    let yy = y * y2;
    let yz = y * z2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;
    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
  }
  function getTranslation(out, mat) {
    out[0] = mat[12];
    out[1] = mat[13];
    out[2] = mat[14];
    return out;
  }
  function getRotation(out, mat) {
    let trace = mat[0] + mat[5] + mat[10];
    let S = 0;
    if (trace > 0) {
      S = Math.sqrt(trace + 1) * 2;
      out[3] = 0.25 * S;
      out[0] = (mat[6] - mat[9]) / S;
      out[1] = (mat[8] - mat[2]) / S;
      out[2] = (mat[1] - mat[4]) / S;
    } else if (mat[0] > mat[5] && mat[0] > mat[10]) {
      S = Math.sqrt(1 + mat[0] - mat[5] - mat[10]) * 2;
      out[3] = (mat[6] - mat[9]) / S;
      out[0] = 0.25 * S;
      out[1] = (mat[1] + mat[4]) / S;
      out[2] = (mat[8] + mat[2]) / S;
    } else if (mat[5] > mat[10]) {
      S = Math.sqrt(1 + mat[5] - mat[0] - mat[10]) * 2;
      out[3] = (mat[8] - mat[2]) / S;
      out[0] = (mat[1] + mat[4]) / S;
      out[1] = 0.25 * S;
      out[2] = (mat[6] + mat[9]) / S;
    } else {
      S = Math.sqrt(1 + mat[10] - mat[0] - mat[5]) * 2;
      out[3] = (mat[1] - mat[4]) / S;
      out[0] = (mat[8] + mat[2]) / S;
      out[1] = (mat[6] + mat[9]) / S;
      out[2] = 0.25 * S;
    }
    return out;
  }
  function perspective(out, fovy, aspect, near, far) {
    let f = 1 / Math.tan(fovy / 2), nf;
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;
    if (far != null && far !== Infinity) {
      nf = 1 / (near - far);
      out[10] = (far + near) * nf;
      out[14] = 2 * far * near * nf;
    } else {
      out[10] = -1;
      out[14] = -2 * near;
    }
    return out;
  }

  // node_modules/webxr-polyfill/node_modules/gl-matrix/src/gl-matrix/vec3.js
  function create2() {
    let out = new ARRAY_TYPE(3);
    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
    }
    return out;
  }
  function clone(a) {
    var out = new ARRAY_TYPE(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
  }
  function length(a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    return Math.sqrt(x * x + y * y + z * z);
  }
  function fromValues(x, y, z) {
    let out = new ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
  }
  function copy2(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
  }
  function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
  }
  function scale(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
  }
  function normalize(out, a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    let len3 = x * x + y * y + z * z;
    if (len3 > 0) {
      len3 = 1 / Math.sqrt(len3);
      out[0] = a[0] * len3;
      out[1] = a[1] * len3;
      out[2] = a[2] * len3;
    }
    return out;
  }
  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  function cross(out, a, b) {
    let ax = a[0], ay = a[1], az = a[2];
    let bx = b[0], by = b[1], bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  }
  function transformQuat(out, a, q) {
    let qx = q[0], qy = q[1], qz = q[2], qw = q[3];
    let x = a[0], y = a[1], z = a[2];
    let uvx = qy * z - qz * y, uvy = qz * x - qx * z, uvz = qx * y - qy * x;
    let uuvx = qy * uvz - qz * uvy, uuvy = qz * uvx - qx * uvz, uuvz = qx * uvy - qy * uvx;
    let w2 = qw * 2;
    uvx *= w2;
    uvy *= w2;
    uvz *= w2;
    uuvx *= 2;
    uuvy *= 2;
    uuvz *= 2;
    out[0] = x + uvx + uuvx;
    out[1] = y + uvy + uuvy;
    out[2] = z + uvz + uuvz;
    return out;
  }
  function angle(a, b) {
    let tempA = fromValues(a[0], a[1], a[2]);
    let tempB = fromValues(b[0], b[1], b[2]);
    normalize(tempA, tempA);
    normalize(tempB, tempB);
    let cosine = dot(tempA, tempB);
    if (cosine > 1) {
      return 0;
    } else if (cosine < -1) {
      return Math.PI;
    } else {
      return Math.acos(cosine);
    }
  }
  var len = length;
  var forEach = function() {
    let vec = create2();
    return function(a, stride, offset, count, fn, arg) {
      let i, l;
      if (!stride) {
        stride = 3;
      }
      if (!offset) {
        offset = 0;
      }
      if (count) {
        l = Math.min(count * stride + offset, a.length);
      } else {
        l = a.length;
      }
      for (i = offset; i < l; i += stride) {
        vec[0] = a[i];
        vec[1] = a[i + 1];
        vec[2] = a[i + 2];
        fn(vec, vec, arg);
        a[i] = vec[0];
        a[i + 1] = vec[1];
        a[i + 2] = vec[2];
      }
      return a;
    };
  }();

  // node_modules/webxr-polyfill/node_modules/gl-matrix/src/gl-matrix/mat3.js
  function create3() {
    let out = new ARRAY_TYPE(9);
    if (ARRAY_TYPE != Float32Array) {
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[5] = 0;
      out[6] = 0;
      out[7] = 0;
    }
    out[0] = 1;
    out[4] = 1;
    out[8] = 1;
    return out;
  }

  // node_modules/webxr-polyfill/node_modules/gl-matrix/src/gl-matrix/vec4.js
  function create4() {
    let out = new ARRAY_TYPE(4);
    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
    }
    return out;
  }
  function clone2(a) {
    let out = new ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
  }
  function fromValues2(x, y, z, w) {
    let out = new ARRAY_TYPE(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
  }
  function copy3(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
  }
  function normalize2(out, a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    let w = a[3];
    let len3 = x * x + y * y + z * z + w * w;
    if (len3 > 0) {
      len3 = 1 / Math.sqrt(len3);
      out[0] = x * len3;
      out[1] = y * len3;
      out[2] = z * len3;
      out[3] = w * len3;
    }
    return out;
  }
  var forEach2 = function() {
    let vec = create4();
    return function(a, stride, offset, count, fn, arg) {
      let i, l;
      if (!stride) {
        stride = 4;
      }
      if (!offset) {
        offset = 0;
      }
      if (count) {
        l = Math.min(count * stride + offset, a.length);
      } else {
        l = a.length;
      }
      for (i = offset; i < l; i += stride) {
        vec[0] = a[i];
        vec[1] = a[i + 1];
        vec[2] = a[i + 2];
        vec[3] = a[i + 3];
        fn(vec, vec, arg);
        a[i] = vec[0];
        a[i + 1] = vec[1];
        a[i + 2] = vec[2];
        a[i + 3] = vec[3];
      }
      return a;
    };
  }();

  // node_modules/webxr-polyfill/node_modules/gl-matrix/src/gl-matrix/quat.js
  function create5() {
    let out = new ARRAY_TYPE(4);
    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
    }
    out[3] = 1;
    return out;
  }
  function setAxisAngle(out, axis, rad) {
    rad = rad * 0.5;
    let s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
  }
  function multiply2(out, a, b) {
    let ax = a[0], ay = a[1], az = a[2], aw = a[3];
    let bx = b[0], by = b[1], bz = b[2], bw = b[3];
    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
  }
  function slerp(out, a, b, t) {
    let ax = a[0], ay = a[1], az = a[2], aw = a[3];
    let bx = b[0], by = b[1], bz = b[2], bw = b[3];
    let omega, cosom, sinom, scale0, scale1;
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    if (cosom < 0) {
      cosom = -cosom;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    }
    if (1 - cosom > EPSILON) {
      omega = Math.acos(cosom);
      sinom = Math.sin(omega);
      scale0 = Math.sin((1 - t) * omega) / sinom;
      scale1 = Math.sin(t * omega) / sinom;
    } else {
      scale0 = 1 - t;
      scale1 = t;
    }
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;
    return out;
  }
  function invert2(out, a) {
    let a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    let dot4 = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
    let invDot = dot4 ? 1 / dot4 : 0;
    out[0] = -a0 * invDot;
    out[1] = -a1 * invDot;
    out[2] = -a2 * invDot;
    out[3] = a3 * invDot;
    return out;
  }
  function fromMat3(out, m) {
    let fTrace = m[0] + m[4] + m[8];
    let fRoot;
    if (fTrace > 0) {
      fRoot = Math.sqrt(fTrace + 1);
      out[3] = 0.5 * fRoot;
      fRoot = 0.5 / fRoot;
      out[0] = (m[5] - m[7]) * fRoot;
      out[1] = (m[6] - m[2]) * fRoot;
      out[2] = (m[1] - m[3]) * fRoot;
    } else {
      let i = 0;
      if (m[4] > m[0])
        i = 1;
      if (m[8] > m[i * 3 + i])
        i = 2;
      let j = (i + 1) % 3;
      let k = (i + 2) % 3;
      fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1);
      out[i] = 0.5 * fRoot;
      fRoot = 0.5 / fRoot;
      out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
      out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
      out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
    }
    return out;
  }
  function fromEuler(out, x, y, z) {
    let halfToRad = 0.5 * Math.PI / 180;
    x *= halfToRad;
    y *= halfToRad;
    z *= halfToRad;
    let sx = Math.sin(x);
    let cx = Math.cos(x);
    let sy = Math.sin(y);
    let cy = Math.cos(y);
    let sz = Math.sin(z);
    let cz = Math.cos(z);
    out[0] = sx * cy * cz - cx * sy * sz;
    out[1] = cx * sy * cz + sx * cy * sz;
    out[2] = cx * cy * sz - sx * sy * cz;
    out[3] = cx * cy * cz + sx * sy * sz;
    return out;
  }
  var clone3 = clone2;
  var fromValues3 = fromValues2;
  var copy4 = copy3;
  var normalize3 = normalize2;
  var rotationTo = function() {
    let tmpvec3 = create2();
    let xUnitVec3 = fromValues(1, 0, 0);
    let yUnitVec3 = fromValues(0, 1, 0);
    return function(out, a, b) {
      let dot4 = dot(a, b);
      if (dot4 < -0.999999) {
        cross(tmpvec3, xUnitVec3, a);
        if (len(tmpvec3) < 1e-6)
          cross(tmpvec3, yUnitVec3, a);
        normalize(tmpvec3, tmpvec3);
        setAxisAngle(out, tmpvec3, Math.PI);
        return out;
      } else if (dot4 > 0.999999) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        return out;
      } else {
        cross(tmpvec3, a, b);
        out[0] = tmpvec3[0];
        out[1] = tmpvec3[1];
        out[2] = tmpvec3[2];
        out[3] = 1 + dot4;
        return normalize3(out, out);
      }
    };
  }();
  var sqlerp = function() {
    let temp1 = create5();
    let temp2 = create5();
    return function(out, a, b, c, d, t) {
      slerp(temp1, a, d, t);
      slerp(temp2, b, c, t);
      slerp(out, temp1, temp2, 2 * t * (1 - t));
      return out;
    };
  }();
  var setAxes = function() {
    let matr = create3();
    return function(out, view, right, up) {
      matr[0] = right[0];
      matr[3] = right[1];
      matr[6] = right[2];
      matr[1] = up[0];
      matr[4] = up[1];
      matr[7] = up[2];
      matr[2] = -view[0];
      matr[5] = -view[1];
      matr[8] = -view[2];
      return normalize3(out, fromMat3(out, matr));
    };
  }();

  // node_modules/webxr-polyfill/src/api/XRRigidTransform.js
  var PRIVATE2 = Symbol("@@webxr-polyfill/XRRigidTransform");
  var XRRigidTransform2 = class _XRRigidTransform {
    // no arguments: identity transform
    // (Float32Array): transform based on matrix
    // (DOMPointReadOnly): transform based on position without any rotation
    // (DOMPointReadOnly, DOMPointReadOnly): transform based on position and
    // orientation quaternion
    constructor() {
      this[PRIVATE2] = {
        matrix: null,
        position: null,
        orientation: null,
        inverse: null
      };
      if (arguments.length === 0) {
        this[PRIVATE2].matrix = identity(new Float32Array(16));
      } else if (arguments.length === 1) {
        if (arguments[0] instanceof Float32Array) {
          this[PRIVATE2].matrix = arguments[0];
        } else {
          this[PRIVATE2].position = this._getPoint(arguments[0]);
          this[PRIVATE2].orientation = DOMPointReadOnly.fromPoint({
            x: 0,
            y: 0,
            z: 0,
            w: 1
          });
        }
      } else if (arguments.length === 2) {
        this[PRIVATE2].position = this._getPoint(arguments[0]);
        this[PRIVATE2].orientation = this._getPoint(arguments[1]);
      } else {
        throw new Error("Too many arguments!");
      }
      if (this[PRIVATE2].matrix) {
        let position = create2();
        getTranslation(position, this[PRIVATE2].matrix);
        this[PRIVATE2].position = DOMPointReadOnly.fromPoint({
          x: position[0],
          y: position[1],
          z: position[2]
        });
        let orientation = create5();
        getRotation(orientation, this[PRIVATE2].matrix);
        this[PRIVATE2].orientation = DOMPointReadOnly.fromPoint({
          x: orientation[0],
          y: orientation[1],
          z: orientation[2],
          w: orientation[3]
        });
      } else {
        this[PRIVATE2].matrix = identity(new Float32Array(16));
        fromRotationTranslation(
          this[PRIVATE2].matrix,
          fromValues3(
            this[PRIVATE2].orientation.x,
            this[PRIVATE2].orientation.y,
            this[PRIVATE2].orientation.z,
            this[PRIVATE2].orientation.w
          ),
          fromValues(
            this[PRIVATE2].position.x,
            this[PRIVATE2].position.y,
            this[PRIVATE2].position.z
          )
        );
      }
    }
    /**
     * Try to convert arg to a DOMPointReadOnly if it isn't already one.
     * @param {*} arg
     * @return {DOMPointReadOnly}
     */
    _getPoint(arg) {
      if (arg instanceof DOMPointReadOnly) {
        return arg;
      }
      return DOMPointReadOnly.fromPoint(arg);
    }
    /**
     * @return {Float32Array}
     */
    get matrix() {
      return this[PRIVATE2].matrix;
    }
    /**
     * @return {DOMPointReadOnly}
     */
    get position() {
      return this[PRIVATE2].position;
    }
    /**
     * @return {DOMPointReadOnly}
     */
    get orientation() {
      return this[PRIVATE2].orientation;
    }
    /**
     * @return {XRRigidTransform}
     */
    get inverse() {
      if (this[PRIVATE2].inverse === null) {
        let invMatrix = identity(new Float32Array(16));
        invert(invMatrix, this[PRIVATE2].matrix);
        this[PRIVATE2].inverse = new _XRRigidTransform(invMatrix);
        this[PRIVATE2].inverse[PRIVATE2].inverse = this;
      }
      return this[PRIVATE2].inverse;
    }
  };

  // node_modules/webxr-polyfill/src/api/XRSpace.js
  var PRIVATE3 = Symbol("@@webxr-polyfill/XRSpace");
  var XRSpace = class {
    /**
     * @param {string?} specialType
     * @param {XRInputSource?} inputSource 
     */
    constructor(specialType = null, inputSource = null) {
      this[PRIVATE3] = {
        specialType,
        inputSource,
        // The transform for the space in the base space, along with it's inverse
        baseMatrix: null,
        inverseBaseMatrix: null,
        lastFrameId: -1
      };
    }
    /**
     * @return {string?}
     */
    get _specialType() {
      return this[PRIVATE3].specialType;
    }
    /**
     * @return {XRInputSource?}
     */
    get _inputSource() {
      return this[PRIVATE3].inputSource;
    }
    /**
     * NON-STANDARD
     * Trigger an update for this space's base pose if necessary
     * @param {XRDevice} device
     * @param {Number} frameId
     */
    _ensurePoseUpdated(device2, frameId) {
      if (frameId == this[PRIVATE3].lastFrameId)
        return;
      this[PRIVATE3].lastFrameId = frameId;
      this._onPoseUpdate(device2);
    }
    /**
     * NON-STANDARD
     * Called when this space's base pose needs to be updated
     * @param {XRDevice} device
     */
    _onPoseUpdate(device2) {
      if (this[PRIVATE3].specialType == "viewer") {
        this._baseMatrix = device2.getBasePoseMatrix();
      }
    }
    /**
     * NON-STANDARD
     * @param {Float32Array(16)} matrix
     */
    set _baseMatrix(matrix) {
      this[PRIVATE3].baseMatrix = matrix;
      this[PRIVATE3].inverseBaseMatrix = null;
    }
    /**
     * NON-STANDARD
     * @return {Float32Array(16)}
     */
    get _baseMatrix() {
      if (!this[PRIVATE3].baseMatrix) {
        if (this[PRIVATE3].inverseBaseMatrix) {
          this[PRIVATE3].baseMatrix = new Float32Array(16);
          invert(this[PRIVATE3].baseMatrix, this[PRIVATE3].inverseBaseMatrix);
        }
      }
      return this[PRIVATE3].baseMatrix;
    }
    /**
     * NON-STANDARD
     * @param {Float32Array(16)} matrix
     */
    set _inverseBaseMatrix(matrix) {
      this[PRIVATE3].inverseBaseMatrix = matrix;
      this[PRIVATE3].baseMatrix = null;
    }
    /**
     * NON-STANDARD
     * @return {Float32Array(16)}
     */
    get _inverseBaseMatrix() {
      if (!this[PRIVATE3].inverseBaseMatrix) {
        if (this[PRIVATE3].baseMatrix) {
          this[PRIVATE3].inverseBaseMatrix = new Float32Array(16);
          invert(this[PRIVATE3].inverseBaseMatrix, this[PRIVATE3].baseMatrix);
        }
      }
      return this[PRIVATE3].inverseBaseMatrix;
    }
    /**
     * NON-STANDARD
     * Gets the transform of the given space in this space
     *
     * @param {XRSpace} space
     * @return {XRRigidTransform}
     */
    _getSpaceRelativeTransform(space) {
      if (!this._inverseBaseMatrix || !space._baseMatrix) {
        return null;
      }
      let out = new Float32Array(16);
      multiply(out, this._inverseBaseMatrix, space._baseMatrix);
      return new XRRigidTransform2(out);
    }
  };

  // node_modules/webxr-polyfill/src/api/XRReferenceSpace.js
  var DEFAULT_EMULATION_HEIGHT = 1.6;
  var PRIVATE4 = Symbol("@@webxr-polyfill/XRReferenceSpace");
  var XRReferenceSpaceTypes = [
    "viewer",
    "local",
    "local-floor",
    "bounded-floor",
    "unbounded"
    // TODO: 'unbounded' is not supported by the polyfill.
  ];
  function isFloor(type) {
    return type === "bounded-floor" || type === "local-floor";
  }
  var XRReferenceSpace = class _XRReferenceSpace extends XRSpace {
    /**
     * Optionally takes a `transform` from a device's requestFrameOfReferenceMatrix
     * so device's can provide their own transforms for stage (or if they
     * wanted to override eye-level/head-model).
     *
     * @param {XRReferenceSpaceType} type
     * @param {Float32Array?} transform
     */
    constructor(type, transform = null) {
      if (!XRReferenceSpaceTypes.includes(type)) {
        throw new Error(`XRReferenceSpaceType must be one of ${XRReferenceSpaceTypes}`);
      }
      super(type);
      if (type === "bounded-floor" && !transform) {
        throw new Error(`XRReferenceSpace cannot use 'bounded-floor' type if the platform does not provide the floor level`);
      }
      if (isFloor(type) && !transform) {
        transform = identity(new Float32Array(16));
        transform[13] = DEFAULT_EMULATION_HEIGHT;
      }
      this._inverseBaseMatrix = transform || identity(new Float32Array(16));
      this[PRIVATE4] = {
        type,
        transform,
        originOffset: identity(new Float32Array(16))
      };
    }
    /**
     * NON-STANDARD
     * Takes a base pose model matrix and transforms it by the
     * frame of reference.
     *
     * @param {Float32Array} out
     * @param {Float32Array} pose
     */
    _transformBasePoseMatrix(out, pose) {
      multiply(out, this._inverseBaseMatrix, pose);
    }
    /**
     * NON-STANDARD
     * 
     * @return {Float32Array}
     */
    _originOffsetMatrix() {
      return this[PRIVATE4].originOffset;
    }
    /**
     * transformMatrix = Inv(OriginOffsetMatrix) * transformMatrix
     * @param {Float32Array} transformMatrix 
     */
    _adjustForOriginOffset(transformMatrix) {
      let inverseOriginOffsetMatrix = new Float32Array(16);
      invert(inverseOriginOffsetMatrix, this[PRIVATE4].originOffset);
      multiply(transformMatrix, inverseOriginOffsetMatrix, transformMatrix);
    }
    /**
     * Gets the transform of the given space in this space
     *
     * @param {XRSpace} space
     * @return {XRRigidTransform}
     */
    _getSpaceRelativeTransform(space) {
      let transform = super._getSpaceRelativeTransform(space);
      this._adjustForOriginOffset(transform.matrix);
      return new XRRigidTransform(transform.matrix);
    }
    /**
     * Doesn't update the bound geometry for bounded reference spaces.
     * @param {XRRigidTransform} additionalOffset
     * @return {XRReferenceSpace}
    */
    getOffsetReferenceSpace(additionalOffset) {
      let newSpace = new _XRReferenceSpace(
        this[PRIVATE4].type,
        this[PRIVATE4].transform,
        this[PRIVATE4].bounds
      );
      multiply(newSpace[PRIVATE4].originOffset, this[PRIVATE4].originOffset, additionalOffset.matrix);
      return newSpace;
    }
  };

  // node_modules/webxr-polyfill/src/api/XRSystem.js
  var PRIVATE5 = Symbol("@@webxr-polyfill/XR");
  var XRSessionModes = ["inline", "immersive-vr", "immersive-ar"];
  var DEFAULT_SESSION_OPTIONS = {
    "inline": {
      requiredFeatures: ["viewer"],
      optionalFeatures: []
    },
    "immersive-vr": {
      requiredFeatures: ["viewer", "local"],
      optionalFeatures: []
    },
    "immersive-ar": {
      requiredFeatures: ["viewer", "local"],
      optionalFeatures: []
    }
  };
  var POLYFILL_REQUEST_SESSION_ERROR = `Polyfill Error: Must call navigator.xr.isSessionSupported() with any XRSessionMode
or navigator.xr.requestSession('inline') prior to requesting an immersive
session. This is a limitation specific to the WebXR Polyfill and does not apply
to native implementations of the API.`;
  var XRSystem = class extends EventTarget {
    /**
     * Receives a promise of an XRDevice, so that the polyfill
     * can pass in some initial checks to asynchronously provide XRDevices
     * if content immediately requests `requestDevice()`.
     *
     * @param {Promise<XRDevice>} devicePromise
     */
    constructor(devicePromise) {
      super();
      this[PRIVATE5] = {
        device: null,
        devicePromise,
        immersiveSession: null,
        inlineSessions: /* @__PURE__ */ new Set()
      };
      devicePromise.then((device2) => {
        this[PRIVATE5].device = device2;
      });
    }
    /**
     * @param {XRSessionMode} mode
     * @return {Promise<boolean>}
     */
    async isSessionSupported(mode) {
      if (!this[PRIVATE5].device) {
        await this[PRIVATE5].devicePromise;
      }
      if (mode != "inline") {
        return Promise.resolve(this[PRIVATE5].device.isSessionSupported(mode));
      }
      return Promise.resolve(true);
    }
    /**
     * @param {XRSessionMode} mode
     * @param {XRSessionInit} options
     * @return {Promise<XRSession>}
     */
    async requestSession(mode, options) {
      if (!this[PRIVATE5].device) {
        if (mode != "inline") {
          throw new Error(POLYFILL_REQUEST_SESSION_ERROR);
        } else {
          await this[PRIVATE5].devicePromise;
        }
      }
      if (!XRSessionModes.includes(mode)) {
        throw new TypeError(
          `The provided value '${mode}' is not a valid enum value of type XRSessionMode`
        );
      }
      const defaultOptions = DEFAULT_SESSION_OPTIONS[mode];
      const requiredFeatures = defaultOptions.requiredFeatures.concat(
        options && options.requiredFeatures ? options.requiredFeatures : []
      );
      const optionalFeatures = defaultOptions.optionalFeatures.concat(
        options && options.optionalFeatures ? options.optionalFeatures : []
      );
      const enabledFeatures = /* @__PURE__ */ new Set();
      let requirementsFailed = false;
      for (let feature of requiredFeatures) {
        if (!this[PRIVATE5].device.isFeatureSupported(feature)) {
          console.error(`The required feature '${feature}' is not supported`);
          requirementsFailed = true;
        } else {
          enabledFeatures.add(feature);
        }
      }
      if (requirementsFailed) {
        throw new DOMException("Session does not support some required features", "NotSupportedError");
      }
      for (let feature of optionalFeatures) {
        if (!this[PRIVATE5].device.isFeatureSupported(feature)) {
          console.log(`The optional feature '${feature}' is not supported`);
        } else {
          enabledFeatures.add(feature);
        }
      }
      const sessionId = await this[PRIVATE5].device.requestSession(mode, enabledFeatures);
      const session = new XRSession(this[PRIVATE5].device, mode, sessionId);
      if (mode == "inline") {
        this[PRIVATE5].inlineSessions.add(session);
      } else {
        this[PRIVATE5].immersiveSession = session;
      }
      const onSessionEnd = () => {
        if (mode == "inline") {
          this[PRIVATE5].inlineSessions.delete(session);
        } else {
          this[PRIVATE5].immersiveSession = null;
        }
        session.removeEventListener("end", onSessionEnd);
      };
      session.addEventListener("end", onSessionEnd);
      return session;
    }
  };

  // node_modules/webxr-polyfill/src/lib/now.js
  var now;
  if ("performance" in global_default === false) {
    let startTime = Date.now();
    now = () => Date.now() - startTime;
  } else {
    now = () => performance.now();
  }
  var now_default = now;

  // node_modules/webxr-polyfill/src/api/XRPose.js
  var PRIVATE6 = Symbol("@@webxr-polyfill/XRPose");
  var XRPose2 = class {
    /**
     * @param {XRRigidTransform} transform 
     * @param {boolean} emulatedPosition 
     */
    constructor(transform, emulatedPosition) {
      this[PRIVATE6] = {
        transform,
        emulatedPosition
      };
    }
    /**
     * @return {XRRigidTransform}
     */
    get transform() {
      return this[PRIVATE6].transform;
    }
    /**
     * @return {bool}
     */
    get emulatedPosition() {
      return this[PRIVATE6].emulatedPosition;
    }
  };

  // node_modules/webxr-polyfill/src/api/XRViewerPose.js
  var PRIVATE7 = Symbol("@@webxr-polyfill/XRViewerPose");
  var XRViewerPose = class extends XRPose2 {
    /**
     * @param {XRDevice} device
     */
    constructor(transform, views, emulatedPosition = false) {
      super(transform, emulatedPosition);
      this[PRIVATE7] = {
        views
      };
    }
    /**
     * @return {Array<XRView>}
     */
    get views() {
      return this[PRIVATE7].views;
    }
  };

  // node_modules/webxr-polyfill/src/api/XRViewport.js
  var PRIVATE8 = Symbol("@@webxr-polyfill/XRViewport");
  var XRViewport = class {
    /**
     * Takes a proxy object that this viewport's XRView
     * updates and we serve here to match API.
     *
     * @param {Object} target
     */
    constructor(target) {
      this[PRIVATE8] = { target };
    }
    /**
     * @return {number}
     */
    get x() {
      return this[PRIVATE8].target.x;
    }
    /**
     * @return {number}
     */
    get y() {
      return this[PRIVATE8].target.y;
    }
    /**
     * @return {number}
     */
    get width() {
      return this[PRIVATE8].target.width;
    }
    /**
     * @return {number}
     */
    get height() {
      return this[PRIVATE8].target.height;
    }
  };

  // node_modules/webxr-polyfill/src/api/XRView.js
  var XREyes = ["left", "right", "none"];
  var PRIVATE9 = Symbol("@@webxr-polyfill/XRView");
  var XRView = class {
    /**
     * @param {XRDevice} device
     * @param {XREye} eye
     * @param {number} sessionId
     */
    constructor(device2, transform, eye, sessionId) {
      if (!XREyes.includes(eye)) {
        throw new Error(`XREye must be one of: ${XREyes}`);
      }
      const temp = /* @__PURE__ */ Object.create(null);
      const viewport = new XRViewport(temp);
      this[PRIVATE9] = {
        device: device2,
        eye,
        viewport,
        temp,
        sessionId,
        transform
      };
    }
    /**
     * @return {XREye}
     */
    get eye() {
      return this[PRIVATE9].eye;
    }
    /**
     * @return {Float32Array}
     */
    get projectionMatrix() {
      return this[PRIVATE9].device.getProjectionMatrix(this.eye);
    }
    /**
     * @return {XRRigidTransform}
     */
    get transform() {
      return this[PRIVATE9].transform;
    }
    /**
     * NON-STANDARD
     *
     * `getViewport` is now exposed via XRWebGLLayer instead of XRView.
     * XRWebGLLayer delegates all the actual work to this function.
     *
     * @param {XRWebGLLayer} layer
     * @return {XRViewport?}
     */
    _getViewport(layer) {
      if (this[PRIVATE9].device.getViewport(
        this[PRIVATE9].sessionId,
        this.eye,
        layer,
        this[PRIVATE9].temp
      )) {
        return this[PRIVATE9].viewport;
      }
      return void 0;
    }
  };

  // node_modules/webxr-polyfill/src/api/XRFrame.js
  var PRIVATE11 = Symbol("@@webxr-polyfill/XRFrame");
  var NON_ACTIVE_MSG = "XRFrame access outside the callback that produced it is invalid.";
  var NON_ANIMFRAME_MSG = "getViewerPose can only be called on XRFrame objects passed to XRSession.requestAnimationFrame callbacks.";
  var NEXT_FRAME_ID = 0;
  var XRFrame = class {
    /**
     * @param {XRDevice} device
     * @param {XRSession} session
     * @param {number} sessionId
     */
    constructor(device2, session, sessionId) {
      this[PRIVATE11] = {
        id: ++NEXT_FRAME_ID,
        active: false,
        animationFrame: false,
        device: device2,
        session,
        sessionId
      };
    }
    /**
     * @return {XRSession} session
     */
    get session() {
      return this[PRIVATE11].session;
    }
    /**
     * @param {XRReferenceSpace} referenceSpace
     * @return {XRViewerPose?}
     */
    getViewerPose(referenceSpace) {
      if (!this[PRIVATE11].animationFrame) {
        throw new DOMException(NON_ANIMFRAME_MSG, "InvalidStateError");
      }
      if (!this[PRIVATE11].active) {
        throw new DOMException(NON_ACTIVE_MSG, "InvalidStateError");
      }
      const device2 = this[PRIVATE11].device;
      const session = this[PRIVATE11].session;
      session[PRIVATE10].viewerSpace._ensurePoseUpdated(device2, this[PRIVATE11].id);
      referenceSpace._ensurePoseUpdated(device2, this[PRIVATE11].id);
      let viewerTransform = referenceSpace._getSpaceRelativeTransform(session[PRIVATE10].viewerSpace);
      const views = [];
      for (let viewSpace of session[PRIVATE10].viewSpaces) {
        viewSpace._ensurePoseUpdated(device2, this[PRIVATE11].id);
        let viewTransform = referenceSpace._getSpaceRelativeTransform(viewSpace);
        let view = new XRView(device2, viewTransform, viewSpace.eye, this[PRIVATE11].sessionId);
        views.push(view);
      }
      let viewerPose = new XRViewerPose(
        viewerTransform,
        views,
        false
        /* TODO: emulatedPosition */
      );
      return viewerPose;
    }
    /**
     * @param {XRSpace} space
     * @param {XRSpace} baseSpace
     * @return {XRPose?} pose
     */
    getPose(space, baseSpace) {
      if (!this[PRIVATE11].active) {
        throw new DOMException(NON_ACTIVE_MSG, "InvalidStateError");
      }
      const device2 = this[PRIVATE11].device;
      if (space._specialType === "target-ray" || space._specialType === "grip") {
        return device2.getInputPose(
          space._inputSource,
          baseSpace,
          space._specialType
        );
      } else {
        space._ensurePoseUpdated(device2, this[PRIVATE11].id);
        baseSpace._ensurePoseUpdated(device2, this[PRIVATE11].id);
        let transform = baseSpace._getSpaceRelativeTransform(space);
        if (!transform) {
          return null;
        }
        return new XRPose(
          transform,
          false
          /* TODO: emulatedPosition */
        );
      }
      return null;
    }
  };

  // node_modules/webxr-polyfill/src/api/XRRenderState.js
  var PRIVATE12 = Symbol("@@webxr-polyfill/XRRenderState");
  var XRRenderStateInit = Object.freeze({
    depthNear: 0.1,
    depthFar: 1e3,
    inlineVerticalFieldOfView: null,
    baseLayer: null
  });
  var XRRenderState = class {
    /**
     * @param {Object?} stateInit
     */
    constructor(stateInit = {}) {
      const config2 = Object.assign({}, XRRenderStateInit, stateInit);
      this[PRIVATE12] = { config: config2 };
    }
    /**
     * @return {number}
     */
    get depthNear() {
      return this[PRIVATE12].config.depthNear;
    }
    /**
     * @return {number}
     */
    get depthFar() {
      return this[PRIVATE12].config.depthFar;
    }
    /**
     * @return {number?}
     */
    get inlineVerticalFieldOfView() {
      return this[PRIVATE12].config.inlineVerticalFieldOfView;
    }
    /**
     * @return {XRWebGLLayer}
     */
    get baseLayer() {
      return this[PRIVATE12].config.baseLayer;
    }
  };

  // node_modules/webxr-polyfill/src/constants.js
  var POLYFILLED_XR_COMPATIBLE = Symbol("@@webxr-polyfill/polyfilled-xr-compatible");
  var XR_COMPATIBLE = Symbol("@@webxr-polyfill/xr-compatible");

  // node_modules/webxr-polyfill/src/api/XRWebGLLayer.js
  var PRIVATE13 = Symbol("@@webxr-polyfill/XRWebGLLayer");
  var XRWebGLLayerInit = Object.freeze({
    antialias: true,
    depth: false,
    stencil: false,
    alpha: true,
    multiview: false,
    ignoreDepthValues: false,
    framebufferScaleFactor: 1
  });
  var XRWebGLLayer = class {
    /**
     * @param {XRSession} session 
     * @param {XRWebGLRenderingContext} context 
     * @param {Object?} layerInit 
     */
    constructor(session, context, layerInit = {}) {
      const config2 = Object.assign({}, XRWebGLLayerInit, layerInit);
      if (!(session instanceof XRSession2)) {
        throw new Error("session must be a XRSession");
      }
      if (session.ended) {
        throw new Error(`InvalidStateError`);
      }
      if (context[POLYFILLED_XR_COMPATIBLE]) {
        if (context[XR_COMPATIBLE] !== true) {
          throw new Error(`InvalidStateError`);
        }
      }
      const framebuffer = context.getParameter(context.FRAMEBUFFER_BINDING);
      this[PRIVATE13] = {
        context,
        config: config2,
        framebuffer,
        session
      };
    }
    /**
     * @return {WebGLRenderingContext}
     */
    get context() {
      return this[PRIVATE13].context;
    }
    /**
     * @return {boolean}
     */
    get antialias() {
      return this[PRIVATE13].config.antialias;
    }
    /**
     * The polyfill will always ignore depth values.
     *
     * @return {boolean}
     */
    get ignoreDepthValues() {
      return true;
    }
    /**
     * @return {WebGLFramebuffer}
     */
    get framebuffer() {
      return this[PRIVATE13].framebuffer;
    }
    /**
     * @return {number}
     */
    get framebufferWidth() {
      return this[PRIVATE13].context.drawingBufferWidth;
    }
    /**
     * @return {number}
     */
    get framebufferHeight() {
      return this[PRIVATE13].context.drawingBufferHeight;
    }
    /**
     * @return {XRSession}
     */
    get _session() {
      return this[PRIVATE13].session;
    }
    /**
     * @TODO No mention in spec on not reusing the XRViewport on every frame.
     * 
     * @TODO In the future maybe all this logic should be handled here instead of
     * delegated to the XRView?
     *
     * @param {XRView} view
     * @return {XRViewport?}
     */
    getViewport(view) {
      return view._getViewport(this);
    }
    /**
     * Gets the scale factor to be requested if you want to match the device
     * resolution at the center of the user's vision. The polyfill will always
     * report 1.0.
     * 
     * @param {XRSession} session 
     * @return {number}
     */
    static getNativeFramebufferScaleFactor(session) {
      if (!session) {
        throw new TypeError("getNativeFramebufferScaleFactor must be passed a session.");
      }
      if (session[PRIVATE10].ended) {
        return 0;
      }
      return 1;
    }
  };

  // node_modules/webxr-polyfill/src/api/XRInputSourceEvent.js
  var PRIVATE14 = Symbol("@@webxr-polyfill/XRInputSourceEvent");
  var XRInputSourceEvent = class _XRInputSourceEvent extends Event {
    /**
     * @param {string} type
     * @param {Object} eventInitDict
     */
    constructor(type, eventInitDict) {
      super(type, eventInitDict);
      this[PRIVATE14] = {
        frame: eventInitDict.frame,
        inputSource: eventInitDict.inputSource
      };
      Object.setPrototypeOf(this, _XRInputSourceEvent.prototype);
    }
    /**
     * @return {XRFrame}
     */
    get frame() {
      return this[PRIVATE14].frame;
    }
    /**
     * @return {XRInputSource}
     */
    get inputSource() {
      return this[PRIVATE14].inputSource;
    }
  };

  // node_modules/webxr-polyfill/src/api/XRSessionEvent.js
  var PRIVATE15 = Symbol("@@webxr-polyfill/XRSessionEvent");
  var XRSessionEvent = class _XRSessionEvent extends Event {
    /**
     * @param {string} type
     * @param {Object} eventInitDict
     */
    constructor(type, eventInitDict) {
      super(type, eventInitDict);
      this[PRIVATE15] = {
        session: eventInitDict.session
      };
      Object.setPrototypeOf(this, _XRSessionEvent.prototype);
    }
    /**
     * @return {XRSession}
     */
    get session() {
      return this[PRIVATE15].session;
    }
  };

  // node_modules/webxr-polyfill/src/api/XRInputSourcesChangeEvent.js
  var PRIVATE16 = Symbol("@@webxr-polyfill/XRInputSourcesChangeEvent");
  var XRInputSourcesChangeEvent = class _XRInputSourcesChangeEvent extends Event {
    /**
     * @param {string} type
     * @param {Object} eventInitDict
     */
    constructor(type, eventInitDict) {
      super(type, eventInitDict);
      this[PRIVATE16] = {
        session: eventInitDict.session,
        added: eventInitDict.added,
        removed: eventInitDict.removed
      };
      Object.setPrototypeOf(this, _XRInputSourcesChangeEvent.prototype);
    }
    /**
     * @return {XRSession}
     */
    get session() {
      return this[PRIVATE16].session;
    }
    /**
     * @return {Array<XRInputSource>}
     */
    get added() {
      return this[PRIVATE16].added;
    }
    /**
     * @return {Array<XRInputSource>}
     */
    get removed() {
      return this[PRIVATE16].removed;
    }
  };

  // node_modules/webxr-polyfill/src/api/XRSession.js
  var PRIVATE10 = Symbol("@@webxr-polyfill/XRSession");
  var XRViewSpace = class extends XRSpace {
    constructor(eye) {
      super(eye);
    }
    get eye() {
      return this._specialType;
    }
    /**
     * Called when this space's base pose needs to be updated
     * @param {XRDevice} device
     */
    _onPoseUpdate(device2) {
      this._inverseBaseMatrix = device2.getBaseViewMatrix(this._specialType);
    }
  };
  var XRSession2 = class extends EventTarget {
    /**
     * @param {XRDevice} device
     * @param {XRSessionMode} mode
     * @param {number} id
     */
    constructor(device2, mode, id) {
      super();
      let immersive = mode != "inline";
      let initialRenderState = new XRRenderState({
        inlineVerticalFieldOfView: immersive ? null : Math.PI * 0.5
      });
      this[PRIVATE10] = {
        device: device2,
        mode,
        immersive,
        ended: false,
        suspended: false,
        frameCallbacks: [],
        currentFrameCallbacks: null,
        frameHandle: 0,
        deviceFrameHandle: null,
        id,
        activeRenderState: initialRenderState,
        pendingRenderState: null,
        viewerSpace: new XRReferenceSpace("viewer"),
        viewSpaces: [],
        currentInputSources: []
      };
      if (immersive) {
        this[PRIVATE10].viewSpaces.push(
          new XRViewSpace("left"),
          new XRViewSpace("right")
        );
      } else {
        this[PRIVATE10].viewSpaces.push(new XRViewSpace("none"));
      }
      this[PRIVATE10].onDeviceFrame = () => {
        if (this[PRIVATE10].ended || this[PRIVATE10].suspended) {
          return;
        }
        this[PRIVATE10].deviceFrameHandle = null;
        this[PRIVATE10].startDeviceFrameLoop();
        if (this[PRIVATE10].pendingRenderState !== null) {
          this[PRIVATE10].activeRenderState = new XRRenderState(this[PRIVATE10].pendingRenderState);
          this[PRIVATE10].pendingRenderState = null;
          if (this[PRIVATE10].activeRenderState.baseLayer) {
            this[PRIVATE10].device.onBaseLayerSet(
              this[PRIVATE10].id,
              this[PRIVATE10].activeRenderState.baseLayer
            );
          }
        }
        if (this[PRIVATE10].activeRenderState.baseLayer === null) {
          return;
        }
        const frame = new XRFrame(device2, this, this[PRIVATE10].id);
        const callbacks = this[PRIVATE10].currentFrameCallbacks = this[PRIVATE10].frameCallbacks;
        this[PRIVATE10].frameCallbacks = [];
        frame[PRIVATE11].active = true;
        frame[PRIVATE11].animationFrame = true;
        this[PRIVATE10].device.onFrameStart(this[PRIVATE10].id, this[PRIVATE10].activeRenderState);
        this._checkInputSourcesChange();
        const rightNow = now_default();
        for (let i = 0; i < callbacks.length; i++) {
          try {
            if (!callbacks[i].cancelled && typeof callbacks[i].callback === "function") {
              callbacks[i].callback(rightNow, frame);
            }
          } catch (err) {
            console.error(err);
          }
        }
        this[PRIVATE10].currentFrameCallbacks = null;
        frame[PRIVATE11].active = false;
        this[PRIVATE10].device.onFrameEnd(this[PRIVATE10].id);
      };
      this[PRIVATE10].startDeviceFrameLoop = () => {
        if (this[PRIVATE10].deviceFrameHandle === null) {
          this[PRIVATE10].deviceFrameHandle = this[PRIVATE10].device.requestAnimationFrame(
            this[PRIVATE10].onDeviceFrame
          );
        }
      };
      this[PRIVATE10].stopDeviceFrameLoop = () => {
        const handle = this[PRIVATE10].deviceFrameHandle;
        if (handle !== null) {
          this[PRIVATE10].device.cancelAnimationFrame(handle);
          this[PRIVATE10].deviceFrameHandle = null;
        }
      };
      this[PRIVATE10].onPresentationEnd = (sessionId) => {
        if (sessionId !== this[PRIVATE10].id) {
          this[PRIVATE10].suspended = false;
          this[PRIVATE10].startDeviceFrameLoop();
          this.dispatchEvent("focus", { session: this });
          return;
        }
        this[PRIVATE10].ended = true;
        this[PRIVATE10].stopDeviceFrameLoop();
        device2.removeEventListener("@@webxr-polyfill/vr-present-end", this[PRIVATE10].onPresentationEnd);
        device2.removeEventListener("@@webxr-polyfill/vr-present-start", this[PRIVATE10].onPresentationStart);
        device2.removeEventListener("@@webxr-polyfill/input-select-start", this[PRIVATE10].onSelectStart);
        device2.removeEventListener("@@webxr-polyfill/input-select-end", this[PRIVATE10].onSelectEnd);
        this.dispatchEvent("end", new XRSessionEvent("end", { session: this }));
      };
      device2.addEventListener("@@webxr-polyfill/vr-present-end", this[PRIVATE10].onPresentationEnd);
      this[PRIVATE10].onPresentationStart = (sessionId) => {
        if (sessionId === this[PRIVATE10].id) {
          return;
        }
        this[PRIVATE10].suspended = true;
        this[PRIVATE10].stopDeviceFrameLoop();
        this.dispatchEvent("blur", { session: this });
      };
      device2.addEventListener("@@webxr-polyfill/vr-present-start", this[PRIVATE10].onPresentationStart);
      this[PRIVATE10].onSelectStart = (evt) => {
        if (evt.sessionId !== this[PRIVATE10].id) {
          return;
        }
        this[PRIVATE10].dispatchInputSourceEvent("selectstart", evt.inputSource);
      };
      device2.addEventListener("@@webxr-polyfill/input-select-start", this[PRIVATE10].onSelectStart);
      this[PRIVATE10].onSelectEnd = (evt) => {
        if (evt.sessionId !== this[PRIVATE10].id) {
          return;
        }
        this[PRIVATE10].dispatchInputSourceEvent("selectend", evt.inputSource);
        this[PRIVATE10].dispatchInputSourceEvent("select", evt.inputSource);
      };
      device2.addEventListener("@@webxr-polyfill/input-select-end", this[PRIVATE10].onSelectEnd);
      this[PRIVATE10].onSqueezeStart = (evt) => {
        if (evt.sessionId !== this[PRIVATE10].id) {
          return;
        }
        this[PRIVATE10].dispatchInputSourceEvent("squeezestart", evt.inputSource);
      };
      device2.addEventListener("@@webxr-polyfill/input-squeeze-start", this[PRIVATE10].onSqueezeStart);
      this[PRIVATE10].onSqueezeEnd = (evt) => {
        if (evt.sessionId !== this[PRIVATE10].id) {
          return;
        }
        this[PRIVATE10].dispatchInputSourceEvent("squeezeend", evt.inputSource);
        this[PRIVATE10].dispatchInputSourceEvent("squeeze", evt.inputSource);
      };
      device2.addEventListener("@@webxr-polyfill/input-squeeze-end", this[PRIVATE10].onSqueezeEnd);
      this[PRIVATE10].dispatchInputSourceEvent = (type, inputSource) => {
        const frame = new XRFrame(device2, this, this[PRIVATE10].id);
        const event = new XRInputSourceEvent(type, { frame, inputSource });
        frame[PRIVATE11].active = true;
        this.dispatchEvent(type, event);
        frame[PRIVATE11].active = false;
      };
      this[PRIVATE10].startDeviceFrameLoop();
      this.onblur = void 0;
      this.onfocus = void 0;
      this.onresetpose = void 0;
      this.onend = void 0;
      this.onselect = void 0;
      this.onselectstart = void 0;
      this.onselectend = void 0;
    }
    /**
     * @return {XRRenderState}
     */
    get renderState() {
      return this[PRIVATE10].activeRenderState;
    }
    /**
     * @return {XREnvironmentBlendMode}
     */
    get environmentBlendMode() {
      return this[PRIVATE10].device.environmentBlendMode || "opaque";
    }
    /**
     * @param {string} type
     * @return {XRReferenceSpace}
     */
    async requestReferenceSpace(type) {
      if (this[PRIVATE10].ended) {
        return;
      }
      if (!XRReferenceSpaceTypes.includes(type)) {
        throw new TypeError(`XRReferenceSpaceType must be one of ${XRReferenceSpaceTypes}`);
      }
      if (!this[PRIVATE10].device.doesSessionSupportReferenceSpace(this[PRIVATE10].id, type)) {
        throw new DOMException(`The ${type} reference space is not supported by this session.`, "NotSupportedError");
      }
      if (type === "viewer") {
        return this[PRIVATE10].viewerSpace;
      }
      let transform = await this[PRIVATE10].device.requestFrameOfReferenceTransform(type);
      if (type === "bounded-floor") {
        if (!transform) {
          throw new DOMException(`${type} XRReferenceSpace not supported by this device.`, "NotSupportedError");
        }
        let bounds = this[PRIVATE10].device.requestStageBounds();
        if (!bounds) {
          throw new DOMException(`${type} XRReferenceSpace not supported by this device.`, "NotSupportedError");
        }
        throw new DOMException(`The WebXR polyfill does not support the ${type} reference space yet.`, "NotSupportedError");
      }
      return new XRReferenceSpace(type, transform);
    }
    /**
     * @param {Function} callback
     * @return {number}
     */
    requestAnimationFrame(callback) {
      if (this[PRIVATE10].ended) {
        return;
      }
      const handle = ++this[PRIVATE10].frameHandle;
      this[PRIVATE10].frameCallbacks.push({
        handle,
        callback,
        cancelled: false
      });
      return handle;
    }
    /**
     * @param {number} handle
     */
    cancelAnimationFrame(handle) {
      let callbacks = this[PRIVATE10].frameCallbacks;
      let index = callbacks.findIndex((d) => d && d.handle === handle);
      if (index > -1) {
        callbacks[index].cancelled = true;
        callbacks.splice(index, 1);
      }
      callbacks = this[PRIVATE10].currentFrameCallbacks;
      if (callbacks) {
        index = callbacks.findIndex((d) => d && d.handle === handle);
        if (index > -1) {
          callbacks[index].cancelled = true;
        }
      }
    }
    /**
     * @return {Array<XRInputSource>} input sources
     */
    get inputSources() {
      return this[PRIVATE10].device.getInputSources();
    }
    /**
     * @return {Promise<void>}
     */
    async end() {
      if (this[PRIVATE10].ended) {
        return;
      }
      if (this[PRIVATE10].immersive) {
        this[PRIVATE10].ended = true;
        this[PRIVATE10].device.removeEventListener(
          "@@webxr-polyfill/vr-present-start",
          this[PRIVATE10].onPresentationStart
        );
        this[PRIVATE10].device.removeEventListener(
          "@@webxr-polyfill/vr-present-end",
          this[PRIVATE10].onPresentationEnd
        );
        this[PRIVATE10].device.removeEventListener(
          "@@webxr-polyfill/input-select-start",
          this[PRIVATE10].onSelectStart
        );
        this[PRIVATE10].device.removeEventListener(
          "@@webxr-polyfill/input-select-end",
          this[PRIVATE10].onSelectEnd
        );
        this.dispatchEvent("end", new XRSessionEvent("end", { session: this }));
      }
      this[PRIVATE10].stopDeviceFrameLoop();
      return this[PRIVATE10].device.endSession(this[PRIVATE10].id);
    }
    /**
     * Queues an update to the active render state to be applied on the next
     * frame. Unset fields of newState will not be changed.
     * 
     * @param {XRRenderStateInit?} newState 
     */
    updateRenderState(newState) {
      if (this[PRIVATE10].ended) {
        const message = "Can't call updateRenderState on an XRSession that has already ended.";
        throw new Error(message);
      }
      if (newState.baseLayer && newState.baseLayer._session !== this) {
        const message = "Called updateRenderState with a base layer that was created by a different session.";
        throw new Error(message);
      }
      const fovSet = newState.inlineVerticalFieldOfView !== null && newState.inlineVerticalFieldOfView !== void 0;
      if (fovSet) {
        if (this[PRIVATE10].immersive) {
          const message = "inlineVerticalFieldOfView must not be set for an XRRenderState passed to updateRenderState for an immersive session.";
          throw new Error(message);
        } else {
          newState.inlineVerticalFieldOfView = Math.min(
            3.13,
            Math.max(0.01, newState.inlineVerticalFieldOfView)
          );
        }
      }
      if (this[PRIVATE10].pendingRenderState === null) {
        const activeRenderState = this[PRIVATE10].activeRenderState;
        this[PRIVATE10].pendingRenderState = {
          depthNear: activeRenderState.depthNear,
          depthFar: activeRenderState.depthFar,
          inlineVerticalFieldOfView: activeRenderState.inlineVerticalFieldOfView,
          baseLayer: activeRenderState.baseLayer
        };
      }
      Object.assign(this[PRIVATE10].pendingRenderState, newState);
    }
    /**
     * Compares the inputSources with the ones in the previous frame.
     * Fires imputsourceschange event if any added or removed
     * inputSource is found.
     */
    _checkInputSourcesChange() {
      const added = [];
      const removed = [];
      const newInputSources = this.inputSources;
      const oldInputSources = this[PRIVATE10].currentInputSources;
      for (const newInputSource of newInputSources) {
        if (!oldInputSources.includes(newInputSource)) {
          added.push(newInputSource);
        }
      }
      for (const oldInputSource of oldInputSources) {
        if (!newInputSources.includes(oldInputSource)) {
          removed.push(oldInputSource);
        }
      }
      if (added.length > 0 || removed.length > 0) {
        this.dispatchEvent("inputsourceschange", new XRInputSourcesChangeEvent("inputsourceschange", {
          session: this,
          added,
          removed
        }));
      }
      this[PRIVATE10].currentInputSources.length = 0;
      for (const newInputSource of newInputSources) {
        this[PRIVATE10].currentInputSources.push(newInputSource);
      }
    }
  };

  // node_modules/webxr-polyfill/src/api/XRInputSource.js
  var PRIVATE17 = Symbol("@@webxr-polyfill/XRInputSource");
  var XRInputSource = class {
    /**
     * @param {GamepadXRInputSource} impl 
     */
    constructor(impl) {
      this[PRIVATE17] = {
        impl,
        gripSpace: new XRSpace("grip", this),
        targetRaySpace: new XRSpace("target-ray", this)
      };
    }
    /**
     * @return {XRHandedness}
     */
    get handedness() {
      return this[PRIVATE17].impl.handedness;
    }
    /**
     * @return {XRTargetRayMode}
     */
    get targetRayMode() {
      return this[PRIVATE17].impl.targetRayMode;
    }
    /**
     * @return {XRSpace}
     */
    get gripSpace() {
      let mode = this[PRIVATE17].impl.targetRayMode;
      if (mode === "gaze" || mode === "screen") {
        return null;
      }
      return this[PRIVATE17].gripSpace;
    }
    /**
     * @return {XRSpace}
     */
    get targetRaySpace() {
      return this[PRIVATE17].targetRaySpace;
    }
    /**
     * @return {Array<String>}
     */
    get profiles() {
      return this[PRIVATE17].impl.profiles;
    }
    /**
     * @return {Gamepad}
     */
    get gamepad() {
      return this[PRIVATE17].impl.gamepad;
    }
  };

  // node_modules/webxr-polyfill/src/api/XRReferenceSpaceEvent.js
  var PRIVATE18 = Symbol("@@webxr-polyfill/XRReferenceSpaceEvent");
  var XRReferenceSpaceEvent = class _XRReferenceSpaceEvent extends Event {
    /**
     * @param {string} type
     * @param {Object} eventInitDict
     */
    constructor(type, eventInitDict) {
      super(type, eventInitDict);
      this[PRIVATE18] = {
        referenceSpace: eventInitDict.referenceSpace,
        transform: eventInitDict.transform || null
      };
      Object.setPrototypeOf(this, _XRReferenceSpaceEvent.prototype);
    }
    /**
     * @return {XRFrame}
     */
    get referenceSpace() {
      return this[PRIVATE18].referenceSpace;
    }
    /**
     * @return {XRInputSource}
     */
    get transform() {
      return this[PRIVATE18].transform;
    }
  };

  // node_modules/webxr-polyfill/src/api/index.js
  var api_default = {
    XRSystem,
    XRSession: XRSession2,
    XRSessionEvent,
    XRFrame,
    XRView,
    XRViewport,
    XRViewerPose,
    XRWebGLLayer,
    XRSpace,
    XRReferenceSpace,
    XRReferenceSpaceEvent,
    XRInputSource,
    XRInputSourceEvent,
    XRInputSourcesChangeEvent,
    XRRenderState,
    XRRigidTransform: XRRigidTransform2,
    XRPose: XRPose2
  };

  // node_modules/webxr-polyfill/src/polyfill-globals.js
  var polyfillMakeXRCompatible = (Context) => {
    if (typeof Context.prototype.makeXRCompatible === "function") {
      return false;
    }
    Context.prototype.makeXRCompatible = function() {
      this[XR_COMPATIBLE] = true;
      return Promise.resolve();
    };
    return true;
  };
  var polyfillGetContext = (Canvas) => {
    const getContext = Canvas.prototype.getContext;
    Canvas.prototype.getContext = function(contextType, glAttribs) {
      const ctx = getContext.call(this, contextType, glAttribs);
      if (ctx) {
        ctx[POLYFILLED_XR_COMPATIBLE] = true;
        if (glAttribs && "xrCompatible" in glAttribs) {
          ctx[XR_COMPATIBLE] = glAttribs.xrCompatible;
        }
      }
      return ctx;
    };
  };

  // node_modules/webxr-polyfill/src/utils.js
  var isImageBitmapSupported = (global2) => !!(global2.ImageBitmapRenderingContext && global2.createImageBitmap);
  var isMobile = (global2) => {
    var check = false;
    (function(a) {
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
        check = true;
    })(global2.navigator.userAgent || global2.navigator.vendor || global2.opera);
    return check;
  };
  var applyCanvasStylesForMinimalRendering = (canvas) => {
    canvas.style.display = "block";
    canvas.style.position = "absolute";
    canvas.style.width = canvas.style.height = "1px";
    canvas.style.top = canvas.style.left = "0px";
  };

  // node_modules/webxr-polyfill/src/devices/CardboardXRDevice.js
  var import_cardboard_vr_display = __toESM(require_cardboard_vr_display());

  // node_modules/webxr-polyfill/src/devices/XRDevice.js
  var XRDevice = class extends EventTarget {
    /**
     * Takes a VRDisplay object from the WebVR 1.1 spec.
     *
     * @param {Object} global
     */
    constructor(global2) {
      super();
      this.global = global2;
      this.onWindowResize = this.onWindowResize.bind(this);
      this.global.window.addEventListener("resize", this.onWindowResize);
      this.environmentBlendMode = "opaque";
    }
    /**
     * Called when a XRSession has a `baseLayer` property set.
     *
     * @param {number} sessionId
     * @param {XRWebGLLayer} layer
     */
    onBaseLayerSet(sessionId, layer) {
      throw new Error("Not implemented");
    }
    /**
     * @param {XRSessionMode} mode
     * @return {boolean}
     */
    isSessionSupported(mode) {
      throw new Error("Not implemented");
    }
    /**
     * @param {string} featureDescriptor
     * @return {boolean}
     */
    isFeatureSupported(featureDescriptor) {
      throw new Error("Not implemented");
    }
    /**
     * Returns a promise if creating a session is successful.
     * Usually used to set up presentation in the device.
     *
     * @param {XRSessionMode} mode
     * @param {Set<string>} enabledFeatures
     * @return {Promise<number>}
     */
    async requestSession(mode, enabledFeatures) {
      throw new Error("Not implemented");
    }
    /**
     * @return {Function}
     */
    requestAnimationFrame(callback) {
      throw new Error("Not implemented");
    }
    /**
     * @param {number} sessionId
     */
    onFrameStart(sessionId) {
      throw new Error("Not implemented");
    }
    /**
     * @param {number} sessionId
     */
    onFrameEnd(sessionId) {
      throw new Error("Not implemented");
    }
    /**
     * @param {number} sessionId
     * @param {XRReferenceSpaceType} type
     * @return {boolean}
     */
    doesSessionSupportReferenceSpace(sessionId, type) {
      throw new Error("Not implemented");
    }
    /**
     * @return {Object?}
     */
    requestStageBounds() {
      throw new Error("Not implemented");
    }
    /**
     * Returns a promise resolving to a transform if XRDevice
     * can support frame of reference and provides its own values.
     * Can resolve to `undefined` if the polyfilled API can provide
     * a default. Rejects if this XRDevice cannot
     * support the frame of reference.
     *
     * @param {XRFrameOfReferenceType} type
     * @param {XRFrameOfReferenceOptions} options
     * @return {Promise<XRFrameOfReference>}
     */
    async requestFrameOfReferenceTransform(type, options) {
      return void 0;
    }
    /**
     * @param {number} handle
     */
    cancelAnimationFrame(handle) {
      throw new Error("Not implemented");
    }
    /**
     * @param {number} sessionId
     */
    endSession(sessionId) {
      throw new Error("Not implemented");
    }
    /**
     * Takes a XREye and a target to apply properties of
     * `x`, `y`, `width` and `height` on. Returns a boolean
     * indicating if it successfully was able to populate
     * target's values.
     *
     * @param {number} sessionId
     * @param {XREye} eye
     * @param {XRWebGLLayer} layer
     * @param {Object?} target
     * @return {boolean}
     */
    getViewport(sessionId, eye, layer, target) {
      throw new Error("Not implemented");
    }
    /**
     * @param {XREye} eye
     * @return {Float32Array}
     */
    getProjectionMatrix(eye) {
      throw new Error("Not implemented");
    }
    /**
     * Get model matrix unaffected by frame of reference.
     *
     * @return {Float32Array}
     */
    getBasePoseMatrix() {
      throw new Error("Not implemented");
    }
    /**
     * Get view matrix unaffected by frame of reference.
     *
     * @param {XREye} eye
     * @return {Float32Array}
     */
    getBaseViewMatrix(eye) {
      throw new Error("Not implemented");
    }
    /**
     * Get a list of input sources.
     *
     * @return {Array<XRInputSource>}
     */
    getInputSources() {
      throw new Error("Not implemented");
    }
    /**
     * Get the current pose of an input source.
     *
     * @param {XRInputSource} inputSource
     * @param {XRCoordinateSystem} coordinateSystem
     * @param {String} poseType
     * @return {XRPose}
     */
    getInputPose(inputSource, coordinateSystem, poseType) {
      throw new Error("Not implemented");
    }
    /**
     * Called on window resize.
     */
    onWindowResize() {
      this.onWindowResize();
    }
  };

  // node_modules/webxr-polyfill/src/devices/GamepadMappings.js
  var daydream = {
    mapping: "",
    profiles: ["google-daydream", "generic-trigger-touchpad"],
    buttons: {
      length: 3,
      0: null,
      1: null,
      2: 0
    }
  };
  var viveFocus = {
    mapping: "xr-standard",
    profiles: ["htc-vive-focus", "generic-trigger-touchpad"],
    buttons: {
      length: 3,
      0: 1,
      1: null,
      2: 0
    }
  };
  var oculusGo = {
    mapping: "xr-standard",
    profiles: ["oculus-go", "generic-trigger-touchpad"],
    buttons: {
      length: 3,
      0: 1,
      1: null,
      2: 0
    },
    // Grip adjustments determined experimentally.
    gripTransform: {
      orientation: [Math.PI * 0.11, 0, 0, 1]
    }
  };
  var oculusTouch = {
    mapping: "xr-standard",
    displayProfiles: {
      "Oculus Quest": ["oculus-touch-v2", "oculus-touch", "generic-trigger-squeeze-thumbstick"]
    },
    profiles: ["oculus-touch", "generic-trigger-squeeze-thumbstick"],
    axes: {
      length: 4,
      0: null,
      1: null,
      2: 0,
      3: 1
    },
    buttons: {
      length: 7,
      0: 1,
      1: 2,
      2: null,
      3: 0,
      4: 3,
      5: 4,
      6: null
    },
    // Grip adjustments determined experimentally.
    gripTransform: {
      position: [0, -0.02, 0.04, 1],
      orientation: [Math.PI * 0.11, 0, 0, 1]
    }
  };
  var openVr = {
    mapping: "xr-standard",
    profiles: ["htc-vive", "generic-trigger-squeeze-touchpad"],
    displayProfiles: {
      "HTC Vive": ["htc-vive", "generic-trigger-squeeze-touchpad"],
      "HTC Vive DVT": ["htc-vive", "generic-trigger-squeeze-touchpad"],
      "Valve Index": ["valve-index", "generic-trigger-squeeze-touchpad-thumbstick"]
    },
    buttons: {
      length: 3,
      0: 1,
      1: 2,
      2: 0
    },
    // Transform adjustments determined experimentally.
    gripTransform: {
      position: [0, 0, 0.05, 1]
    },
    targetRayTransform: {
      orientation: [Math.PI * -0.08, 0, 0, 1]
    },
    userAgentOverrides: {
      "Firefox": {
        axes: {
          invert: [1, 3]
        }
      }
    }
  };
  var samsungGearVR = {
    mapping: "xr-standard",
    profiles: ["samsung-gearvr", "generic-trigger-touchpad"],
    buttons: {
      length: 3,
      0: 1,
      1: null,
      2: 0
    },
    gripTransform: {
      orientation: [Math.PI * 0.11, 0, 0, 1]
    }
  };
  var samsungOdyssey = {
    mapping: "xr-standard",
    profiles: ["samsung-odyssey", "microsoft-mixed-reality", "generic-trigger-squeeze-touchpad-thumbstick"],
    buttons: {
      length: 4,
      0: 1,
      // index finger trigger
      1: 0,
      // pressable joystick
      2: 2,
      // grip trigger
      3: 4
      // pressable touchpad
    },
    // Grip adjustments determined experimentally.
    gripTransform: {
      position: [0, -0.02, 0.04, 1],
      orientation: [Math.PI * 0.11, 0, 0, 1]
    }
  };
  var windowsMixedReality = {
    mapping: "xr-standard",
    profiles: ["microsoft-mixed-reality", "generic-trigger-squeeze-touchpad-thumbstick"],
    buttons: {
      length: 4,
      0: 1,
      // index finger trigger
      1: 0,
      // pressable joystick
      2: 2,
      // grip trigger
      3: 4
      // pressable touchpad
    },
    // Grip adjustments determined experimentally.
    gripTransform: {
      position: [0, -0.02, 0.04, 1],
      orientation: [Math.PI * 0.11, 0, 0, 1]
    }
  };
  var GamepadMappings = {
    "Daydream Controller": daydream,
    "Gear VR Controller": samsungGearVR,
    "HTC Vive Focus Controller": viveFocus,
    "Oculus Go Controller": oculusGo,
    "Oculus Touch (Right)": oculusTouch,
    "Oculus Touch (Left)": oculusTouch,
    "OpenVR Gamepad": openVr,
    "Spatial Controller (Spatial Interaction Source) 045E-065A": windowsMixedReality,
    "Spatial Controller (Spatial Interaction Source) 045E-065D": samsungOdyssey,
    "Windows Mixed Reality (Right)": windowsMixedReality,
    "Windows Mixed Reality (Left)": windowsMixedReality
  };
  var GamepadMappings_default = GamepadMappings;

  // node_modules/webxr-polyfill/src/lib/OrientationArmModel.js
  var HEAD_ELBOW_OFFSET_RIGHTHANDED = fromValues(0.155, -0.465, -0.15);
  var HEAD_ELBOW_OFFSET_LEFTHANDED = fromValues(-0.155, -0.465, -0.15);
  var ELBOW_WRIST_OFFSET = fromValues(0, 0, -0.25);
  var WRIST_CONTROLLER_OFFSET = fromValues(0, 0, 0.05);
  var ARM_EXTENSION_OFFSET = fromValues(-0.08, 0.14, 0.08);
  var ELBOW_BEND_RATIO = 0.4;
  var EXTENSION_RATIO_WEIGHT = 0.4;
  var MIN_ANGULAR_SPEED = 0.61;
  var MIN_ANGLE_DELTA = 0.175;
  var MIN_EXTENSION_COS = 0.12;
  var MAX_EXTENSION_COS = 0.87;
  var RAD_TO_DEG = 180 / Math.PI;
  function eulerFromQuaternion(out, q, order) {
    function clamp(value, min2, max2) {
      return value < min2 ? min2 : value > max2 ? max2 : value;
    }
    var sqx = q[0] * q[0];
    var sqy = q[1] * q[1];
    var sqz = q[2] * q[2];
    var sqw = q[3] * q[3];
    if (order === "XYZ") {
      out[0] = Math.atan2(2 * (q[0] * q[3] - q[1] * q[2]), sqw - sqx - sqy + sqz);
      out[1] = Math.asin(clamp(2 * (q[0] * q[2] + q[1] * q[3]), -1, 1));
      out[2] = Math.atan2(2 * (q[2] * q[3] - q[0] * q[1]), sqw + sqx - sqy - sqz);
    } else if (order === "YXZ") {
      out[0] = Math.asin(clamp(2 * (q[0] * q[3] - q[1] * q[2]), -1, 1));
      out[1] = Math.atan2(2 * (q[0] * q[2] + q[1] * q[3]), sqw - sqx - sqy + sqz);
      out[2] = Math.atan2(2 * (q[0] * q[1] + q[2] * q[3]), sqw - sqx + sqy - sqz);
    } else if (order === "ZXY") {
      out[0] = Math.asin(clamp(2 * (q[0] * q[3] + q[1] * q[2]), -1, 1));
      out[1] = Math.atan2(2 * (q[1] * q[3] - q[2] * q[0]), sqw - sqx - sqy + sqz);
      out[2] = Math.atan2(2 * (q[2] * q[3] - q[0] * q[1]), sqw - sqx + sqy - sqz);
    } else if (order === "ZYX") {
      out[0] = Math.atan2(2 * (q[0] * q[3] + q[2] * q[1]), sqw - sqx - sqy + sqz);
      out[1] = Math.asin(clamp(2 * (q[1] * q[3] - q[0] * q[2]), -1, 1));
      out[2] = Math.atan2(2 * (q[0] * q[1] + q[2] * q[3]), sqw + sqx - sqy - sqz);
    } else if (order === "YZX") {
      out[0] = Math.atan2(2 * (q[0] * q[3] - q[2] * q[1]), sqw - sqx + sqy - sqz);
      out[1] = Math.atan2(2 * (q[1] * q[3] - q[0] * q[2]), sqw + sqx - sqy - sqz);
      out[2] = Math.asin(clamp(2 * (q[0] * q[1] + q[2] * q[3]), -1, 1));
    } else if (order === "XZY") {
      out[0] = Math.atan2(2 * (q[0] * q[3] + q[1] * q[2]), sqw - sqx + sqy - sqz);
      out[1] = Math.atan2(2 * (q[0] * q[2] + q[1] * q[3]), sqw + sqx - sqy - sqz);
      out[2] = Math.asin(clamp(2 * (q[2] * q[3] - q[0] * q[1]), -1, 1));
    } else {
      console.log("No order given for quaternion to euler conversion.");
      return;
    }
  }
  var OrientationArmModel = class {
    constructor() {
      this.hand = "right";
      this.headElbowOffset = HEAD_ELBOW_OFFSET_RIGHTHANDED;
      this.controllerQ = create5();
      this.lastControllerQ = create5();
      this.headQ = create5();
      this.headPos = create2();
      this.elbowPos = create2();
      this.wristPos = create2();
      this.time = null;
      this.lastTime = null;
      this.rootQ = create5();
      this.position = create2();
    }
    setHandedness(hand) {
      if (this.hand != hand) {
        this.hand = hand;
        if (this.hand == "left") {
          this.headElbowOffset = HEAD_ELBOW_OFFSET_LEFTHANDED;
        } else {
          this.headElbowOffset = HEAD_ELBOW_OFFSET_RIGHTHANDED;
        }
      }
    }
    /**
     * Called on a RAF.
     */
    update(controllerOrientation, headPoseMatrix) {
      this.time = now_default();
      if (controllerOrientation) {
        copy4(this.lastControllerQ, this.controllerQ);
        copy4(this.controllerQ, controllerOrientation);
      }
      if (headPoseMatrix) {
        getTranslation(this.headPos, headPoseMatrix);
        getRotation(this.headQ, headPoseMatrix);
      }
      let headYawQ = this.getHeadYawOrientation_();
      let angleDelta = this.quatAngle_(this.lastControllerQ, this.controllerQ);
      let timeDelta = (this.time - this.lastTime) / 1e3;
      let controllerAngularSpeed = angleDelta / timeDelta;
      if (controllerAngularSpeed > MIN_ANGULAR_SPEED) {
        slerp(
          this.rootQ,
          this.rootQ,
          headYawQ,
          Math.min(angleDelta / MIN_ANGLE_DELTA, 1)
        );
      } else {
        copy4(this.rootQ, headYawQ);
      }
      let controllerForward = fromValues(0, 0, -1);
      transformQuat(controllerForward, controllerForward, this.controllerQ);
      let controllerDotY = dot(controllerForward, [0, 1, 0]);
      let extensionRatio = this.clamp_(
        (controllerDotY - MIN_EXTENSION_COS) / MAX_EXTENSION_COS,
        0,
        1
      );
      let controllerCameraQ = clone3(this.rootQ);
      invert2(controllerCameraQ, controllerCameraQ);
      multiply2(controllerCameraQ, controllerCameraQ, this.controllerQ);
      let elbowPos = this.elbowPos;
      copy2(elbowPos, this.headPos);
      add(elbowPos, elbowPos, this.headElbowOffset);
      let elbowOffset = clone(ARM_EXTENSION_OFFSET);
      scale(elbowOffset, elbowOffset, extensionRatio);
      add(elbowPos, elbowPos, elbowOffset);
      let totalAngle = this.quatAngle_(controllerCameraQ, create5());
      let totalAngleDeg = totalAngle * RAD_TO_DEG;
      let lerpSuppression = 1 - Math.pow(totalAngleDeg / 180, 4);
      sssss;
      let elbowRatio = ELBOW_BEND_RATIO;
      let wristRatio = 1 - ELBOW_BEND_RATIO;
      let lerpValue = lerpSuppression * (elbowRatio + wristRatio * extensionRatio * EXTENSION_RATIO_WEIGHT);
      let wristQ = create5();
      slerp(wristQ, wristQ, controllerCameraQ, lerpValue);
      let invWristQ = invert2(create5(), wristQ);
      let elbowQ = clone3(controllerCameraQ);
      multiply2(elbowQ, elbowQ, invWristQ);
      let wristPos = this.wristPos;
      copy2(wristPos, WRIST_CONTROLLER_OFFSET);
      transformQuat(wristPos, wristPos, wristQ);
      add(wristPos, wristPos, ELBOW_WRIST_OFFSET);
      transformQuat(wristPos, wristPos, elbowQ);
      add(wristPos, wristPos, elbowPos);
      let offset = clone(ARM_EXTENSION_OFFSET);
      scale(offset, offset, extensionRatio);
      add(this.position, this.wristPos, offset);
      transformQuat(this.position, this.position, this.rootQ);
      this.lastTime = this.time;
    }
    /**
     * Returns the position calculated by the model.
     */
    getPosition() {
      return this.position;
    }
    getHeadYawOrientation_() {
      let headEuler = create2();
      eulerFromQuaternion(headEuler, this.headQ, "YXZ");
      let destinationQ = fromEuler(create5(), 0, headEuler[1] * RAD_TO_DEG, 0);
      return destinationQ;
    }
    clamp_(value, min2, max2) {
      return Math.min(Math.max(value, min2), max2);
    }
    quatAngle_(q1, q2) {
      let vec1 = [0, 0, -1];
      let vec2 = [0, 0, -1];
      transformQuat(vec1, vec1, q1);
      transformQuat(vec2, vec2, q2);
      return angle(vec1, vec2);
    }
  };

  // node_modules/webxr-polyfill/src/devices/GamepadXRInputSource.js
  var PRIVATE19 = Symbol("@@webxr-polyfill/XRRemappedGamepad");
  var PLACEHOLDER_BUTTON = { pressed: false, touched: false, value: 0 };
  Object.freeze(PLACEHOLDER_BUTTON);
  var XRRemappedGamepad = class {
    constructor(gamepad, display, map) {
      if (!map) {
        map = {};
      }
      if (map.userAgentOverrides) {
        for (let agent in map.userAgentOverrides) {
          if (navigator.userAgent.includes(agent)) {
            let override = map.userAgentOverrides[agent];
            for (let key in override) {
              if (key in map) {
                Object.assign(map[key], override[key]);
              } else {
                map[key] = override[key];
              }
            }
            break;
          }
        }
      }
      let axes = new Array(map.axes && map.axes.length ? map.axes.length : gamepad.axes.length);
      let buttons = new Array(map.buttons && map.buttons.length ? map.buttons.length : gamepad.buttons.length);
      let gripTransform = null;
      if (map.gripTransform) {
        let orientation = map.gripTransform.orientation || [0, 0, 0, 1];
        gripTransform = create();
        fromRotationTranslation(
          gripTransform,
          normalize3(orientation, orientation),
          map.gripTransform.position || [0, 0, 0]
        );
      }
      let targetRayTransform = null;
      if (map.targetRayTransform) {
        let orientation = map.targetRayTransform.orientation || [0, 0, 0, 1];
        targetRayTransform = create();
        fromRotationTranslation(
          targetRayTransform,
          normalize3(orientation, orientation),
          map.targetRayTransform.position || [0, 0, 0]
        );
      }
      let profiles = map.profiles;
      if (map.displayProfiles) {
        if (display.displayName in map.displayProfiles) {
          profiles = map.displayProfiles[display.displayName];
        }
      }
      this[PRIVATE19] = {
        gamepad,
        map,
        profiles: profiles || [gamepad.id],
        mapping: map.mapping || gamepad.mapping,
        axes,
        buttons,
        gripTransform,
        targetRayTransform
      };
      this._update();
    }
    _update() {
      let gamepad = this[PRIVATE19].gamepad;
      let map = this[PRIVATE19].map;
      let axes = this[PRIVATE19].axes;
      for (let i = 0; i < axes.length; ++i) {
        if (map.axes && i in map.axes) {
          if (map.axes[i] === null) {
            axes[i] = 0;
          } else {
            axes[i] = gamepad.axes[map.axes[i]];
          }
        } else {
          axes[i] = gamepad.axes[i];
        }
      }
      if (map.axes && map.axes.invert) {
        for (let axis of map.axes.invert) {
          if (axis < axes.length) {
            axes[axis] *= -1;
          }
        }
      }
      let buttons = this[PRIVATE19].buttons;
      for (let i = 0; i < buttons.length; ++i) {
        if (map.buttons && i in map.buttons) {
          if (map.buttons[i] === null) {
            buttons[i] = PLACEHOLDER_BUTTON;
          } else {
            buttons[i] = gamepad.buttons[map.buttons[i]];
          }
        } else {
          buttons[i] = gamepad.buttons[i];
        }
      }
    }
    get id() {
      return "";
    }
    get _profiles() {
      return this[PRIVATE19].profiles;
    }
    get index() {
      return -1;
    }
    get connected() {
      return this[PRIVATE19].gamepad.connected;
    }
    get timestamp() {
      return this[PRIVATE19].gamepad.timestamp;
    }
    get mapping() {
      return this[PRIVATE19].mapping;
    }
    get axes() {
      return this[PRIVATE19].axes;
    }
    get buttons() {
      return this[PRIVATE19].buttons;
    }
    // Non-standard extension
    get hapticActuators() {
      return this[PRIVATE19].gamepad.hapticActuators;
    }
  };
  var GamepadXRInputSource = class {
    constructor(polyfill2, display, primaryButtonIndex = 0, primarySqueezeButtonIndex = -1) {
      this.polyfill = polyfill2;
      this.display = display;
      this.nativeGamepad = null;
      this.gamepad = null;
      this.inputSource = new XRInputSource(this);
      this.lastPosition = create2();
      this.emulatedPosition = false;
      this.basePoseMatrix = create();
      this.outputMatrix = create();
      this.primaryButtonIndex = primaryButtonIndex;
      this.primaryActionPressed = false;
      this.primarySqueezeButtonIndex = primarySqueezeButtonIndex;
      this.primarySqueezeActionPressed = false;
      this.handedness = "";
      this.targetRayMode = "gaze";
      this.armModel = null;
    }
    get profiles() {
      return this.gamepad ? this.gamepad._profiles : [];
    }
    updateFromGamepad(gamepad) {
      if (this.nativeGamepad !== gamepad) {
        this.nativeGamepad = gamepad;
        if (gamepad) {
          this.gamepad = new XRRemappedGamepad(gamepad, this.display, GamepadMappings_default[gamepad.id]);
        } else {
          this.gamepad = null;
        }
      }
      this.handedness = gamepad.hand === "" ? "none" : gamepad.hand;
      if (this.gamepad) {
        this.gamepad._update();
      }
      if (gamepad.pose) {
        this.targetRayMode = "tracked-pointer";
        this.emulatedPosition = !gamepad.pose.hasPosition;
      } else if (gamepad.hand === "") {
        this.targetRayMode = "gaze";
        this.emulatedPosition = false;
      }
    }
    updateBasePoseMatrix() {
      if (this.nativeGamepad && this.nativeGamepad.pose) {
        let pose = this.nativeGamepad.pose;
        let position = pose.position;
        let orientation = pose.orientation;
        if (!position && !orientation) {
          return;
        }
        if (!position) {
          if (!pose.hasPosition) {
            if (!this.armModel) {
              this.armModel = new OrientationArmModel();
            }
            this.armModel.setHandedness(this.nativeGamepad.hand);
            this.armModel.update(orientation, this.polyfill.getBasePoseMatrix());
            position = this.armModel.getPosition();
          } else {
            position = this.lastPosition;
          }
        } else {
          this.lastPosition[0] = position[0];
          this.lastPosition[1] = position[1];
          this.lastPosition[2] = position[2];
        }
        fromRotationTranslation(this.basePoseMatrix, orientation, position);
      } else {
        copy(this.basePoseMatrix, this.polyfill.getBasePoseMatrix());
      }
      return this.basePoseMatrix;
    }
    /**
     * @param {XRReferenceSpace} coordinateSystem
     * @param {string} poseType
     * @return {XRPose?}
     */
    getXRPose(coordinateSystem, poseType) {
      this.updateBasePoseMatrix();
      switch (poseType) {
        case "target-ray":
          coordinateSystem._transformBasePoseMatrix(this.outputMatrix, this.basePoseMatrix);
          if (this.gamepad && this.gamepad[PRIVATE19].targetRayTransform) {
            multiply(this.outputMatrix, this.outputMatrix, this.gamepad[PRIVATE19].targetRayTransform);
          }
          break;
        case "grip":
          if (!this.nativeGamepad || !this.nativeGamepad.pose) {
            return null;
          }
          coordinateSystem._transformBasePoseMatrix(this.outputMatrix, this.basePoseMatrix);
          if (this.gamepad && this.gamepad[PRIVATE19].gripTransform) {
            multiply(this.outputMatrix, this.outputMatrix, this.gamepad[PRIVATE19].gripTransform);
          }
          break;
        default:
          return null;
      }
      coordinateSystem._adjustForOriginOffset(this.outputMatrix);
      return new XRPose(new XRRigidTransform(this.outputMatrix), this.emulatedPosition);
    }
  };

  // node_modules/webxr-polyfill/src/devices/WebVRDevice.js
  var PRIVATE20 = Symbol("@@webxr-polyfill/WebVRDevice");
  var TEST_ENV = false;
  var EXTRA_PRESENTATION_ATTRIBUTES = {
    // Non-standard attribute to enable running at the native device refresh rate
    // on the Oculus Go.
    highRefreshRate: true
  };
  var PRIMARY_BUTTON_MAP = {
    oculus: 1,
    openvr: 1,
    "spatial controller (spatial interaction source)": 1
  };
  var SESSION_ID = 0;
  var Session = class {
    constructor(mode, enabledFeatures, polyfillOptions = {}) {
      this.mode = mode;
      this.enabledFeatures = enabledFeatures;
      this.outputContext = null;
      this.immersive = mode == "immersive-vr" || mode == "immersive-ar";
      this.ended = null;
      this.baseLayer = null;
      this.id = ++SESSION_ID;
      this.modifiedCanvasLayer = false;
      if (this.outputContext && !TEST_ENV) {
        const renderContextType = polyfillOptions.renderContextType || "2d";
        this.renderContext = this.outputContext.canvas.getContext(renderContextType);
      }
    }
  };
  var WebVRDevice = class extends XRDevice {
    /**
     * Takes a VRDisplay instance and a VRFrameData
     * constructor from the WebVR 1.1 spec.
     *
     * @param {VRDisplay} display
     * @param {VRFrameData} VRFrameData
     */
    constructor(global2, display) {
      const { canPresent } = display.capabilities;
      super(global2);
      this.display = display;
      this.frame = new global2.VRFrameData();
      this.sessions = /* @__PURE__ */ new Map();
      this.immersiveSession = null;
      this.canPresent = canPresent;
      this.baseModelMatrix = create();
      this.gamepadInputSources = {};
      this.tempVec3 = new Float32Array(3);
      this.onVRDisplayPresentChange = this.onVRDisplayPresentChange.bind(this);
      global2.window.addEventListener("vrdisplaypresentchange", this.onVRDisplayPresentChange);
      this.CAN_USE_GAMEPAD = global2.navigator && "getGamepads" in global2.navigator;
      this.HAS_BITMAP_SUPPORT = isImageBitmapSupported(global2);
    }
    /**
     * @return {number}
     */
    get depthNear() {
      return this.display.depthNear;
    }
    /**
     * @param {number}
     */
    set depthNear(val) {
      this.display.depthNear = val;
    }
    /**
     * @return {number}
     */
    get depthFar() {
      return this.display.depthFar;
    }
    /**
     * @param {number}
     */
    set depthFar(val) {
      this.display.depthFar = val;
    }
    /**
     * Called when a XRSession has a `baseLayer` property set.
     *
     * @param {number} sessionId
     * @param {XRWebGLLayer} layer
     */
    onBaseLayerSet(sessionId, layer) {
      const session = this.sessions.get(sessionId);
      const canvas = layer.context.canvas;
      if (session.immersive) {
        const left = this.display.getEyeParameters("left");
        const right = this.display.getEyeParameters("right");
        canvas.width = Math.max(left.renderWidth, right.renderWidth) * 2;
        canvas.height = Math.max(left.renderHeight, right.renderHeight);
        this.display.requestPresent([{
          source: canvas,
          attributes: EXTRA_PRESENTATION_ATTRIBUTES
        }]).then(() => {
          if (!TEST_ENV && !this.global.document.body.contains(canvas)) {
            session.modifiedCanvasLayer = true;
            this.global.document.body.appendChild(canvas);
            applyCanvasStylesForMinimalRendering(canvas);
          }
          session.baseLayer = layer;
        });
      } else {
        session.baseLayer = layer;
      }
    }
    /**
     * If a 1.1 VRDisplay cannot present, it could be a 6DOF device
     * that doesn't have its own way to present, but used in magic
     * window mode. So in WebXR lingo, this cannot support an
     * "immersive" session.
     *
     * @param {XRSessionMode} mode
     * @return {boolean}
     */
    isSessionSupported(mode) {
      if (mode == "immersive-ar") {
        return false;
      }
      if (mode == "immersive-vr" && this.canPresent === false) {
        return false;
      }
      return true;
    }
    /**
     * @param {string} featureDescriptor
     * @return {boolean}
     */
    isFeatureSupported(featureDescriptor) {
      switch (featureDescriptor) {
        case "viewer":
          return true;
        case "local":
          return true;
        case "local-floor":
          return true;
        case "bounded":
          return false;
        case "unbounded":
          return false;
        default:
          return false;
      }
    }
    /**
     * Returns a promise of a session ID if creating a session is successful.
     * Usually used to set up presentation in the device.
     * We can't start presenting in a 1.1 device until we have a canvas
     * layer, so use a dummy layer until `onBaseLayerSet` is called.
     * May reject if session is not supported, or if an error is thrown
     * when calling `requestPresent`.
     *
     * @param {XRSessionMode} mode
     * @param {Set<string>} enabledFeatures
     * @return {Promise<number>}
     */
    async requestSession(mode, enabledFeatures) {
      if (!this.isSessionSupported(mode)) {
        return Promise.reject();
      }
      let immersive = mode == "immersive-vr";
      if (immersive) {
        const canvas = this.global.document.createElement("canvas");
        if (!TEST_ENV) {
          const ctx = canvas.getContext("webgl");
        }
        await this.display.requestPresent([{
          source: canvas,
          attributes: EXTRA_PRESENTATION_ATTRIBUTES
        }]);
      }
      const session = new Session(mode, enabledFeatures, {
        renderContextType: this.HAS_BITMAP_SUPPORT ? "bitmaprenderer" : "2d"
      });
      this.sessions.set(session.id, session);
      if (immersive) {
        this.immersiveSession = session;
        this.dispatchEvent("@@webxr-polyfill/vr-present-start", session.id);
      }
      return Promise.resolve(session.id);
    }
    /**
     * @return {Function}
     */
    requestAnimationFrame(callback) {
      return this.display.requestAnimationFrame(callback);
    }
    getPrimaryButtonIndex(gamepad) {
      let primaryButton = 0;
      let name = gamepad.id.toLowerCase();
      for (let key in PRIMARY_BUTTON_MAP) {
        if (name.includes(key)) {
          primaryButton = PRIMARY_BUTTON_MAP[key];
          break;
        }
      }
      return Math.min(primaryButton, gamepad.buttons.length - 1);
    }
    onFrameStart(sessionId, renderState) {
      this.display.depthNear = renderState.depthNear;
      this.display.depthFar = renderState.depthFar;
      this.display.getFrameData(this.frame);
      const session = this.sessions.get(sessionId);
      if (session.immersive && this.CAN_USE_GAMEPAD) {
        let prevInputSources = this.gamepadInputSources;
        this.gamepadInputSources = {};
        let gamepads = this.global.navigator.getGamepads();
        for (let i = 0; i < gamepads.length; ++i) {
          let gamepad = gamepads[i];
          if (gamepad && gamepad.displayId > 0) {
            let inputSourceImpl = prevInputSources[i];
            if (!inputSourceImpl) {
              inputSourceImpl = new GamepadXRInputSource(this, this.display, this.getPrimaryButtonIndex(gamepad));
            }
            inputSourceImpl.updateFromGamepad(gamepad);
            this.gamepadInputSources[i] = inputSourceImpl;
            if (inputSourceImpl.primaryButtonIndex != -1) {
              let primaryActionPressed = gamepad.buttons[inputSourceImpl.primaryButtonIndex].pressed;
              if (primaryActionPressed && !inputSourceImpl.primaryActionPressed) {
                this.dispatchEvent("@@webxr-polyfill/input-select-start", { sessionId: session.id, inputSource: inputSourceImpl.inputSource });
              } else if (!primaryActionPressed && inputSourceImpl.primaryActionPressed) {
                this.dispatchEvent("@@webxr-polyfill/input-select-end", { sessionId: session.id, inputSource: inputSourceImpl.inputSource });
              }
              inputSourceImpl.primaryActionPressed = primaryActionPressed;
            }
            if (inputSourceImpl.primarySqueezeButtonIndex != -1) {
              let primarySqueezeActionPressed = gamepad.buttons[inputSourceImpl.primarySqueezeButtonIndex].pressed;
              if (primarySqueezeActionPressed && !inputSourceImpl.primarySqueezeActionPressed) {
                this.dispatchEvent("@@webxr-polyfill/input-squeeze-start", { sessionId: session.id, inputSource: inputSourceImpl.inputSource });
              } else if (!primarySqueezeActionPressed && inputSourceImpl.primarySqueezeActionPressed) {
                this.dispatchEvent("@@webxr-polyfill/input-squeeze-end", { sessionId: session.id, inputSource: inputSourceImpl.inputSource });
              }
              inputSourceImpl.primarySqueezeActionPressed = primarySqueezeActionPressed;
            }
          }
        }
      }
      if (TEST_ENV) {
        return;
      }
      if (!session.immersive && session.baseLayer) {
        const canvas = session.baseLayer.context.canvas;
        perspective(
          this.frame.leftProjectionMatrix,
          renderState.inlineVerticalFieldOfView,
          canvas.width / canvas.height,
          renderState.depthNear,
          renderState.depthFar
        );
      }
    }
    onFrameEnd(sessionId) {
      const session = this.sessions.get(sessionId);
      if (session.ended || !session.baseLayer) {
        return;
      }
      if (session.outputContext && !(session.immersive && !this.display.capabilities.hasExternalDisplay)) {
        const mirroring = session.immersive && this.display.capabilities.hasExternalDisplay;
        const iCanvas = session.baseLayer.context.canvas;
        const iWidth = mirroring ? iCanvas.width / 2 : iCanvas.width;
        const iHeight = iCanvas.height;
        if (!TEST_ENV) {
          const oCanvas = session.outputContext.canvas;
          const oWidth = oCanvas.width;
          const oHeight = oCanvas.height;
          const renderContext = session.renderContext;
          if (this.HAS_BITMAP_SUPPORT) {
            if (iCanvas.transferToImageBitmap) {
              renderContext.transferFromImageBitmap(iCanvas.transferToImageBitmap());
            } else {
              this.global.createImageBitmap(iCanvas, 0, 0, iWidth, iHeight, {
                resizeWidth: oWidth,
                resizeHeight: oHeight
              }).then((bitmap) => renderContext.transferFromImageBitmap(bitmap));
            }
          } else {
            renderContext.drawImage(
              iCanvas,
              0,
              0,
              iWidth,
              iHeight,
              0,
              0,
              oWidth,
              oHeight
            );
          }
        }
      }
      if (session.immersive && session.baseLayer) {
        this.display.submitFrame();
      }
    }
    /**
     * @param {number} handle
     */
    cancelAnimationFrame(handle) {
      this.display.cancelAnimationFrame(handle);
    }
    /**
     * @TODO Spec
     */
    async endSession(sessionId) {
      const session = this.sessions.get(sessionId);
      if (session.ended) {
        return;
      }
      if (session.immersive) {
        return this.display.exitPresent();
      } else {
        session.ended = true;
      }
    }
    /**
     * @param {number} sessionId
     * @param {XRReferenceSpaceType} type
     * @return {boolean}
     */
    doesSessionSupportReferenceSpace(sessionId, type) {
      const session = this.sessions.get(sessionId);
      if (session.ended) {
        return false;
      }
      return session.enabledFeatures.has(type);
    }
    /**
     * If the VRDisplay has stage parameters, convert them
     * to an array of X, Z pairings.
     *
     * @return {Object?}
     */
    requestStageBounds() {
      if (this.display.stageParameters) {
        const width = this.display.stageParameters.sizeX;
        const depth = this.display.stageParameters.sizeZ;
        const data = [];
        data.push(-width / 2);
        data.push(-depth / 2);
        data.push(width / 2);
        data.push(-depth / 2);
        data.push(width / 2);
        data.push(depth / 2);
        data.push(-width / 2);
        data.push(depth / 2);
        return data;
      }
      return null;
    }
    /**
     * Returns a promise resolving to a transform if XRDevice
     * can support frame of reference and provides its own values.
     * Can resolve to `undefined` if the polyfilled API can provide
     * a default. Rejects if this XRDevice cannot
     * support the frame of reference.
     *
     * @param {XRFrameOfReferenceType} type
     * @param {XRFrameOfReferenceOptions} options
     * @return {Promise<float32rray>}
     */
    async requestFrameOfReferenceTransform(type, options) {
      if ((type === "local-floor" || type === "bounded-floor") && this.display.stageParameters && this.display.stageParameters.sittingToStandingTransform) {
        return this.display.stageParameters.sittingToStandingTransform;
      }
      return null;
    }
    /**
     * @param {XREye} eye
     * @return {Float32Array}
     */
    getProjectionMatrix(eye) {
      if (eye === "left") {
        return this.frame.leftProjectionMatrix;
      } else if (eye === "right") {
        return this.frame.rightProjectionMatrix;
      } else if (eye === "none") {
        return this.frame.leftProjectionMatrix;
      } else {
        throw new Error(`eye must be of type 'left' or 'right'`);
      }
    }
    /**
     * Takes a XREye and a target to apply properties of
     * `x`, `y`, `width` and `height` on. Returns a boolean
     * indicating if it successfully was able to populate
     * target's values.
     *
     * @param {number} sessionId
     * @param {XREye} eye
     * @param {XRWebGLLayer} layer
     * @param {Object?} target
     * @return {boolean}
     */
    getViewport(sessionId, eye, layer, target) {
      const session = this.sessions.get(sessionId);
      const { width, height } = layer.context.canvas;
      if (!session.immersive) {
        target.x = target.y = 0;
        target.width = width;
        target.height = height;
        return true;
      }
      if (eye === "left" || eye === "none") {
        target.x = 0;
      } else if (eye === "right") {
        target.x = width / 2;
      } else {
        return false;
      }
      target.y = 0;
      target.width = width / 2;
      target.height = height;
      return true;
    }
    /**
     * Get model matrix unaffected by frame of reference.
     *
     * @return {Float32Array}
     */
    getBasePoseMatrix() {
      let { position, orientation } = this.frame.pose;
      if (!position && !orientation) {
        return this.baseModelMatrix;
      }
      if (!position) {
        position = this.tempVec3;
        position[0] = position[1] = position[2] = 0;
      }
      fromRotationTranslation(this.baseModelMatrix, orientation, position);
      return this.baseModelMatrix;
    }
    /**
     * Get view matrix unaffected by frame of reference.
     *
     * @param {XREye} eye
     * @return {Float32Array}
     */
    getBaseViewMatrix(eye) {
      if (eye === "left" || eye === "none") {
        return this.frame.leftViewMatrix;
      } else if (eye === "right") {
        return this.frame.rightViewMatrix;
      } else {
        throw new Error(`eye must be of type 'left' or 'right'`);
      }
    }
    getInputSources() {
      let inputSources = [];
      for (let i in this.gamepadInputSources) {
        inputSources.push(this.gamepadInputSources[i].inputSource);
      }
      return inputSources;
    }
    getInputPose(inputSource, coordinateSystem, poseType) {
      if (!coordinateSystem) {
        return null;
      }
      for (let i in this.gamepadInputSources) {
        let inputSourceImpl = this.gamepadInputSources[i];
        if (inputSourceImpl.inputSource === inputSource) {
          return inputSourceImpl.getXRPose(coordinateSystem, poseType);
        }
      }
      return null;
    }
    /**
     * Triggered on window resize.
     *
     */
    onWindowResize() {
    }
    /**
     * Listens to the Native 1.1 `window.addEventListener('vrdisplaypresentchange')`
     * event.
     *
     * @param {Event} event
     */
    onVRDisplayPresentChange(e) {
      if (!this.display.isPresenting) {
        this.sessions.forEach((session) => {
          if (session.immersive && !session.ended) {
            if (session.modifiedCanvasLayer) {
              const canvas = session.baseLayer.context.canvas;
              document.body.removeChild(canvas);
              canvas.setAttribute("style", "");
            }
            if (this.immersiveSession === session) {
              this.immersiveSession = null;
            }
            this.dispatchEvent("@@webxr-polyfill/vr-present-end", session.id);
          }
        });
      }
    }
  };

  // node_modules/webxr-polyfill/src/devices/CardboardXRDevice.js
  var CardboardXRDevice = class extends WebVRDevice {
    /**
     * Takes a VRDisplay instance and a VRFrameData
     * constructor from the WebVR 1.1 spec.
     *
     * @param {VRDisplay} display
     * @param {Object?} cardboardConfig
     */
    constructor(global2, cardboardConfig) {
      const display = new import_cardboard_vr_display.default(cardboardConfig || {});
      super(global2, display);
      this.display = display;
      this.frame = {
        rightViewMatrix: new Float32Array(16),
        leftViewMatrix: new Float32Array(16),
        rightProjectionMatrix: new Float32Array(16),
        leftProjectionMatrix: new Float32Array(16),
        pose: null,
        timestamp: null
      };
    }
  };

  // node_modules/webxr-polyfill/src/devices/InlineDevice.js
  var TEST_ENV2 = false;
  var SESSION_ID2 = 0;
  var Session2 = class {
    constructor(mode, enabledFeatures) {
      this.mode = mode;
      this.enabledFeatures = enabledFeatures;
      this.ended = null;
      this.baseLayer = null;
      this.id = ++SESSION_ID2;
    }
  };
  var InlineDevice = class extends XRDevice {
    /**
     * Constructs an inline-only XRDevice
     */
    constructor(global2) {
      super(global2);
      this.sessions = /* @__PURE__ */ new Map();
      this.projectionMatrix = create();
      this.identityMatrix = create();
    }
    /**
     * Called when a XRSession has a `baseLayer` property set.
     *
     * @param {number} sessionId
     * @param {XRWebGLLayer} layer
     */
    onBaseLayerSet(sessionId, layer) {
      const session = this.sessions.get(sessionId);
      session.baseLayer = layer;
    }
    /**
     * Returns true if the requested mode is inline
     *
     * @param {XRSessionMode} mode
     * @return {boolean}
     */
    isSessionSupported(mode) {
      return mode == "inline";
    }
    /**
     * @param {string} featureDescriptor
     * @return {boolean}
     */
    isFeatureSupported(featureDescriptor) {
      switch (featureDescriptor) {
        case "viewer":
          return true;
        default:
          return false;
      }
    }
    /**
     * Returns a promise of a session ID if creating a session is successful.
     *
     * @param {XRSessionMode} mode
     * @param {Set<string>} enabledFeatures
     * @return {Promise<number>}
     */
    async requestSession(mode, enabledFeatures) {
      if (!this.isSessionSupported(mode)) {
        return Promise.reject();
      }
      const session = new Session2(mode, enabledFeatures);
      this.sessions.set(session.id, session);
      return Promise.resolve(session.id);
    }
    /**
     * @return {Function}
     */
    requestAnimationFrame(callback) {
      return window.requestAnimationFrame(callback);
    }
    /**
     * @param {number} handle
     */
    cancelAnimationFrame(handle) {
      window.cancelAnimationFrame(handle);
    }
    onFrameStart(sessionId, renderState) {
      if (TEST_ENV2) {
        return;
      }
      const session = this.sessions.get(sessionId);
      if (session.baseLayer) {
        const canvas = session.baseLayer.context.canvas;
        perspective(
          this.projectionMatrix,
          renderState.inlineVerticalFieldOfView,
          canvas.width / canvas.height,
          renderState.depthNear,
          renderState.depthFar
        );
      }
    }
    onFrameEnd(sessionId) {
    }
    /**
     * @TODO Spec
     */
    async endSession(sessionId) {
      const session = this.sessions.get(sessionId);
      session.ended = true;
    }
    /**
     * @param {number} sessionId
     * @param {XRReferenceSpaceType} type
     * @return {boolean}
     */
    doesSessionSupportReferenceSpace(sessionId, type) {
      const session = this.sessions.get(sessionId);
      if (session.ended) {
        return false;
      }
      return session.enabledFeatures.has(type);
    }
    /**
     * Inline sessions don't have stage bounds
     *
     * @return {Object?}
     */
    requestStageBounds() {
      return null;
    }
    /**
     * Inline sessions don't have multiple frames of reference
     *
     * @param {XRFrameOfReferenceType} type
     * @param {XRFrameOfReferenceOptions} options
     * @return {Promise<Float32Array>}
     */
    async requestFrameOfReferenceTransform(type, options) {
      return null;
    }
    /**
     * @param {XREye} eye
     * @return {Float32Array}
     */
    getProjectionMatrix(eye) {
      return this.projectionMatrix;
    }
    /**
     * Takes a XREye and a target to apply properties of
     * `x`, `y`, `width` and `height` on. Returns a boolean
     * indicating if it successfully was able to populate
     * target's values.
     *
     * @param {number} sessionId
     * @param {XREye} eye
     * @param {XRWebGLLayer} layer
     * @param {Object?} target
     * @return {boolean}
     */
    getViewport(sessionId, eye, layer, target) {
      const session = this.sessions.get(sessionId);
      const { width, height } = layer.context.canvas;
      target.x = target.y = 0;
      target.width = width;
      target.height = height;
      return true;
    }
    /**
     * Get model matrix unaffected by frame of reference.
     *
     * @return {Float32Array}
     */
    getBasePoseMatrix() {
      return this.identityMatrix;
    }
    /**
     * Get view matrix unaffected by frame of reference.
     *
     * @param {XREye} eye
     * @return {Float32Array}
     */
    getBaseViewMatrix(eye) {
      return this.identityMatrix;
    }
    /**
     * No persistent input sources for the inline session
     */
    getInputSources() {
      return [];
    }
    getInputPose(inputSource, coordinateSystem, poseType) {
      return null;
    }
    /**
     * Triggered on window resize.
     */
    onWindowResize() {
    }
  };

  // node_modules/webxr-polyfill/src/devices.js
  var getWebVRDevice = async function(global2) {
    let device2 = null;
    if ("getVRDisplays" in global2.navigator) {
      try {
        const displays = await global2.navigator.getVRDisplays();
        if (displays && displays.length) {
          device2 = new WebVRDevice(global2, displays[0]);
        }
      } catch (e) {
      }
    }
    return device2;
  };
  var requestXRDevice = async function(global2, config2) {
    if (config2.webvr) {
      let xr2 = await getWebVRDevice(global2);
      if (xr2) {
        return xr2;
      }
    }
    let mobile = isMobile(global2);
    if (mobile && config2.cardboard || !mobile && config2.allowCardboardOnDesktop) {
      if (!global2.VRFrameData) {
        global2.VRFrameData = function() {
          this.rightViewMatrix = new Float32Array(16);
          this.leftViewMatrix = new Float32Array(16);
          this.rightProjectionMatrix = new Float32Array(16);
          this.leftProjectionMatrix = new Float32Array(16);
          this.pose = null;
        };
      }
      return new CardboardXRDevice(global2, config2.cardboardConfig);
    }
    return new InlineDevice(global2);
  };

  // node_modules/webxr-polyfill/src/WebXRPolyfill.js
  var CONFIG_DEFAULTS = {
    // The default global to use for needed APIs.
    global: global_default,
    // Whether support for a browser implementing WebVR 1.1 is enabled.
    // If enabled, XR support is powered by native WebVR 1.1 VRDisplays,
    // exposed as XRDevices.
    webvr: true,
    // Whether a CardboardXRDevice should be discoverable if on
    // a mobile device, and no other native (1.1 VRDisplay if `webvr` on,
    // or XRDevice) found.
    cardboard: true,
    // The configuration to be used for CardboardVRDisplay when used.
    // Has no effect if `cardboard: false` or another XRDevice is used.
    // Configuration can be found: https://github.com/immersive-web/cardboard-vr-display/blob/master/src/options.js
    cardboardConfig: null,
    // Whether a CardboardXRDevice should be created if no WebXR API found
    // on desktop or not. Stereoscopic rendering with a gyro often does not make sense on desktop, and probably only useful for debugging.
    allowCardboardOnDesktop: false
  };
  var partials = ["navigator", "HTMLCanvasElement", "WebGLRenderingContext"];
  var WebXRPolyfill = class {
    /**
     * @param {object?} config
     */
    constructor(config2 = {}) {
      this.config = Object.freeze(Object.assign({}, CONFIG_DEFAULTS, config2));
      this.global = this.config.global;
      this.nativeWebXR = "xr" in this.global.navigator;
      this.injected = false;
      if (!this.nativeWebXR) {
        this._injectPolyfill(this.global);
      } else {
        this._injectCompatibilityShims(this.global);
      }
    }
    _injectPolyfill(global2) {
      if (!partials.every((iface) => !!global2[iface])) {
        throw new Error(`Global must have the following attributes : ${partials}`);
      }
      for (const className of Object.keys(api_default)) {
        if (global2[className] !== void 0) {
          console.warn(`${className} already defined on global.`);
        } else {
          global2[className] = api_default[className];
        }
      }
      if (true) {
        const polyfilledCtx = polyfillMakeXRCompatible(global2.WebGLRenderingContext);
        if (polyfilledCtx) {
          polyfillGetContext(global2.HTMLCanvasElement);
          if (global2.OffscreenCanvas) {
            polyfillGetContext(global2.OffscreenCanvas);
          }
          if (global2.WebGL2RenderingContext) {
            polyfillMakeXRCompatible(global2.WebGL2RenderingContext);
          }
          if (!window.isSecureContext) {
            console.warn(`WebXR Polyfill Warning:
This page is not running in a secure context (https:// or localhost)!
This means that although the page may be able to use the WebXR Polyfill it will
not be able to use native WebXR implementations, and as such will not be able to
access dedicated VR or AR hardware, and will not be able to take advantage of
any performance improvements a native WebXR implementation may offer. Please
host this content on a secure origin for the best user experience.
`);
          }
        }
      }
      this.injected = true;
      this._patchNavigatorXR();
    }
    _patchNavigatorXR() {
      let devicePromise = requestXRDevice(this.global, this.config);
      this.xr = new api_default.XRSystem(devicePromise);
      Object.defineProperty(this.global.navigator, "xr", {
        value: this.xr,
        configurable: true
      });
    }
    _injectCompatibilityShims(global2) {
      if (!partials.every((iface) => !!global2[iface])) {
        throw new Error(`Global must have the following attributes : ${partials}`);
      }
      if (global2.navigator.xr && "supportsSession" in global2.navigator.xr && !("isSessionSupported" in global2.navigator.xr)) {
        let originalSupportsSession = global2.navigator.xr.supportsSession;
        global2.navigator.xr.isSessionSupported = function(mode) {
          return originalSupportsSession.call(this, mode).then(() => {
            return true;
          }).catch(() => {
            return false;
          });
        };
        global2.navigator.xr.supportsSession = function(mode) {
          console.warn("navigator.xr.supportsSession() is deprecated. Please call navigator.xr.isSessionSupported() instead and check the boolean value returned when the promise resolves.");
          return originalSupportsSession.call(this, mode);
        };
      }
    }
  };

  // node_modules/gl-matrix/esm/common.js
  var EPSILON2 = 1e-6;
  var ARRAY_TYPE2 = typeof Float32Array !== "undefined" ? Float32Array : Array;
  var RANDOM2 = Math.random;
  function round(a) {
    if (a >= 0)
      return Math.round(a);
    return a % 0.5 === 0 ? Math.floor(a) : Math.round(a);
  }
  var degree2 = Math.PI / 180;
  var radian = 180 / Math.PI;

  // node_modules/gl-matrix/esm/mat4.js
  var mat4_exports2 = {};
  __export(mat4_exports2, {
    add: () => add3,
    adjoint: () => adjoint,
    clone: () => clone4,
    copy: () => copy5,
    create: () => create6,
    decompose: () => decompose,
    determinant: () => determinant,
    equals: () => equals2,
    exactEquals: () => exactEquals2,
    frob: () => frob,
    fromQuat: () => fromQuat,
    fromQuat2: () => fromQuat2,
    fromRotation: () => fromRotation,
    fromRotationTranslation: () => fromRotationTranslation2,
    fromRotationTranslationScale: () => fromRotationTranslationScale,
    fromRotationTranslationScaleOrigin: () => fromRotationTranslationScaleOrigin,
    fromScaling: () => fromScaling,
    fromTranslation: () => fromTranslation,
    fromValues: () => fromValues4,
    fromXRotation: () => fromXRotation,
    fromYRotation: () => fromYRotation,
    fromZRotation: () => fromZRotation,
    frustum: () => frustum,
    getRotation: () => getRotation2,
    getScaling: () => getScaling,
    getTranslation: () => getTranslation2,
    identity: () => identity2,
    invert: () => invert3,
    lookAt: () => lookAt,
    mul: () => mul,
    multiply: () => multiply3,
    multiplyScalar: () => multiplyScalar,
    multiplyScalarAndAdd: () => multiplyScalarAndAdd,
    ortho: () => ortho,
    orthoNO: () => orthoNO,
    orthoZO: () => orthoZO,
    perspective: () => perspective2,
    perspectiveFromFieldOfView: () => perspectiveFromFieldOfView,
    perspectiveNO: () => perspectiveNO,
    perspectiveZO: () => perspectiveZO,
    rotate: () => rotate,
    rotateX: () => rotateX,
    rotateY: () => rotateY,
    rotateZ: () => rotateZ,
    scale: () => scale3,
    set: () => set2,
    str: () => str,
    sub: () => sub,
    subtract: () => subtract,
    targetTo: () => targetTo,
    translate: () => translate,
    transpose: () => transpose
  });
  function create6() {
    var out = new ARRAY_TYPE2(16);
    if (ARRAY_TYPE2 != Float32Array) {
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
    }
    out[0] = 1;
    out[5] = 1;
    out[10] = 1;
    out[15] = 1;
    return out;
  }
  function clone4(a) {
    var out = new ARRAY_TYPE2(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
  }
  function copy5(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
  }
  function fromValues4(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    var out = new ARRAY_TYPE2(16);
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m03;
    out[4] = m10;
    out[5] = m11;
    out[6] = m12;
    out[7] = m13;
    out[8] = m20;
    out[9] = m21;
    out[10] = m22;
    out[11] = m23;
    out[12] = m30;
    out[13] = m31;
    out[14] = m32;
    out[15] = m33;
    return out;
  }
  function set2(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m03;
    out[4] = m10;
    out[5] = m11;
    out[6] = m12;
    out[7] = m13;
    out[8] = m20;
    out[9] = m21;
    out[10] = m22;
    out[11] = m23;
    out[12] = m30;
    out[13] = m31;
    out[14] = m32;
    out[15] = m33;
    return out;
  }
  function identity2(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  function transpose(out, a) {
    if (out === a) {
      var a01 = a[1], a02 = a[2], a03 = a[3];
      var a12 = a[6], a13 = a[7];
      var a23 = a[11];
      out[1] = a[4];
      out[2] = a[8];
      out[3] = a[12];
      out[4] = a01;
      out[6] = a[9];
      out[7] = a[13];
      out[8] = a02;
      out[9] = a12;
      out[11] = a[14];
      out[12] = a03;
      out[13] = a13;
      out[14] = a23;
    } else {
      out[0] = a[0];
      out[1] = a[4];
      out[2] = a[8];
      out[3] = a[12];
      out[4] = a[1];
      out[5] = a[5];
      out[6] = a[9];
      out[7] = a[13];
      out[8] = a[2];
      out[9] = a[6];
      out[10] = a[10];
      out[11] = a[14];
      out[12] = a[3];
      out[13] = a[7];
      out[14] = a[11];
      out[15] = a[15];
    }
    return out;
  }
  function invert3(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32;
    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) {
      return null;
    }
    det = 1 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  }
  function adjoint(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32;
    out[0] = a11 * b11 - a12 * b10 + a13 * b09;
    out[1] = a02 * b10 - a01 * b11 - a03 * b09;
    out[2] = a31 * b05 - a32 * b04 + a33 * b03;
    out[3] = a22 * b04 - a21 * b05 - a23 * b03;
    out[4] = a12 * b08 - a10 * b11 - a13 * b07;
    out[5] = a00 * b11 - a02 * b08 + a03 * b07;
    out[6] = a32 * b02 - a30 * b05 - a33 * b01;
    out[7] = a20 * b05 - a22 * b02 + a23 * b01;
    out[8] = a10 * b10 - a11 * b08 + a13 * b06;
    out[9] = a01 * b08 - a00 * b10 - a03 * b06;
    out[10] = a30 * b04 - a31 * b02 + a33 * b00;
    out[11] = a21 * b02 - a20 * b04 - a23 * b00;
    out[12] = a11 * b07 - a10 * b09 - a12 * b06;
    out[13] = a00 * b09 - a01 * b07 + a02 * b06;
    out[14] = a31 * b01 - a30 * b03 - a32 * b00;
    out[15] = a20 * b03 - a21 * b01 + a22 * b00;
    return out;
  }
  function determinant(a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    var b0 = a00 * a11 - a01 * a10;
    var b1 = a00 * a12 - a02 * a10;
    var b2 = a01 * a12 - a02 * a11;
    var b3 = a20 * a31 - a21 * a30;
    var b4 = a20 * a32 - a22 * a30;
    var b5 = a21 * a32 - a22 * a31;
    var b6 = a00 * b5 - a01 * b4 + a02 * b3;
    var b7 = a10 * b5 - a11 * b4 + a12 * b3;
    var b8 = a20 * b2 - a21 * b1 + a22 * b0;
    var b9 = a30 * b2 - a31 * b1 + a32 * b0;
    return a13 * b6 - a03 * b7 + a33 * b8 - a23 * b9;
  }
  function multiply3(out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
  }
  function translate(out, a, v) {
    var x = v[0], y = v[1], z = v[2];
    var a00, a01, a02, a03;
    var a10, a11, a12, a13;
    var a20, a21, a22, a23;
    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      a00 = a[0];
      a01 = a[1];
      a02 = a[2];
      a03 = a[3];
      a10 = a[4];
      a11 = a[5];
      a12 = a[6];
      a13 = a[7];
      a20 = a[8];
      a21 = a[9];
      a22 = a[10];
      a23 = a[11];
      out[0] = a00;
      out[1] = a01;
      out[2] = a02;
      out[3] = a03;
      out[4] = a10;
      out[5] = a11;
      out[6] = a12;
      out[7] = a13;
      out[8] = a20;
      out[9] = a21;
      out[10] = a22;
      out[11] = a23;
      out[12] = a00 * x + a10 * y + a20 * z + a[12];
      out[13] = a01 * x + a11 * y + a21 * z + a[13];
      out[14] = a02 * x + a12 * y + a22 * z + a[14];
      out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }
    return out;
  }
  function scale3(out, a, v) {
    var x = v[0], y = v[1], z = v[2];
    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
  }
  function rotate(out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2];
    var len3 = Math.sqrt(x * x + y * y + z * z);
    var s, c, t;
    var a00, a01, a02, a03;
    var a10, a11, a12, a13;
    var a20, a21, a22, a23;
    var b00, b01, b02;
    var b10, b11, b12;
    var b20, b21, b22;
    if (len3 < EPSILON2) {
      return null;
    }
    len3 = 1 / len3;
    x *= len3;
    y *= len3;
    z *= len3;
    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c;
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;
    if (a !== out) {
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    return out;
  }
  function rotateX(out, a, rad) {
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    var a10 = a[4];
    var a11 = a[5];
    var a12 = a[6];
    var a13 = a[7];
    var a20 = a[8];
    var a21 = a[9];
    var a22 = a[10];
    var a23 = a[11];
    if (a !== out) {
      out[0] = a[0];
      out[1] = a[1];
      out[2] = a[2];
      out[3] = a[3];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
  }
  function rotateY(out, a, rad) {
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    var a00 = a[0];
    var a01 = a[1];
    var a02 = a[2];
    var a03 = a[3];
    var a20 = a[8];
    var a21 = a[9];
    var a22 = a[10];
    var a23 = a[11];
    if (a !== out) {
      out[4] = a[4];
      out[5] = a[5];
      out[6] = a[6];
      out[7] = a[7];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
  }
  function rotateZ(out, a, rad) {
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    var a00 = a[0];
    var a01 = a[1];
    var a02 = a[2];
    var a03 = a[3];
    var a10 = a[4];
    var a11 = a[5];
    var a12 = a[6];
    var a13 = a[7];
    if (a !== out) {
      out[8] = a[8];
      out[9] = a[9];
      out[10] = a[10];
      out[11] = a[11];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
  }
  function fromTranslation(out, v) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
  }
  function fromScaling(out, v) {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = v[1];
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = v[2];
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  function fromRotation(out, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2];
    var len3 = Math.sqrt(x * x + y * y + z * z);
    var s, c, t;
    if (len3 < EPSILON2) {
      return null;
    }
    len3 = 1 / len3;
    x *= len3;
    y *= len3;
    z *= len3;
    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;
    out[0] = x * x * t + c;
    out[1] = y * x * t + z * s;
    out[2] = z * x * t - y * s;
    out[3] = 0;
    out[4] = x * y * t - z * s;
    out[5] = y * y * t + c;
    out[6] = z * y * t + x * s;
    out[7] = 0;
    out[8] = x * z * t + y * s;
    out[9] = y * z * t - x * s;
    out[10] = z * z * t + c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  function fromXRotation(out, rad) {
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = c;
    out[6] = s;
    out[7] = 0;
    out[8] = 0;
    out[9] = -s;
    out[10] = c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  function fromYRotation(out, rad) {
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    out[0] = c;
    out[1] = 0;
    out[2] = -s;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = s;
    out[9] = 0;
    out[10] = c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  function fromZRotation(out, rad) {
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    out[0] = c;
    out[1] = s;
    out[2] = 0;
    out[3] = 0;
    out[4] = -s;
    out[5] = c;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  function fromRotationTranslation2(out, q, v) {
    var x = q[0], y = q[1], z = q[2], w = q[3];
    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var xy = x * y2;
    var xz = x * z2;
    var yy = y * y2;
    var yz = y * z2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;
    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
  }
  function fromQuat2(out, a) {
    var translation = new ARRAY_TYPE2(3);
    var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7];
    var magnitude = bx * bx + by * by + bz * bz + bw * bw;
    if (magnitude > 0) {
      translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 / magnitude;
      translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 / magnitude;
      translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 / magnitude;
    } else {
      translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
      translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
      translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
    }
    fromRotationTranslation2(out, a, translation);
    return out;
  }
  function getTranslation2(out, mat) {
    out[0] = mat[12];
    out[1] = mat[13];
    out[2] = mat[14];
    return out;
  }
  function getScaling(out, mat) {
    var m11 = mat[0];
    var m12 = mat[1];
    var m13 = mat[2];
    var m21 = mat[4];
    var m22 = mat[5];
    var m23 = mat[6];
    var m31 = mat[8];
    var m32 = mat[9];
    var m33 = mat[10];
    out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
    out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
    out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
    return out;
  }
  function getRotation2(out, mat) {
    var scaling = new ARRAY_TYPE2(3);
    getScaling(scaling, mat);
    var is1 = 1 / scaling[0];
    var is2 = 1 / scaling[1];
    var is3 = 1 / scaling[2];
    var sm11 = mat[0] * is1;
    var sm12 = mat[1] * is2;
    var sm13 = mat[2] * is3;
    var sm21 = mat[4] * is1;
    var sm22 = mat[5] * is2;
    var sm23 = mat[6] * is3;
    var sm31 = mat[8] * is1;
    var sm32 = mat[9] * is2;
    var sm33 = mat[10] * is3;
    var trace = sm11 + sm22 + sm33;
    var S = 0;
    if (trace > 0) {
      S = Math.sqrt(trace + 1) * 2;
      out[3] = 0.25 * S;
      out[0] = (sm23 - sm32) / S;
      out[1] = (sm31 - sm13) / S;
      out[2] = (sm12 - sm21) / S;
    } else if (sm11 > sm22 && sm11 > sm33) {
      S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
      out[3] = (sm23 - sm32) / S;
      out[0] = 0.25 * S;
      out[1] = (sm12 + sm21) / S;
      out[2] = (sm31 + sm13) / S;
    } else if (sm22 > sm33) {
      S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
      out[3] = (sm31 - sm13) / S;
      out[0] = (sm12 + sm21) / S;
      out[1] = 0.25 * S;
      out[2] = (sm23 + sm32) / S;
    } else {
      S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
      out[3] = (sm12 - sm21) / S;
      out[0] = (sm31 + sm13) / S;
      out[1] = (sm23 + sm32) / S;
      out[2] = 0.25 * S;
    }
    return out;
  }
  function decompose(out_r, out_t, out_s, mat) {
    out_t[0] = mat[12];
    out_t[1] = mat[13];
    out_t[2] = mat[14];
    var m11 = mat[0];
    var m12 = mat[1];
    var m13 = mat[2];
    var m21 = mat[4];
    var m22 = mat[5];
    var m23 = mat[6];
    var m31 = mat[8];
    var m32 = mat[9];
    var m33 = mat[10];
    out_s[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
    out_s[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
    out_s[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
    var is1 = 1 / out_s[0];
    var is2 = 1 / out_s[1];
    var is3 = 1 / out_s[2];
    var sm11 = m11 * is1;
    var sm12 = m12 * is2;
    var sm13 = m13 * is3;
    var sm21 = m21 * is1;
    var sm22 = m22 * is2;
    var sm23 = m23 * is3;
    var sm31 = m31 * is1;
    var sm32 = m32 * is2;
    var sm33 = m33 * is3;
    var trace = sm11 + sm22 + sm33;
    var S = 0;
    if (trace > 0) {
      S = Math.sqrt(trace + 1) * 2;
      out_r[3] = 0.25 * S;
      out_r[0] = (sm23 - sm32) / S;
      out_r[1] = (sm31 - sm13) / S;
      out_r[2] = (sm12 - sm21) / S;
    } else if (sm11 > sm22 && sm11 > sm33) {
      S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
      out_r[3] = (sm23 - sm32) / S;
      out_r[0] = 0.25 * S;
      out_r[1] = (sm12 + sm21) / S;
      out_r[2] = (sm31 + sm13) / S;
    } else if (sm22 > sm33) {
      S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
      out_r[3] = (sm31 - sm13) / S;
      out_r[0] = (sm12 + sm21) / S;
      out_r[1] = 0.25 * S;
      out_r[2] = (sm23 + sm32) / S;
    } else {
      S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
      out_r[3] = (sm12 - sm21) / S;
      out_r[0] = (sm31 + sm13) / S;
      out_r[1] = (sm23 + sm32) / S;
      out_r[2] = 0.25 * S;
    }
    return out_r;
  }
  function fromRotationTranslationScale(out, q, v, s) {
    var x = q[0], y = q[1], z = q[2], w = q[3];
    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var xy = x * y2;
    var xz = x * z2;
    var yy = y * y2;
    var yz = y * z2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;
    var sx = s[0];
    var sy = s[1];
    var sz = s[2];
    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[3] = 0;
    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[7] = 0;
    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
  }
  function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
    var x = q[0], y = q[1], z = q[2], w = q[3];
    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var xy = x * y2;
    var xz = x * z2;
    var yy = y * y2;
    var yz = y * z2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;
    var sx = s[0];
    var sy = s[1];
    var sz = s[2];
    var ox = o[0];
    var oy = o[1];
    var oz = o[2];
    var out0 = (1 - (yy + zz)) * sx;
    var out1 = (xy + wz) * sx;
    var out2 = (xz - wy) * sx;
    var out4 = (xy - wz) * sy;
    var out5 = (1 - (xx + zz)) * sy;
    var out6 = (yz + wx) * sy;
    var out8 = (xz + wy) * sz;
    var out9 = (yz - wx) * sz;
    var out10 = (1 - (xx + yy)) * sz;
    out[0] = out0;
    out[1] = out1;
    out[2] = out2;
    out[3] = 0;
    out[4] = out4;
    out[5] = out5;
    out[6] = out6;
    out[7] = 0;
    out[8] = out8;
    out[9] = out9;
    out[10] = out10;
    out[11] = 0;
    out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
    out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
    out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
    out[15] = 1;
    return out;
  }
  function fromQuat(out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3];
    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var yx = y * x2;
    var yy = y * y2;
    var zx = z * x2;
    var zy = z * y2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;
    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;
    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;
    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  function frustum(out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left);
    var tb = 1 / (top - bottom);
    var nf = 1 / (near - far);
    out[0] = near * 2 * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = near * 2 * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = far * near * 2 * nf;
    out[15] = 0;
    return out;
  }
  function perspectiveNO(out, fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;
    if (far != null && far !== Infinity) {
      var nf = 1 / (near - far);
      out[10] = (far + near) * nf;
      out[14] = 2 * far * near * nf;
    } else {
      out[10] = -1;
      out[14] = -2 * near;
    }
    return out;
  }
  var perspective2 = perspectiveNO;
  function perspectiveZO(out, fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;
    if (far != null && far !== Infinity) {
      var nf = 1 / (near - far);
      out[10] = far * nf;
      out[14] = far * near * nf;
    } else {
      out[10] = -1;
      out[14] = -near;
    }
    return out;
  }
  function perspectiveFromFieldOfView(out, fov, near, far) {
    var upTan = Math.tan(fov.upDegrees * Math.PI / 180);
    var downTan = Math.tan(fov.downDegrees * Math.PI / 180);
    var leftTan = Math.tan(fov.leftDegrees * Math.PI / 180);
    var rightTan = Math.tan(fov.rightDegrees * Math.PI / 180);
    var xScale = 2 / (leftTan + rightTan);
    var yScale = 2 / (upTan + downTan);
    out[0] = xScale;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = yScale;
    out[6] = 0;
    out[7] = 0;
    out[8] = -((leftTan - rightTan) * xScale * 0.5);
    out[9] = (upTan - downTan) * yScale * 0.5;
    out[10] = far / (near - far);
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = far * near / (near - far);
    out[15] = 0;
    return out;
  }
  function orthoNO(out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right);
    var bt = 1 / (bottom - top);
    var nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
  }
  var ortho = orthoNO;
  function orthoZO(out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right);
    var bt = 1 / (bottom - top);
    var nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = near * nf;
    out[15] = 1;
    return out;
  }
  function lookAt(out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len3;
    var eyex = eye[0];
    var eyey = eye[1];
    var eyez = eye[2];
    var upx = up[0];
    var upy = up[1];
    var upz = up[2];
    var centerx = center[0];
    var centery = center[1];
    var centerz = center[2];
    if (Math.abs(eyex - centerx) < EPSILON2 && Math.abs(eyey - centery) < EPSILON2 && Math.abs(eyez - centerz) < EPSILON2) {
      return identity2(out);
    }
    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;
    len3 = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len3;
    z1 *= len3;
    z2 *= len3;
    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len3 = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len3) {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    } else {
      len3 = 1 / len3;
      x0 *= len3;
      x1 *= len3;
      x2 *= len3;
    }
    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;
    len3 = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len3) {
      y0 = 0;
      y1 = 0;
      y2 = 0;
    } else {
      len3 = 1 / len3;
      y0 *= len3;
      y1 *= len3;
      y2 *= len3;
    }
    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;
    return out;
  }
  function targetTo(out, eye, target, up) {
    var eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2];
    var z0 = eyex - target[0], z1 = eyey - target[1], z2 = eyez - target[2];
    var len3 = z0 * z0 + z1 * z1 + z2 * z2;
    if (len3 > 0) {
      len3 = 1 / Math.sqrt(len3);
      z0 *= len3;
      z1 *= len3;
      z2 *= len3;
    }
    var x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
    len3 = x0 * x0 + x1 * x1 + x2 * x2;
    if (len3 > 0) {
      len3 = 1 / Math.sqrt(len3);
      x0 *= len3;
      x1 *= len3;
      x2 *= len3;
    }
    out[0] = x0;
    out[1] = x1;
    out[2] = x2;
    out[3] = 0;
    out[4] = z1 * x2 - z2 * x1;
    out[5] = z2 * x0 - z0 * x2;
    out[6] = z0 * x1 - z1 * x0;
    out[7] = 0;
    out[8] = z0;
    out[9] = z1;
    out[10] = z2;
    out[11] = 0;
    out[12] = eyex;
    out[13] = eyey;
    out[14] = eyez;
    out[15] = 1;
    return out;
  }
  function str(a) {
    return "mat4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + ")";
  }
  function frob(a) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3] + a[4] * a[4] + a[5] * a[5] + a[6] * a[6] + a[7] * a[7] + a[8] * a[8] + a[9] * a[9] + a[10] * a[10] + a[11] * a[11] + a[12] * a[12] + a[13] * a[13] + a[14] * a[14] + a[15] * a[15]);
  }
  function add3(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    out[4] = a[4] + b[4];
    out[5] = a[5] + b[5];
    out[6] = a[6] + b[6];
    out[7] = a[7] + b[7];
    out[8] = a[8] + b[8];
    out[9] = a[9] + b[9];
    out[10] = a[10] + b[10];
    out[11] = a[11] + b[11];
    out[12] = a[12] + b[12];
    out[13] = a[13] + b[13];
    out[14] = a[14] + b[14];
    out[15] = a[15] + b[15];
    return out;
  }
  function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    out[4] = a[4] - b[4];
    out[5] = a[5] - b[5];
    out[6] = a[6] - b[6];
    out[7] = a[7] - b[7];
    out[8] = a[8] - b[8];
    out[9] = a[9] - b[9];
    out[10] = a[10] - b[10];
    out[11] = a[11] - b[11];
    out[12] = a[12] - b[12];
    out[13] = a[13] - b[13];
    out[14] = a[14] - b[14];
    out[15] = a[15] - b[15];
    return out;
  }
  function multiplyScalar(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    out[4] = a[4] * b;
    out[5] = a[5] * b;
    out[6] = a[6] * b;
    out[7] = a[7] * b;
    out[8] = a[8] * b;
    out[9] = a[9] * b;
    out[10] = a[10] * b;
    out[11] = a[11] * b;
    out[12] = a[12] * b;
    out[13] = a[13] * b;
    out[14] = a[14] * b;
    out[15] = a[15] * b;
    return out;
  }
  function multiplyScalarAndAdd(out, a, b, scale5) {
    out[0] = a[0] + b[0] * scale5;
    out[1] = a[1] + b[1] * scale5;
    out[2] = a[2] + b[2] * scale5;
    out[3] = a[3] + b[3] * scale5;
    out[4] = a[4] + b[4] * scale5;
    out[5] = a[5] + b[5] * scale5;
    out[6] = a[6] + b[6] * scale5;
    out[7] = a[7] + b[7] * scale5;
    out[8] = a[8] + b[8] * scale5;
    out[9] = a[9] + b[9] * scale5;
    out[10] = a[10] + b[10] * scale5;
    out[11] = a[11] + b[11] * scale5;
    out[12] = a[12] + b[12] * scale5;
    out[13] = a[13] + b[13] * scale5;
    out[14] = a[14] + b[14] * scale5;
    out[15] = a[15] + b[15] * scale5;
    return out;
  }
  function exactEquals2(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
  }
  function equals2(a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7];
    var a8 = a[8], a9 = a[9], a10 = a[10], a11 = a[11];
    var a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    var b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
    var b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11];
    var b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
    return Math.abs(a0 - b0) <= EPSILON2 * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON2 * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON2 * Math.max(1, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON2 * Math.max(1, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON2 * Math.max(1, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON2 * Math.max(1, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON2 * Math.max(1, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON2 * Math.max(1, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON2 * Math.max(1, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= EPSILON2 * Math.max(1, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= EPSILON2 * Math.max(1, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= EPSILON2 * Math.max(1, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= EPSILON2 * Math.max(1, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= EPSILON2 * Math.max(1, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= EPSILON2 * Math.max(1, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= EPSILON2 * Math.max(1, Math.abs(a15), Math.abs(b15));
  }
  var mul = multiply3;
  var sub = subtract;

  // node_modules/gl-matrix/esm/vec3.js
  var vec3_exports2 = {};
  __export(vec3_exports2, {
    add: () => add4,
    angle: () => angle2,
    bezier: () => bezier,
    ceil: () => ceil,
    clone: () => clone5,
    copy: () => copy6,
    create: () => create7,
    cross: () => cross2,
    dist: () => dist,
    distance: () => distance,
    div: () => div,
    divide: () => divide,
    dot: () => dot3,
    equals: () => equals3,
    exactEquals: () => exactEquals3,
    floor: () => floor,
    forEach: () => forEach3,
    fromValues: () => fromValues5,
    hermite: () => hermite,
    inverse: () => inverse,
    len: () => len2,
    length: () => length3,
    lerp: () => lerp2,
    max: () => max,
    min: () => min,
    mul: () => mul2,
    multiply: () => multiply4,
    negate: () => negate,
    normalize: () => normalize4,
    random: () => random,
    rotateX: () => rotateX2,
    rotateY: () => rotateY2,
    rotateZ: () => rotateZ2,
    round: () => round2,
    scale: () => scale4,
    scaleAndAdd: () => scaleAndAdd,
    set: () => set3,
    slerp: () => slerp2,
    sqrDist: () => sqrDist,
    sqrLen: () => sqrLen,
    squaredDistance: () => squaredDistance,
    squaredLength: () => squaredLength2,
    str: () => str2,
    sub: () => sub2,
    subtract: () => subtract2,
    transformMat3: () => transformMat3,
    transformMat4: () => transformMat4,
    transformQuat: () => transformQuat2,
    zero: () => zero
  });
  function create7() {
    var out = new ARRAY_TYPE2(3);
    if (ARRAY_TYPE2 != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
    }
    return out;
  }
  function clone5(a) {
    var out = new ARRAY_TYPE2(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
  }
  function length3(a) {
    var x = a[0];
    var y = a[1];
    var z = a[2];
    return Math.sqrt(x * x + y * y + z * z);
  }
  function fromValues5(x, y, z) {
    var out = new ARRAY_TYPE2(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
  }
  function copy6(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
  }
  function set3(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
  }
  function add4(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
  }
  function subtract2(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
  }
  function multiply4(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
  }
  function divide(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
  }
  function ceil(out, a) {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);
    out[2] = Math.ceil(a[2]);
    return out;
  }
  function floor(out, a) {
    out[0] = Math.floor(a[0]);
    out[1] = Math.floor(a[1]);
    out[2] = Math.floor(a[2]);
    return out;
  }
  function min(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
  }
  function max(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
  }
  function round2(out, a) {
    out[0] = round(a[0]);
    out[1] = round(a[1]);
    out[2] = round(a[2]);
    return out;
  }
  function scale4(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
  }
  function scaleAndAdd(out, a, b, scale5) {
    out[0] = a[0] + b[0] * scale5;
    out[1] = a[1] + b[1] * scale5;
    out[2] = a[2] + b[2] * scale5;
    return out;
  }
  function distance(a, b) {
    var x = b[0] - a[0];
    var y = b[1] - a[1];
    var z = b[2] - a[2];
    return Math.sqrt(x * x + y * y + z * z);
  }
  function squaredDistance(a, b) {
    var x = b[0] - a[0];
    var y = b[1] - a[1];
    var z = b[2] - a[2];
    return x * x + y * y + z * z;
  }
  function squaredLength2(a) {
    var x = a[0];
    var y = a[1];
    var z = a[2];
    return x * x + y * y + z * z;
  }
  function negate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
  }
  function inverse(out, a) {
    out[0] = 1 / a[0];
    out[1] = 1 / a[1];
    out[2] = 1 / a[2];
    return out;
  }
  function normalize4(out, a) {
    var x = a[0];
    var y = a[1];
    var z = a[2];
    var len3 = x * x + y * y + z * z;
    if (len3 > 0) {
      len3 = 1 / Math.sqrt(len3);
    }
    out[0] = a[0] * len3;
    out[1] = a[1] * len3;
    out[2] = a[2] * len3;
    return out;
  }
  function dot3(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  function cross2(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2];
    var bx = b[0], by = b[1], bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  }
  function lerp2(out, a, b, t) {
    var ax = a[0];
    var ay = a[1];
    var az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
  }
  function slerp2(out, a, b, t) {
    var angle3 = Math.acos(Math.min(Math.max(dot3(a, b), -1), 1));
    var sinTotal = Math.sin(angle3);
    var ratioA = Math.sin((1 - t) * angle3) / sinTotal;
    var ratioB = Math.sin(t * angle3) / sinTotal;
    out[0] = ratioA * a[0] + ratioB * b[0];
    out[1] = ratioA * a[1] + ratioB * b[1];
    out[2] = ratioA * a[2] + ratioB * b[2];
    return out;
  }
  function hermite(out, a, b, c, d, t) {
    var factorTimes2 = t * t;
    var factor1 = factorTimes2 * (2 * t - 3) + 1;
    var factor2 = factorTimes2 * (t - 2) + t;
    var factor3 = factorTimes2 * (t - 1);
    var factor4 = factorTimes2 * (3 - 2 * t);
    out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
    out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
    out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
    return out;
  }
  function bezier(out, a, b, c, d, t) {
    var inverseFactor = 1 - t;
    var inverseFactorTimesTwo = inverseFactor * inverseFactor;
    var factorTimes2 = t * t;
    var factor1 = inverseFactorTimesTwo * inverseFactor;
    var factor2 = 3 * t * inverseFactorTimesTwo;
    var factor3 = 3 * factorTimes2 * inverseFactor;
    var factor4 = factorTimes2 * t;
    out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
    out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
    out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
    return out;
  }
  function random(out, scale5) {
    scale5 = scale5 === void 0 ? 1 : scale5;
    var r = RANDOM2() * 2 * Math.PI;
    var z = RANDOM2() * 2 - 1;
    var zScale = Math.sqrt(1 - z * z) * scale5;
    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale5;
    return out;
  }
  function transformMat4(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    var w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
  }
  function transformMat3(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
  }
  function transformQuat2(out, a, q) {
    var qx = q[0], qy = q[1], qz = q[2], qw = q[3];
    var vx = a[0], vy = a[1], vz = a[2];
    var tx = qy * vz - qz * vy;
    var ty = qz * vx - qx * vz;
    var tz = qx * vy - qy * vx;
    tx = tx + tx;
    ty = ty + ty;
    tz = tz + tz;
    out[0] = vx + qw * tx + qy * tz - qz * ty;
    out[1] = vy + qw * ty + qz * tx - qx * tz;
    out[2] = vz + qw * tz + qx * ty - qy * tx;
    return out;
  }
  function rotateX2(out, a, b, rad) {
    var p = [], r = [];
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];
    r[0] = p[0];
    r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
    r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad);
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];
    return out;
  }
  function rotateY2(out, a, b, rad) {
    var p = [], r = [];
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];
    r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
    r[1] = p[1];
    r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad);
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];
    return out;
  }
  function rotateZ2(out, a, b, rad) {
    var p = [], r = [];
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];
    r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
    r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
    r[2] = p[2];
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];
    return out;
  }
  function angle2(a, b) {
    var ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2], mag = Math.sqrt((ax * ax + ay * ay + az * az) * (bx * bx + by * by + bz * bz)), cosine = mag && dot3(a, b) / mag;
    return Math.acos(Math.min(Math.max(cosine, -1), 1));
  }
  function zero(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
  }
  function str2(a) {
    return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
  }
  function exactEquals3(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
  }
  function equals3(a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2];
    var b0 = b[0], b1 = b[1], b2 = b[2];
    return Math.abs(a0 - b0) <= EPSILON2 * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON2 * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON2 * Math.max(1, Math.abs(a2), Math.abs(b2));
  }
  var sub2 = subtract2;
  var mul2 = multiply4;
  var div = divide;
  var dist = distance;
  var sqrDist = squaredDistance;
  var len2 = length3;
  var sqrLen = squaredLength2;
  var forEach3 = function() {
    var vec = create7();
    return function(a, stride, offset, count, fn, arg) {
      var i, l;
      if (!stride) {
        stride = 3;
      }
      if (!offset) {
        offset = 0;
      }
      if (count) {
        l = Math.min(count * stride + offset, a.length);
      } else {
        l = a.length;
      }
      for (i = offset; i < l; i += stride) {
        vec[0] = a[i];
        vec[1] = a[i + 1];
        vec[2] = a[i + 2];
        fn(vec, vec, arg);
        a[i] = vec[0];
        a[i + 1] = vec[1];
        a[i + 2] = vec[2];
      }
      return a;
    };
  }();

  // extension/src/config.js
  var DEFAULT_CONFIG = {
    displayWidth: 1920,
    // Total SBS width (pixels)
    displayHeight: 1080,
    // Height (pixels)
    ipd: 0.063,
    // Inter-pupillary distance (meters)
    fovY: Math.PI / 3,
    // Vertical FOV (radians) — 60 degrees
    moveSpeed: 2,
    // Camera movement speed (m/s)
    lookSpeed: 2e-3,
    // Mouse look sensitivity (rad/pixel)
    eyeHeight: 1.6
    // Default eye height (meters)
  };
  var config = { ...DEFAULT_CONFIG };
  function getMonadoConfig() {
    return config;
  }

  // extension/src/MonadoXRDevice.js
  var MonadoXRDevice = class extends XRDevice {
    constructor(global2) {
      super(global2);
      this.sessions = /* @__PURE__ */ new Map();
      this.nextSessionId = 1;
      const config2 = getMonadoConfig();
      this.position = vec3_exports2.fromValues(0, config2.eyeHeight, 0);
      this.yaw = 0;
      this.pitch = 0;
      this.keys = {};
      this.pointerLocked = false;
      this.mouseDeltaX = 0;
      this.mouseDeltaY = 0;
      this._lastFrameTime = 0;
      this.basePoseMatrix = mat4_exports2.create();
      this.leftViewMatrix = mat4_exports2.create();
      this.rightViewMatrix = mat4_exports2.create();
      this.leftProjectionMatrix = mat4_exports2.create();
      this.rightProjectionMatrix = mat4_exports2.create();
      this._setupInputListeners(global2);
    }
    _setupInputListeners(global2) {
      global2.addEventListener("keydown", (e) => {
        this.keys[e.code] = true;
      });
      global2.addEventListener("keyup", (e) => {
        this.keys[e.code] = false;
      });
      global2.document.addEventListener("pointerlockchange", () => {
        this.pointerLocked = !!global2.document.pointerLockElement;
      });
      global2.addEventListener("mousemove", (e) => {
        if (this.pointerLocked) {
          this.mouseDeltaX += e.movementX;
          this.mouseDeltaY += e.movementY;
        }
      });
      global2.addEventListener("click", () => {
        if (this._hasImmersiveSession() && !this.pointerLocked) {
          const canvas = global2.document.querySelector("canvas");
          if (canvas) {
            canvas.requestPointerLock();
          }
        }
      });
    }
    _hasImmersiveSession() {
      for (const session of this.sessions.values()) {
        if (session.immersive)
          return true;
      }
      return false;
    }
    _updateCamera(dt) {
      const config2 = getMonadoConfig();
      if (this.mouseDeltaX !== 0 || this.mouseDeltaY !== 0) {
        this.yaw -= this.mouseDeltaX * config2.lookSpeed;
        this.pitch -= this.mouseDeltaY * config2.lookSpeed;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;
      }
      const moveSpeed = config2.moveSpeed * dt;
      const forward = vec3_exports2.fromValues(
        -Math.sin(this.yaw),
        0,
        -Math.cos(this.yaw)
      );
      const right = vec3_exports2.fromValues(
        Math.cos(this.yaw),
        0,
        -Math.sin(this.yaw)
      );
      if (this.keys["KeyW"])
        vec3_exports2.scaleAndAdd(this.position, this.position, forward, moveSpeed);
      if (this.keys["KeyS"])
        vec3_exports2.scaleAndAdd(this.position, this.position, forward, -moveSpeed);
      if (this.keys["KeyD"])
        vec3_exports2.scaleAndAdd(this.position, this.position, right, moveSpeed);
      if (this.keys["KeyA"])
        vec3_exports2.scaleAndAdd(this.position, this.position, right, -moveSpeed);
      if (this.keys["Space"])
        this.position[1] += moveSpeed;
      if (this.keys["ShiftLeft"])
        this.position[1] -= moveSpeed;
    }
    _computeMatrices(renderState) {
      const config2 = getMonadoConfig();
      const near = renderState.depthNear;
      const far = renderState.depthFar;
      const aspect = config2.displayWidth / 2 / config2.displayHeight;
      mat4_exports2.identity(this.basePoseMatrix);
      mat4_exports2.translate(this.basePoseMatrix, this.basePoseMatrix, this.position);
      mat4_exports2.rotateY(this.basePoseMatrix, this.basePoseMatrix, this.yaw);
      mat4_exports2.rotateX(this.basePoseMatrix, this.basePoseMatrix, this.pitch);
      const leftEyeWorld = mat4_exports2.create();
      mat4_exports2.translate(leftEyeWorld, this.basePoseMatrix, [-config2.ipd / 2, 0, 0]);
      mat4_exports2.invert(this.leftViewMatrix, leftEyeWorld);
      const rightEyeWorld = mat4_exports2.create();
      mat4_exports2.translate(rightEyeWorld, this.basePoseMatrix, [config2.ipd / 2, 0, 0]);
      mat4_exports2.invert(this.rightViewMatrix, rightEyeWorld);
      mat4_exports2.perspective(this.leftProjectionMatrix, config2.fovY, aspect, near, far);
      mat4_exports2.copy(this.rightProjectionMatrix, this.leftProjectionMatrix);
    }
    // --- XRDevice interface ---
    isSessionSupported(mode) {
      return mode === "inline" || mode === "immersive-vr";
    }
    isFeatureSupported(featureDescriptor) {
      return ["viewer", "local", "local-floor"].includes(featureDescriptor);
    }
    async requestSession(mode, enabledFeatures) {
      const sessionId = this.nextSessionId++;
      if (mode === "immersive-vr") {
        const canvas = this.global.document.querySelector("canvas");
        if (canvas) {
          try {
            await canvas.requestFullscreen();
          } catch (e) {
            console.warn("MonadoXR: Could not enter fullscreen:", e);
          }
        }
      }
      this.sessions.set(sessionId, {
        mode,
        enabledFeatures: new Set(enabledFeatures),
        immersive: mode === "immersive-vr",
        baseLayer: null,
        originalCanvasWidth: 0,
        originalCanvasHeight: 0
      });
      this.dispatchEvent("@@webxr-polyfill/vr-present-start", { sessionId });
      return sessionId;
    }
    endSession(sessionId) {
      const session = this.sessions.get(sessionId);
      if (!session)
        return;
      if (session.immersive) {
        if (session.baseLayer) {
          const canvas = session.baseLayer.context.canvas;
          canvas.width = session.originalCanvasWidth;
          canvas.height = session.originalCanvasHeight;
        }
        if (this.global.document.fullscreenElement) {
          this.global.document.exitFullscreen().catch(() => {
          });
        }
        if (this.pointerLocked) {
          this.global.document.exitPointerLock();
        }
      }
      this.sessions.delete(sessionId);
      this.dispatchEvent("@@webxr-polyfill/vr-present-end", { sessionId });
    }
    doesSessionSupportReferenceSpace(sessionId, type) {
      const session = this.sessions.get(sessionId);
      if (!session)
        return false;
      return session.enabledFeatures.has(type);
    }
    onBaseLayerSet(sessionId, layer) {
      const session = this.sessions.get(sessionId);
      if (!session)
        return;
      session.baseLayer = layer;
      if (session.immersive && layer.monadoSetImmersive) {
        const config2 = getMonadoConfig();
        const canvas = layer.context.canvas;
        session.originalCanvasWidth = canvas.width;
        session.originalCanvasHeight = canvas.height;
        canvas.width = config2.displayWidth;
        canvas.height = config2.displayHeight;
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
      if (!session || !session.immersive)
        return;
      const now2 = performance.now() / 1e3;
      const dt = this._lastFrameTime > 0 ? Math.min(now2 - this._lastFrameTime, 0.1) : 1 / 60;
      this._lastFrameTime = now2;
      this._updateCamera(dt);
      this._computeMatrices(renderState);
    }
    onFrameEnd(sessionId) {
      const session = this.sessions.get(sessionId);
      if (!session || !session.immersive || !session.baseLayer)
        return;
      if (session.baseLayer.monadoBlitToScreen) {
        session.baseLayer.monadoBlitToScreen();
      }
    }
    getBasePoseMatrix() {
      return this.basePoseMatrix;
    }
    getBaseViewMatrix(eye) {
      if (eye === "right")
        return this.rightViewMatrix;
      return this.leftViewMatrix;
    }
    getProjectionMatrix(eye) {
      if (eye === "right")
        return this.rightProjectionMatrix;
      return this.leftProjectionMatrix;
    }
    getViewport(sessionId, eye, layer, target) {
      const config2 = getMonadoConfig();
      const halfWidth = Math.floor(config2.displayWidth / 2);
      if (eye === "right") {
        target.x = halfWidth;
        target.y = 0;
        target.width = halfWidth;
        target.height = config2.displayHeight;
      } else {
        target.x = 0;
        target.y = 0;
        target.width = halfWidth;
        target.height = config2.displayHeight;
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
    }
    async requestFrameOfReferenceTransform(type) {
      const matrix = mat4_exports2.create();
      switch (type) {
        case "viewer":
        case "local": {
          const config2 = getMonadoConfig();
          mat4_exports2.fromTranslation(matrix, [0, -config2.eyeHeight, 0]);
          return matrix;
        }
        case "local-floor":
          return matrix;
        default:
          throw new Error("XRReferenceSpaceType not supported: " + type);
      }
    }
  };

  // extension/src/MonadoXRWebGLLayer.js
  var MONADO_PRIVATE = Symbol("MonadoXRWebGLLayer");
  var MonadoXRWebGLLayer = class extends XRWebGLLayer {
    constructor(session, gl, layerInit) {
      super(session, gl, layerInit);
      const config2 = getMonadoConfig();
      this[MONADO_PRIVATE] = {
        gl,
        immersive: false,
        width: config2.displayWidth,
        height: config2.displayHeight,
        framebuffer: null,
        texture: null,
        depthStencil: null
      };
      this._createFBO(gl, config2);
    }
    _createFBO(gl, config2) {
      const priv = this[MONADO_PRIVATE];
      const prevFBO = gl.getParameter(gl.FRAMEBUFFER_BINDING);
      const prevTex = gl.getParameter(gl.TEXTURE_BINDING_2D);
      const prevRBO = gl.getParameter(gl.RENDERBUFFER_BINDING);
      priv.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, priv.texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        priv.width,
        priv.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      priv.depthStencil = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, priv.depthStencil);
      const isWebGL2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
      const depthFormat = isWebGL2 ? gl.DEPTH24_STENCIL8 : gl.DEPTH_STENCIL;
      gl.renderbufferStorage(gl.RENDERBUFFER, depthFormat, priv.width, priv.height);
      priv.framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, priv.framebuffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        priv.texture,
        0
      );
      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_STENCIL_ATTACHMENT,
        gl.RENDERBUFFER,
        priv.depthStencil
      );
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      if (status !== gl.FRAMEBUFFER_COMPLETE) {
        console.error("MonadoXR: Framebuffer incomplete, status:", status);
      }
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
      if (!priv.immersive)
        return;
      const gl = priv.gl;
      const canvas = gl.canvas;
      const isWebGL2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
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
        0,
        0,
        priv.width,
        priv.height,
        0,
        0,
        canvas.width,
        canvas.height,
        gl.COLOR_BUFFER_BIT,
        gl.LINEAR
      );
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, prevReadFBO);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, prevDrawFBO);
    }
    // WebGL 1 fallback: draw fullscreen textured quad
    _blitWebGL1(gl, priv, canvas) {
      if (!this._blitProgram) {
        this._initBlitShader(gl);
      }
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
      gl.useProgram(prevProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER, prevFBO);
      gl.activeTexture(prevActiveTexture);
      gl.bindTexture(gl.TEXTURE_2D, prevTex);
      gl.viewport(prevVP[0], prevVP[1], prevVP[2], prevVP[3]);
      gl.bindBuffer(gl.ARRAY_BUFFER, prevArrayBuffer);
      if (prevCull)
        gl.enable(gl.CULL_FACE);
      if (prevDepth)
        gl.enable(gl.DEPTH_TEST);
      if (prevBlend)
        gl.enable(gl.BLEND);
      if (prevScissor)
        gl.enable(gl.SCISSOR_TEST);
    }
    _initBlitShader(gl) {
      const vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs, [
        "attribute vec2 a_position;",
        "varying vec2 v_texCoord;",
        "void main() {",
        "  gl_Position = vec4(a_position, 0.0, 1.0);",
        "  v_texCoord = a_position * 0.5 + 0.5;",
        "}"
      ].join("\n"));
      gl.compileShader(vs);
      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fs, [
        "precision mediump float;",
        "varying vec2 v_texCoord;",
        "uniform sampler2D u_texture;",
        "void main() {",
        "  gl_FragColor = texture2D(u_texture, v_texCoord);",
        "}"
      ].join("\n"));
      gl.compileShader(fs);
      this._blitProgram = gl.createProgram();
      gl.attachShader(this._blitProgram, vs);
      gl.attachShader(this._blitProgram, fs);
      gl.linkProgram(this._blitProgram);
      this._blitPosLoc = gl.getAttribLocation(this._blitProgram, "a_position");
      this._blitTexLoc = gl.getUniformLocation(this._blitProgram, "u_texture");
      this._blitVBO = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this._blitVBO);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    }
  };

  // extension/src/index.js
  var polyfill = new WebXRPolyfill({ allowNativePolyfill: true });
  var device = new MonadoXRDevice(window);
  var xr = new XRSystem(Promise.resolve(device));
  Object.defineProperty(navigator, "xr", {
    value: xr,
    configurable: true
  });
  window.XRWebGLLayer = MonadoXRWebGLLayer;
  console.log("Monado WebXR Bridge: polyfill installed (Phase 1 \u2014 SBS output)");
})();
/*! Bundled license information:

cardboard-vr-display/dist/cardboard-vr-display.js:
  (**
   * @license
   * cardboard-vr-display
   * Copyright (c) 2015-2017 Google
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * gl-preserve-state
   * Copyright (c) 2016, Brandon Jones.
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in
   * all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   *)
  (**
   * @license
   * webvr-polyfill-dpdb
   * Copyright (c) 2015-2017 Google
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * nosleep.js
   * Copyright (c) 2017, Rich Tibbett
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in
   * all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   *)
*/
