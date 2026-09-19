import { ipcMain, BrowserWindow } from 'electron'

export function registerIpcHandlers() {
  ipcMain.on('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.minimize()
  })

  ipcMain.on('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  ipcMain.on('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.close()
  })

  ipcMain.handle('benchmark:trigger', async () => {
    const start = performance.now()
    let sum = 0
    for (let i = 0; i < 1e7; i++) {
      sum += Math.sqrt(i)
    }
    const elapsed = performance.now() - start
    return { elapsed: Math.round(elapsed), result: sum }
  })
}
