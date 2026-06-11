const { app, BrowserWindow, ipcMain } = require('electron')
const http = require('http')
const fs = require('fs')
const path = require('path')

const isDev = process.env.NODE_ENV === 'development'
const APP_URL = 'http://127.0.0.1:5173'
let staticServer = null
let mainWindow = null
let normalBounds = null

const MIME_TYPES = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

function startStaticServer() {
  const distDir = path.resolve(__dirname, '../dist')

  return new Promise((resolve, reject) => {
    staticServer = http.createServer((req, res) => {
      const pathname = decodeURIComponent(new URL(req.url, APP_URL).pathname)
      const requestedPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
      const filePath = path.resolve(distDir, requestedPath)
      const safePath = filePath.startsWith(`${distDir}${path.sep}`) ? filePath : path.join(distDir, 'index.html')
      const responsePath = fs.existsSync(safePath) && fs.statSync(safePath).isFile()
        ? safePath
        : path.join(distDir, 'index.html')

      res.setHeader('Content-Type', MIME_TYPES[path.extname(responsePath)] || 'application/octet-stream')
      fs.createReadStream(responsePath)
        .on('error', () => {
          res.statusCode = 500
          res.end('Failed to load application')
        })
        .pipe(res)
    })

    staticServer.once('error', reject)
    staticServer.listen(5173, '127.0.0.1', resolve)
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1080,
    height: 900,
    minWidth: 900,
    minHeight: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    titleBarStyle: 'default',
    show: false,
  })

  if (isDev) {
    win.loadURL(APP_URL)
    win.webContents.openDevTools()
  } else {
    win.loadURL(APP_URL)
  }

  win.once('ready-to-show', () => win.show())
  mainWindow = win
}

ipcMain.handle('window:set-always-on-top', (_event, enabled) => {
  mainWindow?.setAlwaysOnTop(Boolean(enabled), 'floating')
  return mainWindow?.isAlwaysOnTop() ?? false
})

ipcMain.handle('window:set-todo-compact', (_event, enabled) => {
  if (!mainWindow) return

  if (enabled) {
    if (!normalBounds) normalBounds = mainWindow.getBounds()
    mainWindow.setMinimumSize(390, 462)
    mainWindow.setContentSize(390, 462, true)
    mainWindow.setResizable(false)
  } else {
    mainWindow.setAlwaysOnTop(false)
    mainWindow.setResizable(true)
    mainWindow.setMinimumSize(900, 720)
    if (normalBounds) {
      mainWindow.setBounds(normalBounds, true)
      normalBounds = null
    }
  }
})

ipcMain.handle('window:set-calendar-collapsed', (_event, enabled) => {
  if (!mainWindow) return
  if (enabled) {
    mainWindow.setMinimumSize(376, 720)
    mainWindow.setSize(392, Math.max(mainWindow.getSize()[1], 720), true)
  } else {
    mainWindow.setMinimumSize(900, 720)
    mainWindow.setSize(1080, Math.max(mainWindow.getSize()[1], 720), true)
  }
})

app.whenReady().then(async () => {
  if (!isDev) await startStaticServer()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    staticServer?.close()
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
