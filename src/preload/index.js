const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('chronosAPI', {
  onTelemetryUpdate: (callback) => {
    const handler = (_event, data) => callback(data)
    ipcRenderer.on('telemetry:update', handler)
    return () => ipcRenderer.removeListener('telemetry:update', handler)
  },
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  triggerBenchmark: () => ipcRenderer.invoke('benchmark:trigger')
})
