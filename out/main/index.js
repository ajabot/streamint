"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const fs = require("fs/promises");
const os = require("os");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const os__namespace = /* @__PURE__ */ _interopNamespaceDefault(os);
const CONFIG_DIR = path.join(os__namespace.homedir(), ".streamint");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");
const DEFAULT_CONFIG = {
  version: "1.0",
  stations: [],
  settings: {
    volume: 0.5,
    lastStation: null
  }
};
electron.ipcMain.handle("config:read", async () => {
  try {
    const data = await fs__namespace.readFile(CONFIG_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await ensureConfigDir();
      await fs__namespace.writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
      return DEFAULT_CONFIG;
    }
    console.error("Error reading config:", error);
    throw error;
  }
});
electron.ipcMain.handle("config:write", async (_event, data) => {
  try {
    await ensureConfigDir();
    await fs__namespace.writeFile(CONFIG_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing config:", error);
    throw error;
  }
});
electron.ipcMain.handle("dialog:showError", async (_event, title, message) => {
  return await electron.dialog.showMessageBox({
    type: "error",
    title,
    message
  });
});
async function ensureConfigDir() {
  try {
    await fs__namespace.mkdir(CONFIG_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating config directory:", error);
  }
}
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
      // CRITICAL: Disabled for security
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    require("electron").shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.streamint");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
