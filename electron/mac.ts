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

    // Show simplified instructions
    const buttons = ["Copy SSID", "Copy Password", "Done"];

    await new Promise((resolve) => setTimeout(resolve, 1700));

    // Keep showing dialog until user clicks "Done"
    let userDone = false;
    while (!userDone) {
      const result = await dialog.showMessageBox({
        type: "info",
        title: "Hotspot Setup Ready",
        message: "Ready to Create Hotspot",
        detail: `
📶 NETWORK DETAILS (Mobile-Optimized):
SSID: ${ssid}
Password: ${password}

IMPORTANT SETUP STEPS:
1. Select "Internet Sharing" in the window that opened
2. Choose your internet source (Ad Hoc)
3. Check "Wi-Fi" in the "To computers using" list
4. Click "Wi-Fi Options..." button and set:
   Network Name: ${ssid} (copy with button below)
   Security: WPA2 Personal (recommended)
   Password: ${password} (copy with button below)
   Channel: 11
5. Enable "Internet Sharing" checkbox
6. After submitting all attendance, remember to disable Internet Sharing to reconnect to Wi-Fi.

`,
        buttons,
      });

      // Handle button clicks
      if (result.response === 0) {
        // Copy SSID
        clipboard.writeText(ssid);
        await dialog.showMessageBox({
          type: "info",
          title: "Copied!",
          message: "SSID Copied to Clipboard",
          detail: `SSID: ${ssid}\n\nPaste this in the "Network Name" field.`,
          buttons: ["OK"],
        });
      } else if (result.response === 1) {
        // Copy Password
        clipboard.writeText(password);
        await dialog.showMessageBox({
          type: "info",
          title: "Copied!",
          message: "Password Copied to Clipboard",
          detail: `Password: ${password}\n\nPaste this in the "Password" field.`,
          buttons: ["OK"],
        });
      } else {
        // Done button clicked
        userDone = true;
      }
    }

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
