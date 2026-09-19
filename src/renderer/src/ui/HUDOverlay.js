import gsap from 'gsap'

export class HUDOverlay {
  constructor() {
    this.elCpu = document.getElementById('hud-cpu')
    this.elCpuBar = document.getElementById('hud-cpu-bar')
    this.elCpuModel = document.getElementById('hud-cpu-model')
    this.elMem = document.getElementById('hud-mem')
    this.elMemBar = document.getElementById('hud-mem-bar')
    this.elMemDetail = document.getElementById('hud-mem-detail')
    this.elFps = document.getElementById('hud-fps')
    this.elDraws = document.getElementById('hud-draws')
    this.elTris = document.getElementById('hud-tris')
    this.elHost = document.getElementById('hud-host')
    this.elUptime = document.getElementById('hud-uptime')
    this.elPlatform = document.getElementById('hud-platform')
    this.elCores = document.getElementById('hud-cores')
    this.elParticles = document.getElementById('hud-particles')

    this.currentCpu = 0
    this.currentMem = 0

    this._playIntroAnimation()
  }

  _playIntroAnimation() {
    gsap.from('.hud-panel', {
      duration: 1.2,
      y: 20,
      opacity: 0,
      stagger: 0.15,
      ease: 'power3.out'
    })

    gsap.from('#titlebar', {
      duration: 0.8,
      y: -36,
      opacity: 0,
      ease: 'power2.out'
    })
  }

  update(data) {
    const targetCpu = data.cpu
    const targetMem = data.memory.percent

    // GSAP tween for smooth numeric transitions
    gsap.to(this, {
      currentCpu: targetCpu,
      duration: 0.8,
      ease: 'power1.out',
      onUpdate: () => {
        const val = Math.round(this.currentCpu)
        this.elCpu.textContent = `${val}%`
        this.elCpuBar.style.width = `${val}%`
      }
    })

    if (targetCpu > 75) {
      this.elCpuBar.classList.add('bar-hot')
      gsap.to(this.elCpu, { color: '#ff3344', duration: 0.3 })
    } else {
      this.elCpuBar.classList.remove('bar-hot')
      gsap.to(this.elCpu, { color: '#00f0ff', duration: 0.5 })
    }

    this.elCpuModel.textContent = data.cpuModel

    gsap.to(this, {
      currentMem: targetMem,
      duration: 0.8,
      ease: 'power1.out',
      onUpdate: () => {
        const val = Math.round(this.currentMem)
        this.elMem.textContent = `${val}%`
        this.elMemBar.style.width = `${val}%`
      }
    })

    if (targetMem > 80) {
      this.elMemBar.classList.add('bar-hot')
      gsap.to(this.elMem, { color: '#ff3344', duration: 0.3 })
    } else {
      this.elMemBar.classList.remove('bar-hot')
      gsap.to(this.elMem, { color: '#00f0ff', duration: 0.5 })
    }

    const usedGB = (data.memory.used / (1024 ** 3)).toFixed(1)
    const totalGB = (data.memory.total / (1024 ** 3)).toFixed(1)
    this.elMemDetail.textContent = `${usedGB} GB / ${totalGB} GB`

    this.elHost.textContent = data.hostname
    this.elUptime.textContent = this._formatUptime(data.uptime)
    this.elPlatform.textContent = `${data.platform} (${data.arch})`
    this.elCores.textContent = `${data.cpuCores} Threads`
  }

  setFPS(fps) {
    this.elFps.textContent = fps
  }

  setRenderStats(draws, tris, particles) {
    this.elDraws.textContent = draws
    this.elTris.textContent = tris.toLocaleString()
    if (particles && this.elParticles) {
      this.elParticles.textContent = particles.toLocaleString()
    }
  }

  _formatUptime(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return `${h}h ${m}m ${s}s`
  }
}
