precision highp float;

uniform float uTime;
uniform float uCpuLoad;
uniform vec3 uCameraPosition;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

vec3 coolColor = vec3(0.0, 0.6, 0.9);
vec3 warmColor = vec3(1.0, 0.4, 0.05);
vec3 hotColor = vec3(1.0, 0.1, 0.1);

void main() {
  vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
  float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);

  vec3 baseColor = mix(coolColor, warmColor, uCpuLoad);
  baseColor = mix(baseColor, hotColor, smoothstep(0.7, 1.0, uCpuLoad));

  float scanline = 0.85 + 0.15 * sin(vWorldPosition.y * 40.0 + uTime * 3.0);
  float pulse = 0.9 + 0.1 * sin(uTime * 2.0 + vPosition.y * 5.0);

  vec3 fresnelColor = mix(baseColor * 1.5, vec3(1.0), 0.3);
  vec3 color = mix(baseColor * pulse, fresnelColor, fresnel * 0.8);
  color *= scanline;

  float glow = fresnel * (0.5 + uCpuLoad * 1.5);
  color += baseColor * glow * 0.3;

  float emit = 0.3 + uCpuLoad * 0.7;
  gl_FragColor = vec4(color * emit, 0.95);
}
