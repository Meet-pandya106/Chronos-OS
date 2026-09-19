export class TerminalLog {
  constructor(maxEntries = 50) {
    this.container = document.getElementById('terminal-log')
    this.maxEntries = maxEntries
    this.entries = []
  }

  log(message, type = 'info') {
    if (!this.container) return

    const now = new Date()
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0')}`

    const line = document.createElement('div')
    line.className = `log-line ${type}`
    line.innerHTML = `<span style="color: rgba(0, 240, 255, 0.35); margin-right: 6px;">[${timestamp}]</span><span>${message}</span>`

    this.container.appendChild(line)
    this.entries.push(line)

    if (this.entries.length > this.maxEntries) {
      const oldest = this.entries.shift()
      if (oldest && oldest.parentNode) {
        oldest.parentNode.removeChild(oldest)
      }
    }

    this.container.scrollTop = this.container.scrollHeight
  }

  warn(message) {
    this.log(message, 'warn')
  }

  error(message) {
    this.log(message, 'error')
  }

  clear() {
    if (!this.container) return
    this.container.innerHTML = ''
    this.entries = []
  }
}
