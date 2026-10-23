// A small WebGL2 fluid simulation, based on the classic "stable fluids" method.
// It moves a picture of the three arches (the "scene") around, and adds soft
// sage and clay "dye" where the pointer moves. Returns null when the browser
// can't run it, so the page simply keeps the still arches.

const BASE_VERT = `#version 300 es
in vec2 aPosition;
out vec2 vUv; out vec2 vL; out vec2 vR; out vec2 vT; out vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0); vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y); vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const HEAD = `#version 300 es
precision highp float; precision highp sampler2D;
in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
out vec4 outColor;
`;

const SPLAT = HEAD + `
uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
void main () {
  vec2 p = vUv - point; p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  outColor = vec4(texture(uTarget, vUv).xyz + splat, 1.0);
}`;

const ADVECT = HEAD + `
uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texelSize; uniform float dt; uniform float dissipation;
void main () {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
  outColor = texture(uSource, coord) / (1.0 + dissipation * dt);
}`;

const DIVERGENCE = HEAD + `
uniform sampler2D uVelocity;
void main () {
  float L = texture(uVelocity, vL).x; float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y; float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; } if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; } if (vB.y < 0.0) { B = -C.y; }
  outColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const CURL = HEAD + `
uniform sampler2D uVelocity;
void main () {
  float L = texture(uVelocity, vL).y; float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x; float B = texture(uVelocity, vB).x;
  outColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

const VORTICITY = HEAD + `
uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
void main () {
  float L = texture(uCurl, vL).x; float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x; float B = texture(uCurl, vB).x; float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001; force *= curl * C; force.y *= -1.0;
  vec2 v = texture(uVelocity, vUv).xy + force * dt;
  outColor = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
}`;

const PRESSURE = HEAD + `
uniform sampler2D uPressure; uniform sampler2D uDivergence;
void main () {
  float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x;
  float d = texture(uDivergence, vUv).x;
  outColor = vec4((L + R + B + T - d) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT = HEAD + `
uniform sampler2D uPressure; uniform sampler2D uVelocity;
void main () {
  float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x;
  vec2 v = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
  outColor = vec4(v, 0.0, 1.0);
}`;

const UV_RESET = HEAD + `
void main () { outColor = vec4(vUv, 0.0, 1.0); }`;

const UV_RELAX = HEAD + `
uniform sampler2D uMap; uniform float amount;
void main () { vec2 m = texture(uMap, vUv).xy; outColor = vec4(mix(m, vUv, amount), 0.0, 1.0); }`;

const MULTIPLY = HEAD + `
uniform sampler2D uTexture; uniform float value;
void main () { outColor = value * texture(uTexture, vUv); }`;

// Draws the arches, pushed by the fluid, with the dye on top and the
// press-and-hold "night" circle. The scene texture is premultiplied.
const DISPLAY = HEAD + `
uniform sampler2D uScene; uniform sampler2D uMap; uniform sampler2D uDye; uniform sampler2D uReveal;
uniform float aspectRatio; uniform vec2 holdPoint; uniform float holdRadius; uniform float time;
void main () {
  vec2 src = texture(uMap, vUv).xy;            // where this pixel's colour comes from now
  vec4 img = texture(uScene, src);              // drawn fresh each frame, so it stays crisp
  vec3 dye = texture(uDye, vUv).rgb;
  float amt = clamp(max(dye.r, max(dye.g, dye.b)) * 1.6, 0.0, 1.0);
  vec3 hue = dye / max(max(dye.r, max(dye.g, dye.b)), 0.001);
  vec3 rgb = mix(img.rgb, hue * 0.78 * img.a + img.rgb * 0.25, amt * 0.75 * img.a);
  float a = img.a;

  // Press and hold: a wobbly liquid bubble that reveals the dream places.
  if (holdRadius > 0.001) {
    vec2 d = vUv - holdPoint; d.x *= aspectRatio;
    float ang = atan(d.y, d.x);
    float wob = 1.0 + 0.07 * sin(ang * 3.0 + time * 1.7) + 0.045 * sin(ang * 5.0 - time * 2.3) + 0.03 * sin(ang * 8.0 + time * 3.1);
    float r = holdRadius * wob;
    float dist = length(d);
    float inside = 1.0 - smoothstep(r - 0.012, r, dist);
    vec4 rev = texture(uReveal, src);
    vec3 night = mix(vec3(0.03, 0.06, 0.07), vec3(0.07, 0.11, 0.12), vUv.y);
    vec3 revRgb = mix(rev.rgb, hue * 0.78 * rev.a + rev.rgb * 0.25, amt * 0.75 * rev.a);
    vec3 revCol = revRgb + night * (1.0 - rev.a);
    float rim = (1.0 - smoothstep(0.0, 0.03, abs(dist - r))) * step(0.02, holdRadius);
    float glow = exp(-max(dist - r, 0.0) * 22.0) * (1.0 - inside) * 0.5;
    vec3 rimCol = vec3(0.92, 0.8, 0.66);
    rgb = mix(rgb, revCol, inside) + rimCol * (rim * 0.55 + glow * 0.4);
    a = max(a, inside);
    a = max(a, clamp(rim * 0.55 + glow * 0.4, 0.0, 1.0));
  }
  outColor = vec4(rgb, a);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

function program(gl, vert, fragSrc) {
  const p = gl.createProgram();
  gl.attachShader(p, vert);
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fragSrc));
  gl.bindAttribLocation(p, 0, 'aPosition');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const uniforms = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const name = gl.getActiveUniform(p, i).name;
    uniforms[name] = gl.getUniformLocation(p, name);
  }
  return { p, u: uniforms };
}

export function createFluid(canvas, { lowPower = false } = {}) {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
  if (!gl) return null;
  if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return null;

  const SIM = lowPower ? 64 : 128;
  const DYE = lowPower ? 256 : 512;
  const config = { velocityDissipation: 1.0, dyeDissipation: 1.5, pressure: 0.8, iterations: lowPower ? 12 : 20, curl: 14, radius: 0.0034, relax: 1.3 };

  let vert;
  try { vert = compile(gl, gl.VERTEX_SHADER, BASE_VERT); } catch (e) { return null; }
  let P;
  try {
    P = {
      splat: program(gl, vert, SPLAT), advect: program(gl, vert, ADVECT), divergence: program(gl, vert, DIVERGENCE),
      curl: program(gl, vert, CURL), vorticity: program(gl, vert, VORTICITY), pressure: program(gl, vert, PRESSURE),
      gradient: program(gl, vert, GRADIENT), multiply: program(gl, vert, MULTIPLY), uvReset: program(gl, vert, UV_RESET), uvRelax: program(gl, vert, UV_RELAX), display: program(gl, vert, DISPLAY),
    };
  } catch (e) { return null; }

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  function target(w, h) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fbo, w, h, texel: [1 / w, 1 / h] };
  }
  function pair(w, h) {
    let a = target(w, h), b = target(w, h);
    return { get read() { return a; }, get write() { return b; }, swap() { const t = a; a = b; b = t; }, w, h, texel: a.texel };
  }

  let velocity, dye, divergence, curlT, pressure, uvmap, aspect = 1;
  function sizes() {
    aspect = canvas.width / Math.max(1, canvas.height);
    const simW = aspect >= 1 ? Math.round(SIM * aspect) : SIM, simH = aspect >= 1 ? SIM : Math.round(SIM / aspect);
    const dyeW = aspect >= 1 ? Math.round(DYE * aspect) : DYE, dyeH = aspect >= 1 ? DYE : Math.round(DYE / aspect);
    velocity = pair(simW, simH); dye = pair(dyeW, dyeH);
    divergence = target(simW, simH); curlT = target(simW, simH); pressure = pair(simW, simH);
    uvmap = pair(dyeW, dyeH);
    resetMap();
  }
  sizes();

  const sceneTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, sceneTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

  const revealTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, revealTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

  function blit(t) {
    if (t) { gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo); gl.viewport(0, 0, t.w, t.h); }
    else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function bind(unit, tex) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); return unit; }

  function splat(x, y, dx, dy, color) {
    const s = P.splat; gl.useProgram(s.p);
    gl.uniform1i(s.u.uTarget, bind(0, velocity.read.tex));
    gl.uniform1f(s.u.aspectRatio, aspect);
    gl.uniform2f(s.u.point, x, y);
    gl.uniform3f(s.u.color, dx, dy, 0);
    gl.uniform1f(s.u.radius, config.radius * (aspect > 1 ? aspect : 1));
    gl.uniform2f(s.u.texelSize, velocity.texel[0], velocity.texel[1]);
    blit(velocity.write); velocity.swap();
    gl.uniform1i(s.u.uTarget, bind(0, dye.read.tex));
    gl.uniform3f(s.u.color, color[0], color[1], color[2]);
    blit(dye.write); dye.swap();
  }

  function step(dt) {
    gl.disable(gl.BLEND);
    let s = P.curl; gl.useProgram(s.p); gl.uniform2f(s.u.texelSize, ...velocity.texel);
    gl.uniform1i(s.u.uVelocity, bind(0, velocity.read.tex)); blit(curlT);
    s = P.vorticity; gl.useProgram(s.p); gl.uniform2f(s.u.texelSize, ...velocity.texel);
    gl.uniform1i(s.u.uVelocity, bind(0, velocity.read.tex)); gl.uniform1i(s.u.uCurl, bind(1, curlT.tex));
    gl.uniform1f(s.u.curl, config.curl); gl.uniform1f(s.u.dt, dt); blit(velocity.write); velocity.swap();
    s = P.divergence; gl.useProgram(s.p); gl.uniform2f(s.u.texelSize, ...velocity.texel);
    gl.uniform1i(s.u.uVelocity, bind(0, velocity.read.tex)); blit(divergence);
    s = P.multiply; gl.useProgram(s.p); gl.uniform2f(s.u.texelSize, ...velocity.texel);
    gl.uniform1i(s.u.uTexture, bind(0, pressure.read.tex)); gl.uniform1f(s.u.value, config.pressure); blit(pressure.write); pressure.swap();
    s = P.pressure; gl.useProgram(s.p); gl.uniform2f(s.u.texelSize, ...velocity.texel);
    gl.uniform1i(s.u.uDivergence, bind(0, divergence.tex));
    for (let i = 0; i < config.iterations; i++) { gl.uniform1i(s.u.uPressure, bind(1, pressure.read.tex)); blit(pressure.write); pressure.swap(); }
    s = P.gradient; gl.useProgram(s.p); gl.uniform2f(s.u.texelSize, ...velocity.texel);
    gl.uniform1i(s.u.uPressure, bind(0, pressure.read.tex)); gl.uniform1i(s.u.uVelocity, bind(1, velocity.read.tex)); blit(velocity.write); velocity.swap();
    s = P.advect; gl.useProgram(s.p); gl.uniform2f(s.u.texelSize, ...velocity.texel);
    gl.uniform1i(s.u.uVelocity, bind(0, velocity.read.tex)); gl.uniform1i(s.u.uSource, bind(0, velocity.read.tex));
    gl.uniform1f(s.u.dt, dt); gl.uniform1f(s.u.dissipation, config.velocityDissipation); blit(velocity.write); velocity.swap();
    gl.uniform2f(s.u.texelSize, ...dye.texel);
    gl.uniform1i(s.u.uVelocity, bind(0, velocity.read.tex)); gl.uniform1i(s.u.uSource, bind(1, dye.read.tex));
    gl.uniform1f(s.u.dissipation, config.dyeDissipation); blit(dye.write); dye.swap();
    gl.uniform2f(s.u.texelSize, ...uvmap.texel);
    gl.uniform1i(s.u.uVelocity, bind(0, velocity.read.tex)); gl.uniform1i(s.u.uSource, bind(1, uvmap.read.tex));
    gl.uniform1f(s.u.dissipation, 0.0); blit(uvmap.write); uvmap.swap();
    const r = P.uvRelax; gl.useProgram(r.p); gl.uniform2f(r.u.texelSize, ...uvmap.texel);
    gl.uniform1i(r.u.uMap, bind(0, uvmap.read.tex)); gl.uniform1f(r.u.amount, Math.min(1, config.relax * dt));
    blit(uvmap.write); uvmap.swap();
  }
  function resetMap() {
    if (!P || !uvmap) return;
    gl.useProgram(P.uvReset.p); gl.uniform2f(P.uvReset.u.texelSize, ...uvmap.texel);
    blit(uvmap.write); uvmap.swap(); blit(uvmap.write); uvmap.swap();
  }

  function render(hold) {
    const s = P.display; gl.useProgram(s.p);
    gl.uniform2f(s.u.texelSize, 1 / canvas.width, 1 / canvas.height);
    gl.uniform1i(s.u.uScene, bind(0, sceneTex));
    gl.uniform1i(s.u.uMap, bind(3, uvmap.read.tex));
    gl.uniform1i(s.u.uDye, bind(1, dye.read.tex));
    gl.uniform1i(s.u.uReveal, bind(2, revealTex));
    gl.uniform1f(s.u.time, performance.now() / 1000);
    gl.uniform1f(s.u.aspectRatio, aspect);
    gl.uniform2f(s.u.holdPoint, hold.x, hold.y);
    gl.uniform1f(s.u.holdRadius, hold.r);
    gl.clearColor(0, 0, 0, 0); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    blit(null);
  }

  return {
    setScene(source) {
      gl.bindTexture(gl.TEXTURE_2D, sceneTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    },
    setReveal(source) {
      gl.bindTexture(gl.TEXTURE_2D, revealTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    },
    resize() { sizes(); },
    splat,
    step,
    render,
    destroy() { const ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); },
  };
}
