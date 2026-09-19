import gsap from 'gsap'
import { Engine } from './core/Engine.js'
import { PostProcess } from './core/PostProcess.js'
import { GPGPU } from './core/GPGPU.js'
import { CoreMonolith } from './scene/CoreMonolith.js'
import { ParticleField } from './scene/ParticleField.js'
import { GridFloor } from './scene/GridFloor.js'
import { Titlebar } from './ui/Titlebar.js'
import { HUDOverlay } from './ui/HUDOverlay.js'
import { TerminalLog } from './ui/TerminalLog.js'
import { SoundEngine } from './audio/SoundEngine.js'

class ChronosApp {
  constructor() {
    this.telemetry = { cpu: 0, memory: { percent: 0, used: 0, total: 0 }, uptime: 0 }
    this.sound = new SoundEngine()
    this.engine = new Engine()
    this.postProcess = new PostProcess(this.engine)
    this.gpgpu = new GPGPU(this.engine.renderer)
    this.monolith = new CoreMonolith()
    this.particles = new ParticleField(this.gpgpu)
    this.grid = new GridFloor()
    this.titlebar = new Titlebar(this.sound)
    this.hud = new HUDOverlay()
    this.terminal = new TerminalLog()

    this.engine.scene.add(this.monolith.mesh)
    this.engine.scene.add(this.particles.points)
    this.engine.scene.add(this.grid.mesh)

    this._bindIPC()
    this._bindUI()
    this._animate()

    this.terminal.log('CHRONOS-OS v1.0.0 initialized')
    const gl = this.engine.renderer.getContext()
    const rendererInfo = gl.getParameter(gl.RENDERER) || 'Generic WebGL'
    this.terminal.log(`GPU Device: ${rendererInfo}`)
    this.terminal.log(`GPGPU Kernel: ${this.gpgpu.particleCount.toLocaleString()} particle compute threads online`)
    this.terminal.log('Awaiting telemetry stream from Electron Main...')
  }

  _bindIPC() {
    if (!window.chronosAPI) {
      this.terminal.warn('Running in standalone Web mode: Simulating telemetry stream.')
      this._startSimulatedTelemetry()
      return
    }

    this.terminal.log('IPC Preload Bridge connected.')
    window.chronosAPI.onTelemetryUpdate((data) => {
      this.telemetry = data
      this.hud.update(data)
      this.terminal.log(`[TEL] CPU=${data.cpu}% MEM=${data.memory.percent}% NET_UP=${data.network?.length || 0} interfaces`)
    })
  }

  _startSimulatedTelemetry() {
    setInterval(() => {
      const mockData = {
        timestamp: Date.now(),
        cpu: Math.round(15 + Math.sin(Date.now() * 0.001) * 12 + Math.random() * 8),
        memory: {
          total: 32 * 1024 * 1024 * 1024,
          free: 18 * 1024 * 1024 * 1024,
          used: 14 * 1024 * 1024 * 1024,
          percent: 44
        },
        network: [{ name: 'eth0', address: '192.168.1.100', mac: '00:1A:2B:3C:4D:5E' }],
        uptime: Math.round(performance.now() / 1000) + 3600,
        hostname: 'CHRONOS-NODE-01',
        platform: 'win32',
        arch: 'x64',
        cpuModel: 'Intel Core i9 / AMD Ryzen Quantum Core',
        cpuCores: 16
      }
      this.telemetry = mockData
      this.hud.update(mockData)
    }, 1000)
  }

  _bindUI() {
    const muteBtn = document.getElementById('btn-mute')
    if (muteBtn) {
      muteBtn.textContent = this.sound.isMuted() ? '🔇' : '🔊'
      muteBtn.addEventListener('click', () => {
        const muted = this.sound.toggleMute()
        muteBtn.textContent = muted ? '🔇' : '🔊'
        this.terminal.log(`Audio subsystem ${muted ? 'MUTED' : 'ACTIVE'}`)
      })
    }

    const benchBtn = document.getElementById('btn-benchmark')
    if (benchBtn) {
      benchBtn.addEventListener('click', async () => {
        this.sound.playChirp(1500, 0.1)
        this.terminal.log('STRESS TEST: Launching compute stress benchmark...')

        // GSAP camera zoom & chromatic aberration surge
        gsap.to(this.engine.camera.position, {
          z: 7,
          y: 2.5,
          duration: 0.6,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut'
        })

        gsap.to(this.postProcess.chromaticPass.uniforms.uIntensity, {
          value: 0.015,
          duration: 0.4,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut'
        })

        if (window.chronosAPI) {
          const result = await window.chronosAPI.triggerBenchmark()
          this.sound.playChirp(2000, 0.15)
          this.terminal.log(`Benchmark completed in ${result.elapsed}ms (Checksum: ${result.result.toFixed(2)})`)
        } else {
          const start = performance.now()
          let sum = 0
          for (let i = 0; i < 1e7; i++) sum += Math.sqrt(i)
          const elapsed = Math.round(performance.now() - start)
          this.terminal.log(`Web fallback benchmark completed in ${elapsed}ms`)
        }
      })
    }
  }

  _animate() {
    const clock = this.engine.clock
    let frameCount = 0
    let lastFpsTime = 0

    const loop = () => {
      requestAnimationFrame(loop)

      const elapsed = clock.getElapsedTime()
      frameCount++

      if (elapsed - lastFpsTime >= 1.0) {
        this.hud.setFPS(frameCount)
        frameCount = 0
        lastFpsTime = elapsed
      }

      const cpuNorm = (this.telemetry.cpu || 0) / 100
      const memNorm = (this.telemetry.memory?.percent || 0) / 100

      this.gpgpu.compute(elapsed, cpuNorm, memNorm)
      this.particles.update(this.gpgpu.getCurrentTexture())
      this.monolith.update(elapsed, cpuNorm, this.engine.camera.position)
      this.grid.update(elapsed)
      this.sound.update(cpuNorm)
      this.engine.controls.update()

      this.postProcess.render()

      const info = this.engine.renderer.info
      this.hud.setRenderStats(info.render.calls, info.render.triangles, this.gpgpu.particleCount)
    }

    loop()
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new ChronosApp()
})
