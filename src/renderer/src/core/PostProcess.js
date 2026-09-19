import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import postAberrationFrag from '../shaders/postAberration.frag.glsl?raw'

const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    uIntensity: { value: 0.004 },
    uTime: { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: postAberrationFrag
}

export class PostProcess {
  constructor(engine) {
    this.engine = engine
    this.clock = engine.clock

    const size = engine.renderer.getSize(new THREE.Vector2())
    this.composer = new EffectComposer(engine.renderer)

    const renderPass = new RenderPass(engine.scene, engine.camera)
    this.composer.addPass(renderPass)

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.x, size.y),
      0.9,
      0.45,
      0.82
    )
    this.composer.addPass(this.bloomPass)

    this.chromaticPass = new ShaderPass(ChromaticAberrationShader)
    this.composer.addPass(this.chromaticPass)

    window.addEventListener('resize', () => {
      const s = engine.renderer.getSize(new THREE.Vector2())
      this.composer.setSize(s.x, s.y)
    })
  }

  render() {
    this.chromaticPass.uniforms.uTime.value = this.clock.getElapsedTime()
    this.composer.render()
  }

  setAberrationIntensity(val) {
    this.chromaticPass.uniforms.uIntensity.value = val
  }
}
