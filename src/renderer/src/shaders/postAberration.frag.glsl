precision highp float;

uniform sampler2D tDiffuse;
uniform float uIntensity;
uniform float uTime;

varying vec2 vUv;

void main() {
  vec2 center = vec2(0.5);
  vec2 dir = vUv - center;
  float dist = length(dir);
  float strength = uIntensity * dist * dist;

  vec2 rOffset = dir * strength * 1.0;
  vec2 bOffset = dir * strength * -1.0;

  float r = texture2D(tDiffuse, vUv + rOffset).r;
  float g = texture2D(tDiffuse, vUv).g;
  float b = texture2D(tDiffuse, vUv + bOffset).b;

  float scanline = 0.96 + 0.04 * sin(vUv.y * 600.0 + uTime * 4.0);
  float vignette = smoothstep(0.9, 0.4, dist);
  float grain = 0.98 + 0.02 * fract(sin(dot(vUv * (uTime + 1.0), vec2(12.9898, 78.233))) * 43758.5453);

  gl_FragColor = vec4(vec3(r, g, b) * scanline * vignette * grain, 1.0);
}
