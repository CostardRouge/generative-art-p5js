import { midi, events, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

// —————————————————————————————————————————————
// Setup
// —————————————————————————————————————————————
sketch.setup(() => {
  pixelDensity(1);
}, {
  type: "webgl",
  size: { width: 1080, height: 1080 }
});

// events.register("post-setup", midi.setup); // optional

// —————————————————————————————————————————————
// GPU program (compile once)
// —————————————————————————————————————————————
let gl;
let program;
let attribs = {};
let uniforms = {};
let vboA = null;     // positions for letter A
let vboB = null;     // positions for letter B
let vboCount = 0;    // number of points (max of A/B)
let lastLetters = { a: null, b: null };
let needUpload = true; // upload VBOs when letters change

// Shaders
const VS = `
precision mediump float;

attribute vec2 aPosA;
attribute vec2 aPosB;

uniform vec2  uResolution;   // canvas size in pixels
uniform float uPointSize;    // px
uniform vec2  uOffset;       // instance offset in pixels
uniform float uTime;         // seconds
uniform float uInstanceT;    // 0..1 along the ribbon

uniform float uRangeFrom;    // 0..1 start of morph window
uniform float uRangeTo;      // 0..1 end of morph window (can be < from for wrap)

varying vec2  vWorld;
varying float vT;
varying float vTime;

// Same expo easing you used before
float easeInOutExpo(float x) {
  x = clamp(x, 0.0, 1.0);
  return (x < 0.5)
    ? 0.5 * pow(2.0, 20.0 * x - 10.0)
    : 1.0 - 0.5 * pow(2.0, -20.0 * x + 10.0);
}

// Map uInstanceT into the range window with wrap support.
// Outside the window -> hard 0 (before start) or 1 (after end).
float morphFromRange(float t, float a, float b) {
  // length of the active window along a circular [0,1) domain
  float len = (a <= b) ? (b - a) : (1.0 - a + b);
  len = max(len, 1e-6);

  // forward distance from 'a' to 't' going positively around the circle
  float forward = (t >= a) ? (t - a) : (t + 1.0 - a);

  // normalized position relative to the window
  float x = forward / len;

  // outside the window: x < 0 => 0, x > 1 => 1
  if (x <= 0.0) return 0.0;
  if (x >= 1.0) return 1.0;

  // inside the window: eased blend
  return easeInOutExpo(x);
}

void main() {
  float m = morphFromRange(uInstanceT, uRangeFrom, uRangeTo);

  // Interpolate letter shapes on the GPU
  vec2 posPx = mix(aPosA, aPosB, m) + uOffset;

  // Pixel -> clip space
  vec2 halfRes = uResolution * 0.5;
  vec2 clip = vec2(posPx.x / halfRes.x, -posPx.y / halfRes.y);
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = uPointSize;

  vWorld = posPx / halfRes;
  vT = uInstanceT;
  vTime = uTime;
}
`;

const FS = `
precision mediump float;

varying vec2  vWorld;
varying float vT;
varying float vTime;

uniform float uOpacity;    // 0..1
uniform float uEdgeSoft;   // 0..1 edge softness for round points

// Cheap pseudo-noise based on sin hashing (fast, no texture)
float n2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float smoothNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = n2(i);
  float b = n2(i + vec2(1.0, 0.0));
  float c = n2(i + vec2(0.0, 1.0));
  float d = n2(i + vec2(1.0, 1.0));
  vec2 u = f*f*(3.0 - 2.0*f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Iridescent shimmer term (thin-film inspired)
float iridescentShift(vec2 p, float t) {
  // thickness varies slowly over space and time
  float thickness = 0.25 + 0.75 * smoothNoise(p * 2.0 + vec2(0.0, t * 0.2));
  float angle     = (p.x - p.y) + 0.25 * sin(6.28318 * (p.x + p.y) + t * 0.10);
  return 0.7 * sin(12.0 * thickness + 2.2 * angle + 0.45 * t); // ~[-0.7, 0.7]
}

// Rainbow mapping similar in spirit to your JS rainbow():
// r = map(sin(phase), -1..1, max..min)
// g = map(cos(phase2), -1..1, min..max)
// b = map(sin(phase3), -1..1, max..min)
vec3 rainbowIridescent(vec2 p, float t, float along) {
  float base = 8.0 * (p.x + 0.5*p.y) + 6.28318 * along; // smooth hue sweep along ribbon
  float shimmer = iridescentShift(p, t);
  float phase = base + shimmer;

  // Channels (0..1) — use different phase offsets to spread spectrum
  float r = 0.5 + 0.5 * sin(phase + 0.0);
  float g = 0.5 + 0.5 * cos(phase - 1.2566); // ~72°
  float b = 0.5 + 0.5 * sin(phase + 2.5133); // ~144°

  // Optional "pearl" lift (Fresnel-ish based on along)
  float fresnel = pow(clamp(1.0 - abs(sin(along * 6.28318)), 0.0, 1.0), 3.0);
  float lift = 0.85 + 0.15 * fresnel;

  return clamp(vec3(r, g, b) * lift, 0.0, 1.0);
}

void main() {
  // Round point sprite with smooth edge
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float r = length(uv);
  float alpha = 1.0 - smoothstep(1.0 - uEdgeSoft, 1.0, r);
  if (alpha <= 0.001) discard;

  vec3 rgb = rainbowIridescent(vWorld, vTime, vT);
  gl_FragColor = vec4(rgb, alpha * uOpacity);
}
`;

// Compile a raw WebGL program (not using p5.createShader to keep full control)
function createProgram(gl, vsSource, fsSource) {
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vsSource);
  gl.compileShader(vs);
  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    console.error('VS error:', gl.getShaderInfoLog(vs));
    gl.deleteShader(vs);
    return null;
  }
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fsSource);
  gl.compileShader(fs);
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    console.error('FS error:', gl.getShaderInfoLog(fs));
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Link error:', gl.getProgramInfoLog(prog));
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.deleteProgram(prog);
    return null;
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return prog;
}

