import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import * as fs from 'fs/promises'
import * as os from 'os'

// Config file path in user's home directory
const CONFIG_DIR = join(os.homedir(), '.streamint')
const CONFIG_PATH = join(CONFIG_DIR, 'config.json')

interface RadioStation {
  id: string
  name: string
  url: string
  favorite: boolean
}

interface Config {
  version: string
  stations: RadioStation[]
  settings: {
    volume: number
    lastStation: string | null
  }
}

const DEFAULT_CONFIG: Config = {
  version: '1.0',
  stations: [],
  settings: {
    volume: 0.5,
    lastStation: null
  }
}

// IPC Handlers for config operations

ipcMain.handle('config:read', async () => {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf8')
    return JSON.parse(data) as Config
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Config file doesn't exist, create it with defaults
      await ensureConfigDir()
      await fs.writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2))
      return DEFAULT_CONFIG
    }
    console.error('Error reading config:', error)
    throw error
  }
})

ipcMain.handle('config:write', async (_event, data: Config) => {
  try {
    await ensureConfigDir()
    await fs.writeFile(CONFIG_PATH, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing config:', error)
    throw error
  }
})

ipcMain.handle('dialog:showError', async (_event, title: string, message: string) => {
  return await dialog.showMessageBox({
    type: 'error',
    title,
    message
  })
})

// Ensure config directory exists
async function ensureConfigDir(): Promise<void> {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true })
  } catch (error) {
    console.error('Error creating config directory:', error)
  }
}

function createWindow(): void {
  // Create the browser window with secure settings
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false // CRITICAL: Disabled for security
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    // Open external links in default browser
    require('electron').shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the renderer based on environment
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// App lifecycle

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.streamint')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
