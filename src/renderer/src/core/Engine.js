import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export class Engine {
  constructor() {
    this.clock = new THREE.Clock()
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(0x0a0a0f, 0.035)

    const container = document.getElementById('canvas-container')
    const w = window.innerWidth
    const h = window.innerHeight

    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 200)
    this.camera.position.set(0, 4, 12)
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    })
    this.renderer.setSize(w, h)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    container.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.enablePan = false
    this.controls.minDistance = 5
    this.controls.maxDistance = 40
    this.controls.maxPolarAngle = Math.PI * 0.85
    this.controls.target.set(0, 1, 0)

    const ambientLight = new THREE.AmbientLight(0x111122, 0.5)
    this.scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00f0ff, 2, 50)
    pointLight.position.set(0, 5, 0)
    this.scene.add(pointLight)

    window.addEventListener('resize', () => this._onResize())
  }

  _onResize() {
    const w = window.innerWidth
    const h = window.innerHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }
}