// Find/enable attributes + uniforms
function fetchLocations() {
  attribs.aPosA = gl.getAttribLocation(program, 'aPosA');
  attribs.aPosB = gl.getAttribLocation(program, 'aPosB');
  uniforms.uResolution = gl.getUniformLocation(program, 'uResolution');
  uniforms.uPointSize  = gl.getUniformLocation(program, 'uPointSize');
  uniforms.uMorph      = gl.getUniformLocation(program, 'uMorph');
  uniforms.uOffset     = gl.getUniformLocation(program, 'uOffset');
  uniforms.uTime       = gl.getUniformLocation(program, 'uTime');
  uniforms.uInstanceT  = gl.getUniformLocation(program, 'uInstanceT');
  uniforms.uOpacity    = gl.getUniformLocation(program, 'uOpacity');
  uniforms.uEdgeSoft   = gl.getUniformLocation(program, 'uEdgeSoft');
  uniforms.uRangeFrom = gl.getUniformLocation(program, 'uRangeFrom');
  uniforms.uRangeTo   = gl.getUniformLocation(program, 'uRangeTo');
}

// —————————————————————————————————————————————
// Text point helpers (cache + centering)
// —————————————————————————————————————————————
function getTextPoints({ text, size, font, position, sampleFactor = 0.18, simplifyThreshold = 0 }) {
  if (!font?.font) return [];
  const fontFamily = font.font?.names?.fontFamily?.en;
  const key = cache.key(text, fontFamily, "text-points", size, sampleFactor, simplifyThreshold);

  return cache.store(key, () => {
    const raw = font.textToPoints(text, position.x, position.y, size, { sampleFactor, simplifyThreshold });
    // bounds
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
    for (let i = 0; i < raw.length; i++) {
      const { x, y } = raw[i];
      if (x < xMin) xMin = x; if (x > xMax) xMax = x;
      if (y < yMin) yMin = y; if (y > yMax) yMax = y;
    }
    const cx = (xMin + xMax) * 0.5;
    const cy = (yMin + yMax) * 0.5;

    const out = new Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      const p = raw[i];
      // Center around (0,0) so GPU transform is trivial
      out[i] = { x: p.x - cx, y: p.y - cy };
    }
    return out;
  });
}

