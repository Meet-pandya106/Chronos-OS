interface TelemetryData {
  timestamp: number
  cpu: number
  memory: {
    total: number
    free: number
    used: number
    percent: number
  }
  network: Array<{
    name: string
    address: string
    mac: string
  }>
  uptime: number
  hostname: string
  platform: string
  arch: string
  cpuModel: string
  cpuCores: number
}

interface BenchmarkResult {
  elapsed: number
  result: number
}

interface ChronosAPI {
  onTelemetryUpdate: (callback: (data: TelemetryData) => void) => () => void
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void
  triggerBenchmark: () => Promise<BenchmarkResult>
}

declare global {
  interface Window {
    chronosAPI: ChronosAPI
  }
}

export {}
