import { app, clipboard, dialog, shell, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import os, { platform } from "os";
import { exec } from "child_process";
import util, { promisify } from "util";
import path from "path";
import fs from "fs";
import http from "http";
import { platform as platform$1 } from "node:os";
const execPromise$1 = util.promisify(exec);
async function createHotspotMyPublicWifi(ssid, password) {
  const isInstalled = isMyPublicWiFiInstalled();
  if (!isInstalled) {
    let installerPath = "";
    const isProduction = app.isPackaged;
    if (isProduction) {
      installerPath = path.join(process.resourcesPath, "MyPublicWiFi.exe");
      //! check production path
    } else {
      installerPath = path.join(
        app.getAppPath(),
        "resources",
        "MyPublicWiFi.exe"
      );
    }
    await execPromise$1(`${installerPath}`);
    return {
      success: false,
      message: "MyPublicWiFi is not installed",
      ssid: "",
      password: ""
    };
  }
  return await launchMyPublicWiFi(ssid, password);
}
function isMyPublicWiFiInstalled() {
  const myPublicWiFiPath = getMyPublicWiFiPath();
  return fs.existsSync(myPublicWiFiPath || "");
}
async function launchMyPublicWiFi(ssid, password) {
  try {
    const myPublicWiFiPath = getMyPublicWiFiPath();
    if (!fs.existsSync(myPublicWiFiPath || "")) {
      return {
        success: false,
        error: "MyPublicWiFi not found",
        needsInstall: true
      };
    }
    clipboard.writeText(ssid);
    await showMyPublicWiFiInstructions(ssid, password);
    await execPromise$1(`"${myPublicWiFiPath}"`);
    return {
      success: true,
      ssid,
      password,
      message: "MyPublicWiFi launched successfully"
    };
  } catch (error) {
    console.error("Error launching MyPublicWiFi:", error);
    return {
      success: false,
      message: error.message,
      ssid: "",
      password: ""
    };
  }
}
async function showMyPublicWiFiInstructions(ssid, password) {
  const result = await dialog.showMessageBox({
    type: "info",
    title: "📶 Setup MyPublicWiFi",
    message: "MyPublicWiFi has been launched",
    detail: `
follow the steps in the helper tool MyPublicWiFi window:

Network Name (SSID): ${ssid}
Password: ${password}

Steps:
1. Copy Network SSID from ASAM and paste it in MyPublicWifi SSID 
2. Copy Password from ASAM and paste it in MyPublicWifi Password 
2. Click "Set up and Start Hotspot" button
3. Wait for "Hotspot is running" message
    `,
    buttons: ["Copy SSID", "Copy Password", "Done"]
  });
  if (result.response === 0) {
    clipboard.writeText(ssid);
    await dialog.showMessageBox({
      type: "info",
      title: "Copied!",
      message: "SSID copied to clipboard",
      buttons: ["OK"]
    });
  } else if (result.response === 1) {
    clipboard.writeText(password);
    await dialog.showMessageBox({
      type: "info",
      title: "Copied!",
      message: "Password copied to clipboard",
      buttons: ["OK"]
    });
  }
  return { success: true };
}
function getMyPublicWiFiPath() {
  const possiblePaths = [
    // Common installation paths
    "C:\\Program Files\\MyPublicWiFi\\MyPublicWiFi.exe",
    "C:\\Program Files (x86)\\MyPublicWiFi\\MyPublicWiFi.exe",
    path.join(process.env.PROGRAMFILES, "MyPublicWiFi", "MyPublicWiFi.exe"),
    path.join(
      process.env["PROGRAMFILES(X86)"],
      "MyPublicWiFi",
      "MyPublicWiFi.exe"
    )
  ];
  for (const execPath of possiblePaths) {
    if (fs.existsSync(execPath)) {
      return execPath;
    }
  }
  return null;
}
async function stopMyPublicWiFi() {
  try {
    console.log("trying to kill myPublic Wifi");
    await execPromise$1("taskkill /F /IM MyPublicWiFi.exe");
    return { success: true };
  } catch (error) {
    console.error("Error stopping MyPublicWiFi:", error);
    return { success: false, error: error.message };
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
      ssid,
      password,
      message: "Hotspot started successfully"
    };
  } catch (error) {
    console.error("❌ Linux hotspot error:", error);
    return {
      success: false,
      ssid: "",
      password: "",
      // @ts-expect-error suppressing ts error for error.message
      message: error.message
    };
  }
}
async function stopHotspotLinux() {
  try {
    const wifiInterface = await getWifiInterface();
    await execPromise(`nmcli device disconnect ${wifiInterface}`);
    console.log("✅ Linux hotspot stopped");
  } catch (error) {
    console.error("Error stopping Linux hotspot:", error);
  }
}
const execAsync = promisify(exec);
//! WIFI MANAGEMENT FUNCTIONS
async function createHotspotMac(ssid, password) {
  try {
    const checkAdHoc = await execAsync(
      " networksetup -listallnetworkservices | grep AdHoc"
    );
    if (!checkAdHoc.stdout.includes("AdHoc")) {
      const createAdHoc = [
        "sudo networksetup -createnetworkservice AdHoc lo0",
        "sudo networksetup -setmanual AdHoc 192.168.1.88 255.255.255.255"
      ];
      for (const cmd of createAdHoc) {
        await execAsync(cmd);
        new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    clipboard.writeText(ssid);
    await shell.openExternal(
      "x-apple.systempreferences:com.apple.preferences.sharing"
    );
    const buttons = ["Copy SSID", "Copy Password", "Done"];
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      ssid,
      password,
      message: "Hotspot setup instructions displayed"
    };
  } catch (error) {
    console.error("macOS auto-disconnect hotspot setup error:", error);
    return {
      success: false,
      ssid: "",
      password: "",
      message: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
//!
let attendanceServer = null;
let attendanceData = [];
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;
    for (const address of iface) {
      if (address.family === "IPv4" && !address.internal) {
        console.log("🚀 ~ getLocalIPAddress ~ address:", address);
        return address.address;
      }
    }
  }
  return "192.168.137.1";
}
async function startAttendanceServer(sessionId, port = 8080) {
  console.log("Starting attendance server");
  attendanceData = [];
  attendanceServer = http.createServer((req, res) => {
    console.log(`🌐 ${req.method} ${req.url} from ${req.socket.remoteAddress}`);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      console.log("✓ CORS preflight request");
      res.writeHead(200);
      res.end();
      return;
    }
    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Attendance Server</title>
            <style>
              body { 
                font-family: Arial; 
                text-align: center; 
                padding: 50px;
                background: #f0f0f0;
              }
              .card {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                max-width: 400px;
                margin: 0 auto;
              }
              h1 { color: #4CAF50; }
              .status { font-size: 48px; margin: 20px 0; }
              .info { color: #666; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Server Online</h1>
              <p class="info">Attendance server is running</p>
              <p class="info"><strong>Session ID:</strong> ${sessionId}</p>
              <p class="info"><strong>Time:</strong> ${(/* @__PURE__ */ new Date()).toLocaleString()}</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #999;">
                POST to /submit-attendance to record attendance
              </p>
            </div>
          </body>
        </html>
      `);
      return;
    }
    if (req.method === "POST" && req.url === "/submit-attendance") {
      console.log("\n📥 Incoming attendance submission...");
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
        console.log("📦 Receiving data chunk...");
      });
      req.on("end", () => {
        console.log("✅ Data received completely");
        try {
          const studentData = JSON.parse(body);
          console.log("🔍 Parsed student data:", studentData);
          if (studentData.sessionId !== sessionId) {
            console.log(
              `❌ Invalid session ID. Expected: ${sessionId}, Got: ${studentData.sessionId}`
            );
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid session" }));
            return;
          }
          studentData.submittedAt = (/* @__PURE__ */ new Date()).toISOString();
          attendanceData.push(studentData);
          console.log("\n" + "=".repeat(60));
          console.log("✅ ATTENDANCE RECORDED!");
          console.log("=".repeat(60));
          console.log(`👤 Name: ${studentData.name}`);
          console.log(`🎓 Enrollment: ${studentData.enrollmentNo}`);
          console.log(`📋 Session: ${studentData.sessionId}`);
          console.log(`⏰ Time: ${studentData.submittedAt}`);
          console.log(`📊 Total Records: ${attendanceData.length}`);
          console.log("=".repeat(60) + "\n");
          res.writeHead(200);
          res.end(
            JSON.stringify({ success: true, message: "Attendance recorded" })
          );
        } catch (error) {
          console.error("❌ Error parsing attendance data:", error);
          console.error("Raw body:", body);
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Invalid data" }));
        }
      });
    } else {
      console.log(`⚠️  Unhandled request: ${req.method} ${req.url}`);
      res.writeHead(404);
      res.end();
    }
  });
  //! listen on all interfaces.
  attendanceServer.listen(port, "0.0.0.0", () => {
    const ip = getLocalIPAddress();
    console.log(`
${"=".repeat(60)}`);
    console.log(`📡 Attendance Server Started`);
    console.log(`${"=".repeat(60)}`);
    console.log(`🌐 Server URL: http://${ip}:${port}`);
    console.log(`📱 Test in phone browser: http://${ip}:${port}`);
    console.log(`📋 Session ID: ${sessionId}`);
    console.log(`${"=".repeat(60)}
`);
  });
  console.log("server 100% running");
  return {
    // ip: "192.168.137.1",
    ip: getLocalIPAddress(),
    port
  };
}
function stopAttendanceServer() {
  if (attendanceServer) {
    attendanceServer.close();
    attendanceServer = null;
    console.log("📡 Attendance server stopped");
  }
}
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
  const focused = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
  if (focused) {
    focused.webContents.send("hotspot-credentials", { ssid, password });
  } else {
    console.warn("No renderer window available to send hotspot credentials");
  }
  console.log({ ssid, password });
  switch (platform()) {
    case "win32":
      console.log("calling windows hotspot\n");
      startAttendanceServer(
        `${section.toUpperCase().slice(0, 3)}-${timestamp}`
      );
      await createHotspotMyPublicWifi(ssid, password);
      break;
    case "linux":
      await createHotspotLinux(ssid, password);
      startAttendanceServer(
        `${section.toUpperCase().slice(0, 3)}-${timestamp}`
      );
      break;
    case "darwin":
      await startAttendanceServer(
        `${section.toUpperCase().slice(0, 3)}-${timestamp}`
      );
      await createHotspotMac(ssid, password);
      break;
    default:
      console.log("Unsupported platform for hotspot creation");
      break;
  }
}
const require2 = createRequire(import.meta.url);
const __dirname = path$1.dirname(fileURLToPath(import.meta.url));
if (process.platform === "win32") {
  const { execSync } = require2("child_process");
  const isAdmin = () => {
    try {
      execSync("net session 2>nul", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  };
  const isDev = process.argv.includes("--no-sandbox");
  if (!isDev && !isAdmin()) {
    console.log(
      "🔐 App needs admin privileges. Please restart with admin rights."
    );
    const { dialog: dialog2 } = require2("electron");
    app.whenReady().then(() => {
      dialog2.showErrorBox(
        "Administrator Rights Required",
        "This app requires administrator privileges to create hotspots.\n\nPlease right-click the app and select 'Run as administrator'."
      );
      app.quit();
    });
  } else if (!isDev) {
    console.log("✅ Running with administrator privileges");
  }
}
process.env.APP_ROOT = path$1.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    height: 1e3,
    width: 1e3,
    resizable: false,
    webPreferences: {
      preload: path$1.join(__dirname, "preload.mjs")
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
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", async () => {
  if (process.platform !== "darwin") {
    if (platform$1() === "win32") {
      await stopMyPublicWiFi();
    }
    if (platform$1() === "linux") {
      await stopHotspotLinux();
    }
    app.quit();
    win = null;
  }
  stopAttendanceServer();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.handle("createSession", async (_event, data) => {
  console.log("🚀 ~ ipcMain.handle ~ data:", data);
  return await createHotspot(data);
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
