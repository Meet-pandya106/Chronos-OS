export class SoundEngine {
  constructor() {
    this.muted = localStorage.getItem('chronos_audio_muted') === 'true'
    this.ctx = null
    this.masterGain = null
    this.filter = null
    this.osc1 = null
    this.osc2 = null
    this.lfo = null
    this.lfoGain = null
    this.initialized = false
    this.lastAlarmTime = 0

    this._initAudioOnInteraction = this._initAudioOnInteraction.bind(this)
    window.addEventListener('click', this._initAudioOnInteraction, { once: true })
    window.addEventListener('keydown', this._initAudioOnInteraction, { once: true })
  }

  _initContext() {
    if (this.initialized) return

    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return

    this.ctx = new AudioContextClass()

    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.setValueAtTime(this.muted ? 0.0 : 0.25, this.ctx.currentTime)
    this.masterGain.connect(this.ctx.destination)

    this.filter = this.ctx.createBiquadFilter()
    this.filter.type = 'lowpass'
    this.filter.frequency.setValueAtTime(180, this.ctx.currentTime)
    this.filter.Q.setValueAtTime(4.0, this.ctx.currentTime)
    this.filter.connect(this.masterGain)

    // Detuned sawtooth drone oscillator 1 (sub-bass / drone)
    this.osc1 = this.ctx.createOscillator()
    this.osc1.type = 'sawtooth'
    this.osc1.frequency.setValueAtTime(55.0, this.ctx.currentTime) // A1 (55 Hz)

    // Detuned sawtooth drone oscillator 2
    this.osc2 = this.ctx.createOscillator()
    this.osc2.type = 'sawtooth'
    this.osc2.frequency.setValueAtTime(55.75, this.ctx.currentTime) // +0.75 Hz detune for beat-frequency throb

    // LFO for subtle pulse/modulation
    this.lfo = this.ctx.createOscillator()
    this.lfo.type = 'sine'
    this.lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime)

    this.lfoGain = this.ctx.createGain()
    this.lfoGain.gain.setValueAtTime(30, this.ctx.currentTime)
    this.lfo.connect(this.lfoGain)
    this.lfoGain.connect(this.filter.frequency)

    const droneGain = this.ctx.createGain()
    droneGain.gain.setValueAtTime(0.12, this.ctx.currentTime)

    this.osc1.connect(this.filter)
    this.osc2.connect(this.filter)

    this.osc1.start()
    this.osc2.start()
    this.lfo.start()

    this.initialized = true
  }

  _initAudioOnInteraction() {
    this._initContext()
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  update(cpuNorm) {
    if (!this.initialized || !this.ctx || this.muted) return

    // Dynamic filter cutoff tracking CPU load (120Hz at idle to 1800Hz under heavy load)
    const targetCutoff = 120 + Math.pow(cpuNorm, 1.8) * 1600
    const now = this.ctx.currentTime

    this.filter.frequency.setTargetAtTime(targetCutoff, now, 0.2)

    // LFO rate speeds up with CPU
    const lfoRate = 0.2 + cpuNorm * 3.0
    this.lfo.frequency.setTargetAtTime(lfoRate, now, 0.2)

    // Trigger high-load alarm tone if CPU > 85% and interval passed
    if (cpuNorm > 0.85 && Date.now() - this.lastAlarmTime > 4000) {
      this.playAlarm()
      this.lastAlarmTime = Date.now()
    }
  }

  playChirp(freq = 1200, duration = 0.06) {
    if (!this.initialized || !this.ctx || this.muted) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + duration)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + duration)
  }

  playAlarm() {
    if (!this.initialized || !this.ctx || this.muted) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(880, now) // A5
    osc.frequency.setValueAtTime(660, now + 0.15) // E5
    osc.frequency.setValueAtTime(880, now + 0.3)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + 0.45)
  }

  toggleMute() {
    this._initContext()
    this.muted = !this.muted
    localStorage.setItem('chronos_audio_muted', String(this.muted))

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.muted ? 0.0 : 0.25,
        this.ctx.currentTime,
        0.05
      )
    }

    if (!this.muted) {
      this.playChirp(800, 0.08)
    }

    return this.muted
  }

  isMuted() {
    return this.muted
  }
}
