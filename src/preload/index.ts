import { contextBridge, ipcRenderer } from 'electron'

// Define the types for our API
export interface RadioStation {
  id: string
  name: string
  url: string
  favorite: boolean
}

export interface Config {
  version: string
  stations: RadioStation[]
  settings: {
    volume: number
    lastStation: string | null
  }
}

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
const api = {
  config: {
    read: (): Promise<Config> => ipcRenderer.invoke('config:read'),
    write: (data: Config): Promise<boolean> => ipcRenderer.invoke('config:write', data)
  },
  dialog: {
    showError: (title: string, message: string): Promise<void> =>
      ipcRenderer.invoke('dialog:showError', title, message)
  }
}

// Use `contextBridge` to expose the API to the renderer process
// This is the SECURE way to expose Node.js functionality to the renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', api)
  } catch (error) {
    console.error('Failed to expose API:', error)
  }
} else {
  // @ts-ignore (Fallback for when contextIsolation is disabled, should not happen in production)
  window.electronAPI = api
}

// Type definitions for the renderer process
declare global {
  interface Window {
    electronAPI: typeof api
  }
}
