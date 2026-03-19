const { app, BrowserWindow } = require("electron");
const path = require("path");

const isDev = process.env.NODE_ENV === "development";

function createWindow() {
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
      preload: undefined,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
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
