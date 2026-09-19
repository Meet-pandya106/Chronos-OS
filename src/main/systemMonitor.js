import os from 'os'

export class SystemMonitor {
  constructor() {
    this._interval = null
    this._prevCpuInfo = null
  }

  _getCpuUsage() {
    const cpus = os.cpus()
    let totalIdle = 0
    let totalTick = 0

    for (const cpu of cpus) {
      const { user, nice, sys, idle, irq } = cpu.times
      totalTick += user + nice + sys + idle + irq
      totalIdle += idle
    }

    const currentInfo = { idle: totalIdle, total: totalTick }

    if (!this._prevCpuInfo) {
      this._prevCpuInfo = currentInfo
      return 0
    }

    const idleDiff = currentInfo.idle - this._prevCpuInfo.idle
    const totalDiff = currentInfo.total - this._prevCpuInfo.total
    this._prevCpuInfo = currentInfo

    if (totalDiff === 0) return 0
    return Math.round((1 - idleDiff / totalDiff) * 100)
  }

  _getMemoryUsage() {
    const total = os.totalmem()
    const free = os.freemem()
    const used = total - free
    return {
      total,
      free,
      used,
      percent: Math.round((used / total) * 100)
    }
  }

  _getNetworkInfo() {
    const interfaces = os.networkInterfaces()
    const result = []
    for (const [name, addrs] of Object.entries(interfaces)) {
      if (!addrs) continue
      for (const addr of addrs) {
        if (addr.family === 'IPv4' && !addr.internal) {
          result.push({ name, address: addr.address, mac: addr.mac })
        }
      }
    }
    return result
  }

  start(callback) {
    this._prevCpuInfo = null
    this._getCpuUsage()

    this._interval = setInterval(() => {
      const data = {
        timestamp: Date.now(),
        cpu: this._getCpuUsage(),
        memory: this._getMemoryUsage(),
        network: this._getNetworkInfo(),
        uptime: os.uptime(),
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        cpuModel: os.cpus()[0]?.model || 'Unknown',
        cpuCores: os.cpus().length
      }
      callback(data)
    }, 1000)
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval)
      this._interval = null
    }
  }
}
