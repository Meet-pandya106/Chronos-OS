import * as THREE from 'three'
import monolithVert from '../shaders/monolith.vert.glsl?raw'
import monolithFrag from '../shaders/monolith.frag.glsl?raw'

export class CoreMonolith {
  constructor() {
    this.geometry = new THREE.IcosahedronGeometry(1.6, 6)

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uCpuLoad: { value: 0 },
        uCameraPosition: { value: new THREE.Vector3() }
      },
      vertexShader: monolithVert,
      fragmentShader: monolithFrag,
      transparent: true,
      side: THREE.DoubleSide
    })

    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.position.set(0, 2, 0)
  }

  update(time, cpuNorm, cameraPosition) {
    this.material.uniforms.uTime.value = time
    this.material.uniforms.uCpuLoad.value = cpuNorm
    if (cameraPosition) {
      this.material.uniforms.uCameraPosition.value.copy(cameraPosition)
    }

    this.mesh.rotation.y = time * 0.15
    this.mesh.rotation.x = Math.sin(time * 0.08) * 0.12

    const scale = 1.0 + cpuNorm * 0.35
    this.mesh.scale.setScalar(scale)
  }

  dispose() {
    this.geometry.dispose()
    this.material.dispose()
  }
}
