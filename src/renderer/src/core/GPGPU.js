import * as THREE from 'three'
import gpgpuPositionFrag from '../shaders/gpgpuPosition.frag.glsl?raw'

const PARTICLE_SIDE = 320
const PARTICLE_COUNT = PARTICLE_SIDE * PARTICLE_SIDE // 102,400 particles

const gpgpuVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export class GPGPU {
  constructor(renderer) {
    this.renderer = renderer
    this.size = PARTICLE_SIDE

    const data = new Float32Array(this.size * this.size * 4)
    for (let i = 0; i < this.size * this.size; i++) {
      const i4 = i * 4
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos((Math.random() * 2) - 1)
      const r = 2.0 + Math.random() * 6.0

      data[i4] = r * Math.sin(phi) * Math.cos(theta)
      data[i4 + 1] = r * Math.sin(phi) * Math.sin(theta) + 2.0
      data[i4 + 2] = r * Math.cos(phi)
      data[i4 + 3] = Math.random() // Life [0..1]
    }

    const initTexture = new THREE.DataTexture(
      data,
      this.size,
      this.size,
      THREE.RGBAFormat,
      THREE.FloatType
    )
    initTexture.needsUpdate = true

    this.rtA = this._createRenderTarget()
    this.rtB = this._createRenderTarget()
    this.currentRT = 0

    this.computeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPositions: { value: initTexture },
        uTime: { value: 0 },
        uDelta: { value: 0.016 },
        uCpuLoad: { value: 0 },
        uMemLoad: { value: 0 },
        uResolution: { value: new THREE.Vector2(this.size, this.size) }
      },
      vertexShader: gpgpuVertexShader,
      fragmentShader: gpgpuPositionFrag,
      depthTest: false,
      depthWrite: false
    })

    this.quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      this.computeMaterial
    )
    this.computeScene = new THREE.Scene()
    this.computeScene.add(this.quad)
    this.computeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    this._initPass(initTexture)
  }

  _createRenderTarget() {
    return new THREE.WebGLRenderTarget(this.size, this.size, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false
    })
  }

  _initPass(initTexture) {
    this.computeMaterial.uniforms.uPositions.value = initTexture
    const oldTarget = this.renderer.getRenderTarget()
    this.renderer.setRenderTarget(this.rtA)
    this.renderer.render(this.computeScene, this.computeCamera)
    this.renderer.setRenderTarget(this.rtB)
    this.renderer.render(this.computeScene, this.computeCamera)
    this.renderer.setRenderTarget(oldTarget)
  }

  compute(time, cpuNorm, memNorm) {
    const source = this.currentRT === 0 ? this.rtA : this.rtB
    const target = this.currentRT === 0 ? this.rtB : this.rtA

    this.computeMaterial.uniforms.uPositions.value = source.texture
    this.computeMaterial.uniforms.uTime.value = time
    this.computeMaterial.uniforms.uCpuLoad.value = cpuNorm
    this.computeMaterial.uniforms.uMemLoad.value = memNorm

    const oldTarget = this.renderer.getRenderTarget()
    this.renderer.setRenderTarget(target)
    this.renderer.render(this.computeScene, this.computeCamera)
    this.renderer.setRenderTarget(oldTarget)

    this.currentRT = 1 - this.currentRT
  }

  getCurrentTexture() {
    return (this.currentRT === 0 ? this.rtB : this.rtA).texture
  }

  get particleCount() {
    return PARTICLE_COUNT
  }

  dispose() {
    this.rtA.dispose()
    this.rtB.dispose()
    this.computeMaterial.dispose()
    this.quad.geometry.dispose()
  }
}
