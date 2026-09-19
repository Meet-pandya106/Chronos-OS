import * as THREE from 'three'

const particleVert = `
  uniform sampler2D uPositionTexture;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute vec2 aReference;
  varying float vLife;
  varying vec3 vColor;

  void main() {
    vec4 posData = texture2D(uPositionTexture, aReference);
    vec3 pos = posData.xyz;
    vLife = posData.w;

    vec3 coolCol = vec3(0.0, 0.8, 1.0);
    vec3 hotCol = vec3(1.0, 0.3, 0.1);
    vColor = mix(coolCol, hotCol, 1.0 - vLife);

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * uPixelRatio * (1.0 / -mvPos.z) * vLife;
    gl_Position = projectionMatrix * mvPos;
  }
`

const particleFrag = `
  varying float vLife;
  varying vec3 vColor;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.1, dist) * vLife * 0.7;
    float glow = exp(-dist * 6.0) * 0.5;
    gl_FragColor = vec4(vColor + glow, alpha);
  }
`

export class ParticleField {
  constructor(gpgpu) {
    this.gpgpu = gpgpu
    const count = gpgpu.particleCount
    const side = gpgpu.size

    const geometry = new THREE.BufferGeometry()
    const references = new Float32Array(count * 2)

    for (let i = 0; i < count; i++) {
      const x = (i % side) / side
      const y = Math.floor(i / side) / side
      references[i * 2] = x
      references[i * 2 + 1] = y
    }

    geometry.setAttribute('aReference', new THREE.BufferAttribute(references, 2))
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uPositionTexture: { value: null },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 30.0 }
      },
      vertexShader: particleVert,
      fragmentShader: particleFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })

    this.points = new THREE.Points(geometry, this.material)
    this.points.frustumCulled = false
  }

  update(positionTexture) {
    this.material.uniforms.uPositionTexture.value = positionTexture
  }

  dispose() {
    this.points.geometry.dispose()
    this.material.dispose()
  }
}
