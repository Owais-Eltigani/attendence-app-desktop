// main.js
import { app, clipboard, dialog } from "electron";
import { exec } from "child_process";
import util from "util";
import path from "path";
import fs from "fs";

const execPromise = util.promisify(exec);

export async function createHotspotMyPublicWifi(
  ssid: string,
  password: string
) {
  // check if MyPublicWiFi is installed
  const isInstalled = isMyPublicWiFiInstalled();

  if (!isInstalled) {
    // path.join(app.getAppPath(), "resources", "MyPublicWiFi.exe");
    let installerPath = "";

    const isProduction = app.isPackaged;

    if (isProduction) {
      // Production: bundled in resources
      installerPath = path.join(process.resourcesPath, "MyPublicWiFi.exe"); //! check production path
    } else {
      // Development: in resources folder
      installerPath = path.join(
        app.getAppPath(),
        "resources",
        "MyPublicWiFi.exe"
      );
    }

    await execPromise(`${installerPath}`);

    return {
      success: false,
      message: "MyPublicWiFi is not installed",
      ssid,
      password,
    };
  }
  // launch MyPublicWiFi with ssid and password
  await launchMyPublicWiFi(ssid, password);
}

// Check if MyPublicWiFi is installed
function isMyPublicWiFiInstalled() {
  const myPublicWiFiPath = getMyPublicWiFiPath();
  return fs.existsSync(myPublicWiFiPath || "");
}

// Launch MyPublicWiFi
async function launchMyPublicWiFi(ssid: string, password: string) {
  try {
    const myPublicWiFiPath = getMyPublicWiFiPath();

    if (!fs.existsSync(myPublicWiFiPath || "")) {
      return {
        success: false,
        error: "MyPublicWiFi not found",
        needsInstall: true,
      };
    }

    // Launch MyPublicWiFi executable
    clipboard.writeText(ssid);
    await showMyPublicWiFiInstructions(ssid, password);
    await execPromise(`"${myPublicWiFiPath}"`);

    return {
      success: true,
      ssid,
      password,
      message: "MyPublicWiFi launched successfully",
    };
  } catch (error) {
    console.error("Error launching MyPublicWiFi:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Show instructions dialog for MyPublicWiFi setup
async function showMyPublicWiFiInstructions(ssid: string, password: string) {
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
    buttons: ["Copy SSID", "Copy Password", "Done"],
  });

  // Handle button clicks
  if (result.response === 0) {
    // Copy SSID
    clipboard.writeText(ssid);

    // Show copied confirmation
    await dialog.showMessageBox({
      type: "info",
      title: "Copied!",
      message: "SSID copied to clipboard",
      buttons: ["OK"],
    });
  } else if (result.response === 1) {
    // Copy Password
    clipboard.writeText(password);

    // Show copied confirmation
    await dialog.showMessageBox({
      type: "info",
      title: "Copied!",
      message: "Password copied to clipboard",
      buttons: ["OK"],
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
    ),
  ];

  // Find first existing path
  for (const execPath of possiblePaths) {
    if (fs.existsSync(execPath)) {
      return execPath;
    }
  }

  return null;
}

// Stop MyPublicWiFi
export async function stopMyPublicWiFi() {
  try {
    await execPromise("taskkill /F /IM MyPublicWiFi.exe"); //? use sudo.exe()
    return { success: true };
  } catch (error) {
    console.error("Error stopping MyPublicWiFi:", error);
    return { success: false, error: error.message };
  }
}
