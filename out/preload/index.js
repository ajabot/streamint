"use strict";
const electron = require("electron");
const api = {
  config: {
    read: () => electron.ipcRenderer.invoke("config:read"),
    write: (data) => electron.ipcRenderer.invoke("config:write", data)
  },
  dialog: {
    showError: (title, message) => electron.ipcRenderer.invoke("dialog:showError", title, message)
  }
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electronAPI", api);
  } catch (error) {
    console.error("Failed to expose API:", error);
  }
} else {
  window.electronAPI = api;
}
