export class Titlebar {
  constructor(soundEngine = null) {
    this.sound = soundEngine
    const btnMin = document.getElementById('btn-minimize')
    const btnMax = document.getElementById('btn-maximize')
    const btnClose = document.getElementById('btn-close')

    if (btnMin) {
      btnMin.addEventListener('click', () => {
        if (this.sound) this.sound.playChirp(900, 0.04)
        if (window.chronosAPI) window.chronosAPI.minimizeWindow()
      })
    }

    if (btnMax) {
      btnMax.addEventListener('click', () => {
        if (this.sound) this.sound.playChirp(1200, 0.04)
        if (window.chronosAPI) window.chronosAPI.maximizeWindow()
      })
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        if (this.sound) this.sound.playChirp(600, 0.08)
        if (window.chronosAPI) window.chronosAPI.closeWindow()
      })
    }
  }
}
