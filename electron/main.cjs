const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

const isDev = !app.isPackaged;

// ---------------------------------------------------------------------------
// Runtime server configuration
// ---------------------------------------------------------------------------
// Reads server URL from <userData>/config.json so the kiosk machine's IT
// staff can change the server IP without rebuilding the app.
// On Windows: C:\Users\<user>\AppData\Roaming\Attendance Kiosk\config.json
// ---------------------------------------------------------------------------
function loadServerUrl() {
  const configPath = path.join(app.getPath("userData"), "config.json");
  const defaults = { serverUrl: "http://localhost:5000" };

  if (!fs.existsSync(configPath)) {
    // Write a default config so staff can discover and edit it.
    try {
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
      fs.writeFileSync(configPath, JSON.stringify(defaults, null, 2), "utf8");
    } catch (_) {
      // Non-fatal — just use the default.
    }
    return defaults.serverUrl;
  }

  try {
    const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
    return (typeof cfg.serverUrl === "string" && cfg.serverUrl.trim())
      ? cfg.serverUrl.trim()
      : defaults.serverUrl;
  } catch (_) {
    return defaults.serverUrl;
  }
}

function createWindow() {
  const serverUrl = isDev ? "http://localhost:5000" : loadServerUrl();

  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 900,
    minHeight: 650,
    icon: path.join(__dirname, "../src/assets/logo.png"),
    frame: false,
    fullscreen: true,
    kiosk: true,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
      additionalArguments: [`--kiosk-server-url=${serverUrl}`],
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5174");
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, "../dist/index.html");
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error("Failed to load file:", err);
      mainWindow.loadURL(`file://${indexPath}`);
    });
  }

  mainWindow.webContents.on("did-fail-load", () => {
    console.error("Page failed to load");
  });

  mainWindow.webContents.on("crashed", () => {
    console.error("Renderer process crashed");
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
