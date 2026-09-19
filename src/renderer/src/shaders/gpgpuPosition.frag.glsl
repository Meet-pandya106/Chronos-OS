precision highp float;

uniform sampler2D uPositions;
uniform float uTime;
uniform float uDelta;
uniform float uCpuLoad;
uniform float uMemLoad;
uniform vec2 uResolution;

varying vec2 vUv;

// 3D simplex-style noise helpers
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

vec3 curlNoise(vec3 p) {
  float e = 0.1;
  float n1, n2;

  n1 = snoise(p + vec3(0.0, e, 0.0));
  n2 = snoise(p - vec3(0.0, e, 0.0));
  float a = (n1 - n2) / (2.0 * e);

  n1 = snoise(p + vec3(0.0, 0.0, e));
  n2 = snoise(p - vec3(0.0, 0.0, e));
  float b = (n1 - n2) / (2.0 * e);

  float curl_x = a - b;

  n1 = snoise(p + vec3(0.0, 0.0, e));
  n2 = snoise(p - vec3(0.0, 0.0, e));
  a = (n1 - n2) / (2.0 * e);

  n1 = snoise(p + vec3(e, 0.0, 0.0));
  n2 = snoise(p - vec3(e, 0.0, 0.0));
  b = (n1 - n2) / (2.0 * e);

  float curl_y = a - b;

  n1 = snoise(p + vec3(e, 0.0, 0.0));
  n2 = snoise(p - vec3(e, 0.0, 0.0));
  a = (n1 - n2) / (2.0 * e);

  n1 = snoise(p + vec3(0.0, e, 0.0));
  n2 = snoise(p - vec3(0.0, e, 0.0));
  b = (n1 - n2) / (2.0 * e);

  float curl_z = a - b;

  return vec3(curl_x, curl_y, curl_z);
}

void main() {
  vec4 posData = texture2D(uPositions, vUv);
  vec3 pos = posData.xyz;
  float life = posData.w;

  float turbulence = 0.3 + uCpuLoad * 1.5;
  float noiseScale = 0.15 + uCpuLoad * 0.1;
  float speed = 0.5 + uCpuLoad * 2.0;

  vec3 curl = curlNoise(pos * noiseScale + uTime * 0.1) * turbulence;

  vec3 attractorCenter = vec3(0.0, 1.0, 0.0);
  vec3 toCenter = attractorCenter - pos;
  float dist = length(toCenter);
  float attractorStrength = 0.5 + uMemLoad * 2.0;
  vec3 attractor = normalize(toCenter) * attractorStrength / (1.0 + dist * 0.5);

  vec3 velocity = curl * speed + attractor;
  pos += velocity * uDelta;

  life -= uDelta * (0.05 + uCpuLoad * 0.1);

  if (life <= 0.0 || dist > 20.0) {
    float angle = fract(sin(dot(vUv, vec2(12.9898, 78.233)) + uTime) * 43758.5453) * 6.2831;
    float radius = fract(sin(dot(vUv.yx, vec2(93.989, 67.345)) + uTime) * 23456.789) * 3.0;
    pos = vec3(
      cos(angle) * radius,
      (fract(sin(dot(vUv, vec2(45.678, 89.012)) + uTime) * 12345.678) - 0.5) * 4.0 + 1.0,
      sin(angle) * radius
    );
    life = 0.5 + fract(sin(dot(vUv, vec2(34.567, 12.345)) + uTime) * 65432.1) * 0.5;
  }

  gl_FragColor = vec4(pos, life);
}
