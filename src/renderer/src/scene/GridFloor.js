import * as THREE from 'three'

const gridVert = `
  varying vec3 vWorldPos;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const gridFrag = `
  uniform float uTime;
  varying vec3 vWorldPos;

  float grid(vec2 p, float spacing, float thickness) {
    vec2 g = abs(fract(p / spacing - 0.5) - 0.5) * spacing;
    float line = min(g.x, g.y);
    return 1.0 - smoothstep(0.0, thickness, line);
  }

  void main() {
    vec2 pos = vWorldPos.xz;

    float g1 = grid(pos, 2.0, 0.03);
    float g2 = grid(pos, 10.0, 0.04) * 0.6;

    float wave = sin(length(pos) * 0.5 - uTime * 0.8) * 0.15 + 0.85;
    float dist = length(pos);
    float fade = exp(-dist * 0.04);

    float intensity = max(g1, g2) * fade * wave;

    vec3 color = vec3(0.0, 0.8, 1.0) * intensity * 0.4;
    float alpha = intensity * 0.6;

    gl_FragColor = vec4(color, alpha);
  }
`

export class GridFloor {
  constructor() {
    const geometry = new THREE.PlaneGeometry(200, 200, 1, 1)
    geometry.rotateX(-Math.PI / 2)

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }
      },
      vertexShader: gridVert,
      fragmentShader: gridFrag,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    })

    this.mesh = new THREE.Mesh(geometry, this.material)
    this.mesh.position.y = -1
  }

  update(time) {
    this.material.uniforms.uTime.value = time
  }

  dispose() {
    this.mesh.geometry.dispose()
    this.material.dispose()
  }
}
