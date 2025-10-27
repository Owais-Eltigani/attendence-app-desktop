import { shell, dialog, clipboard } from "electron";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

//! WIFI MANAGEMENT FUNCTIONS

export async function createHotspotMac(ssid: string, password: string) {
  try {
    const checkAdHoc = await execAsync(
      " networksetup -listallnetworkservices | grep AdHoc"
    );

    // Create AdHoc service if it doesn't exist
    if (!checkAdHoc.stdout.includes("AdHoc")) {
      const createAdHoc = [
        "sudo networksetup -createnetworkservice AdHoc lo0",
        "sudo networksetup -setmanual AdHoc 192.168.1.88 255.255.255.255",
      ];

      //? a trick to disconnect wifi is to set manual IP on a dummy interface
      for (const cmd of createAdHoc) {
        await execAsync(cmd);
        new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Copy SSID to clipboard
    clipboard.writeText(ssid);

    // Open Sharing preferences
    await shell.openExternal(
      "x-apple.systempreferences:com.apple.preferences.sharing"
    );

    // Wait a moment for window to open
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      ssid,
      password,
      message: "Hotspot setup instructions displayed",
    };
  } catch (error) {
    console.error("macOS auto-disconnect hotspot setup error:", error);
    return {
      success: false,
      ssid: "",
      password: "",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

//!
