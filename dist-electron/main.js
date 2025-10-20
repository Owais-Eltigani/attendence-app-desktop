import { clipboard, shell, dialog, app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { platform } from "os";
import { exec } from "child_process";
import { promisify } from "util";
const execPromise$1 = promisify(exec);
async function createHotspotWindows(ssid, password) {
  try {
    await execPromise$1("netsh wlan stop hostednetwork");
    const setupCmd = `netsh wlan set hostednetwork mode=allow ssid="${ssid}" key="${password}"`;
    await execPromise$1(setupCmd);
    const startCmd = "netsh wlan start hostednetwork";
    const result = await execPromise$1(startCmd);
    console.log("✅ Hotspot created:", result.stdout);
    return {
      success: true,
      ssid,
      message: "Hotspot started successfully"
    };
  } catch (error) {
    console.error("❌ Error creating hotspot:", error);
    if (error.message.includes("hosted network")) {
      return {
        success: false,
        message: "Your WiFi adapter does not support hosted networks"
      };
    }
    throw error;
  }
}
const execPromise = promisify(exec);
async function getWifiInterface() {
  try {
    const { stdout } = await execPromise("nmcli device status | grep wifi");
    const lines = stdout.trim().split("\n");
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length > 0 && parts[1] === "wifi") {
        return parts[0];
      }
    }
    throw new Error("No Wi-Fi device found");
  } catch (error) {
    throw new Error(
      "Failed to detect Wi-Fi interface. Please ensure you have a Wi-Fi adapter."
    );
  }
}
async function createHotspotLinux(ssid, password) {
  console.log("from linux hotspot manager");
  try {
    await execPromise("which nmcli");
    const wifiInterface = await getWifiInterface();
    console.log(`📡 Detected Wi-Fi interface: ${wifiInterface}`);
    try {
      await execPromise(`nmcli connection delete "${ssid}"`);
    } catch (e) {
    }
    const createCmd = `nmcli device wifi hotspot ifname ${wifiInterface} ssid "${ssid}" password "${password}"`;
    await execPromise(createCmd);
    console.log("✅ Linux hotspot created");
    return {
      success: true,
      platform: "linux",
      ssid,
      interface: wifiInterface,
      message: "Hotspot started successfully"
    };
  } catch (error) {
    console.error("❌ Linux hotspot error:", error);
    return {
      success: false,
      platform: "linux",
      // @ts-expect-error suppressing ts error for error.message
      error: error.message
    };
  }
}
const execAsync = promisify(exec);
//! WIFI MANAGEMENT FUNCTIONS
async function disconnectFromWiFi() {
  try {
    const { stdout: currentNetwork } = await execAsync(
      "networksetup -getairportnetwork en0"
    );
    if (currentNetwork.includes("You are not associated with an AirPort network")) {
      return { success: true, message: "No Wi-Fi connection to disconnect" };
    }
    const networkName = currentNetwork.replace("Current Wi-Fi Network: ", "").trim();
    await execAsync("sudo networksetup -setairportpower en0 off");
    await new Promise((resolve) => setTimeout(resolve, 2e3));
    await execAsync("sudo networksetup -setairportpower en0 on");
    return {
      success: true,
      message: `Disconnected from "${networkName}"`
    };
  } catch (error) {
    console.error("WiFi disconnect error:", error);
    return {
      success: false,
      message: `Failed to disconnect: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
}
//! SOLUTION 3 - AUTO DISCONNECT
async function createHotspotMac(ssid, password) {
  try {
    console.log("🔌 Disconnecting from Wi-Fi...");
    const disconnectResult = await disconnectFromWiFi();
    if (disconnectResult.success) {
      console.log("✅ Wi-Fi disconnected:", disconnectResult.message);
    } else {
      console.warn("⚠️ Wi-Fi disconnect failed:", disconnectResult.message);
    }
    clipboard.writeText(ssid);
    shell.openExternal(
      "x-apple.systempreferences:com.apple.preferences.sharing"
    );
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const buttons = ["Copy SSID", "Copy Password", "Done"];
    const result = await dialog.showMessageBox({
      type: "info",
      title: "Hotspot Setup Ready",
      message: "Wi-Fi Disconnected - Ready to Create Hotspot",
      detail: `
📶 NETWORK DETAILS (Mobile-Optimized):
SSID: ${ssid}
Password: ${password}

✅ Wi-Fi has been disconnected automatically

🔧 CRITICAL SETUP STEPS:
1. Select "Internet Sharing" in the window that opened
2. Choose your internet source (Ethernet/USB recommended)
3. Check "Wi-Fi" in the "To computers using" list
4. Click "Wi-Fi Options..." button and set:
   📋 Network Name: ${ssid} (copy with button below)
   🔒 Security: WPA2 Personal (recommended)
   📋 Password: ${password} (copy with button below)
   📡 Channel: Auto or 6 (avoid 11)
5. ✅ Enable "Internet Sharing" checkbox

⚠️ TROUBLESHOOTING:
- If network doesn't appear: Try Channel 1, 6, or 11
- Wait 30 seconds after enabling for network to broadcast
- Make sure "Internet Sharing" checkbox is checked
      `,
      buttons
    });
    if (result.response === 0) {
      clipboard.writeText(ssid);
    } else if (result.response === 1) {
      clipboard.writeText(password);
    }
    return {
      success: true,
      platform: "mac",
      manualSetup: true,
      ssid,
      autoDisconnected: true
    };
  } catch (error) {
    console.error("macOS auto-disconnect hotspot setup error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
//!
async function createHotspot({
  semester,
  section,
  subjectName,
  classroomNo
}) {
  console.log(
    `🚀 ~ createHotspot ~ ${{ semester, section, subjectName, classroomNo }} `
  );
  const timestamp = Date.now().toString().slice(-4);
  const ssid = `ATT-${section.toUpperCase().slice(0, 3)}-${timestamp}`;
  const password = `CLASS${classroomNo.toUpperCase().slice(0, 6)}${timestamp}`;
  console.log({ ssid, password });
  switch (platform()) {
    case "win32":
      await createHotspotWindows(ssid, password);
      break;
    case "linux":
      await createHotspotLinux(ssid, password);
      break;
    case "darwin":
      await createHotspotMac(ssid, password);
      break;
    default:
      console.log("Unsupported platform for hotspot creation");
      return;
  }
}
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    height: 1e3,
    width: 1e3,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
      // Use plugin 'vite-electron-plugin' to enable nodeIntegration
      // More info:
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.handle("createSession", async (_event, data) => {
  console.log("🚀 ~ ipcMain.handle ~ data:", data);
  await createHotspot(data);
  return "data has been received in main process";
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