// Convert two arrays of points to two Float32 VBOs of equal length (wrap shorter)
function uploadPointBuffers(ptsA, ptsB) {
  const count = Math.max(ptsA.length, ptsB.length);
  const dataA = new Float32Array(count * 2);
  const dataB = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const a = ptsA[i % ptsA.length];
    const b = ptsB[i % ptsB.length];
    dataA[i * 2 + 0] = a.x;
    dataA[i * 2 + 1] = a.y;
    dataB[i * 2 + 0] = b.x;
    dataB[i * 2 + 1] = b.y;
  }

  if (!vboA) vboA = gl.createBuffer();
  if (!vboB) vboB = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vboA);
  gl.bufferData(gl.ARRAY_BUFFER, dataA, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, vboB);
  gl.bufferData(gl.ARRAY_BUFFER, dataB, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  vboCount = count;
}

// —————————————————————————————————————————————
const state = {
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
};

sketch.draw((time, center) => {
  // Ensure GL and program
  if (!gl) {
    gl = drawingContext; // p5's WebGL context
    program = createProgram(gl, VS, FS);
    fetchLocations();

    // Blending for soft point edges
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
  }

  background(0);

  // Choose letters and morph amount
  const { alphabet } = state;
  const baseIndex = floor(map(sin(time * 0.15), -1, 1, 0, alphabet.length - 1));
  const nextIndex = (baseIndex + 1) % alphabet.length;

  
  
  const fromLetter = alphabet[baseIndex];
  const toLetter   = alphabet[nextIndex];
  const morph = 0.5 + 0.5 * sin(time * 0.85);
  const range = { from: 0.25, to: 0.65 }; // like your old range variable

  // range.from = fract(0.15 * time) * 0.8; range.to = range.from + 0.2;


  // Rebuild/upload VBOs if letters changed or first frame
  if (needUpload || lastLetters.a !== fromLetter || lastLetters.b !== toLetter) {
    const letterTargetHeight = height * 0.6;
    const ptsA = getTextPoints({
      text: fromLetter,
      size: letterTargetHeight,
      font: string.fonts.serif,
      position: createVector(0, 0),
      sampleFactor: 0.1,
      simplifyThreshold: 0
    });
    const ptsB = getTextPoints({
      text: toLetter,
      size: letterTargetHeight,
      font: string.fonts.serif,
      position: createVector(0, 0),
      sampleFactor: 0.1,
      simplifyThreshold: 0
    });

    uploadPointBuffers(ptsA, ptsB);
    lastLetters.a = fromLetter;
    lastLetters.b = toLetter;
    needUpload = false;
  }

  // Use program
  gl.useProgram(program);

  // Bind attributes once per frame
  gl.bindBuffer(gl.ARRAY_BUFFER, vboA);
  gl.enableVertexAttribArray(attribs.aPosA);
  gl.vertexAttribPointer(attribs.aPosA, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, vboB);
  gl.enableVertexAttribArray(attribs.aPosB);
  gl.vertexAttribPointer(attribs.aPosB, 2, gl.FLOAT, false, 0, 0);

  // Set uniforms that don't change per instance
  gl.uniform2f(uniforms.uResolution, width, height);
  gl.uniform1f(uniforms.uPointSize, 4.0);     // tweak for your look; beware device point-size caps
  gl.uniform1f(uniforms.uMorph, morph);
  gl.uniform1f(uniforms.uTime, time);
  gl.uniform1f(uniforms.uOpacity, 1.0);
  gl.uniform1f(uniforms.uEdgeSoft, 0.25);
  // gl.uniform1f(uniforms.uRangeFrom, range.from);
  gl.uniform1f(uniforms.uRangeTo,   range.to);

  // Draw many copies across a horizontal ribbon by changing uOffset
  const instances = 500;
  const halfW = width * 0.5;
  const leftX = -halfW * 0.55;
  const rightX = halfW * 0.55;

  for (let i = 0; i < instances; i++) {
    const t01 = i / (instances - 1);
    const x = lerp(leftX, rightX, t01);
    const y = 0;

    gl.uniform2f(uniforms.uOffset, x, y);
    gl.uniform1f(uniforms.uInstanceT, t01);

    gl.drawArrays(gl.POINTS, 0, vboCount);
  }

  // Cleanup binds (optional)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.useProgram(null);

});
