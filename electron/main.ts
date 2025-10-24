import { app, BrowserWindow, ipcMain, shell } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHotspot } from "./hotspotManager";
import { platform } from "node:os";
import { stopMyPublicWiFi } from "./win";
import { stopAttendanceServer, setMainWindow } from "./attendanceServer";
import fs from "fs";
import os from "os";
import { stopHotspotLinux } from "./linux";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Request admin privileges on Windows
if (process.platform === "win32") {
  const { execSync } = require("child_process");

  const isAdmin = () => {
    try {
      execSync("net session 2>nul", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  };

  // Only check admin status if not  in development mode with --no-sandbox
  const isDev = process.argv.includes("--no-sandbox");

  if (!isDev && !isAdmin()) {
    console.log(
      "🔐 App needs admin privileges. Please restart with admin rights."
    );
    const { dialog } = require("electron");

    app.whenReady().then(() => {
      dialog.showErrorBox(
        "Administrator Rights Required",
        "This app requires administrator privileges to create hotspots.\n\nPlease right-click the app and select 'Run as administrator'."
      );
      app.quit();
    });
  } else if (!isDev) {
    console.log("✅ Running with administrator privileges");
  }
}

process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    height: 1000,
    width: 1000,

    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      // Use plugin 'vite-electron-plugin' to enable nodeIntegration
      // More info:
    },
  });

  // Set the window reference for attendance server
  setMainWindow(win);

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", async () => {
  if (process.platform !== "darwin") {
    if (platform() === "win32") {
      await stopMyPublicWiFi();
    }

    if (platform() === "linux") {
      await stopHotspotLinux();
    }
    app.quit();
    win = null;
  }
  // gracefully stop attendance server.
  stopAttendanceServer();
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle("createSession", async (_event, data) => {
  console.log("🚀 ~ ipcMain.handle ~ data:", data);

  return await createHotspot(data);
});

// Handle saving Excel file with directory creation
ipcMain.handle(
  "save-excel-file",
  async (_event, { fileBuffer, fileName, folderPath }) => {
    try {
      // Get appropriate base directory based on OS

      const baseDir = path.join(os.homedir(), "Documents", "Attendance");

      // Create full path with session-based folder structure
      const fullDir = path.join(baseDir, folderPath);

      // Create directories recursively (works on all OS)
      fs.mkdirSync(fullDir, { recursive: true });

      // Full file path
      const filePath = path.join(fullDir, fileName);

      // Convert buffer back to Uint8Array and write file
      const buffer = Buffer.from(fileBuffer);
      fs.writeFileSync(filePath, buffer);

      console.log(`✅ File saved successfully: ${filePath}`);

      // Open file explorer and highlight the file
      shell.showItemInFolder(filePath);

      return {
        success: true,
        path: filePath,
      };
    } catch (error) {
      console.error("❌ Error saving file:", error);
      return {
        success: false,
        error: String(error),
      };
    }
  }
);

app.whenReady().then(createWindow);
