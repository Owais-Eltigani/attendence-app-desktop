import { shell, dialog, clipboard } from "electron";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

//! WIFI MANAGEMENT FUNCTIONS

async function disconnectFromWiFi(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Get current Wi-Fi network name
    const { stdout: currentNetwork } = await execAsync(
      "networksetup -getairportnetwork en0"
    );

    if (
      currentNetwork.includes("You are not associated with an AirPort network")
    ) {
      return { success: true, message: "No Wi-Fi connection to disconnect" };
    }

    // Extract network name
    const networkName = currentNetwork
      .replace("Current Wi-Fi Network: ", "")
      .trim();

    // Disconnect from Wi-Fi
    await execAsync("sudo networksetup -setairportpower en0 off");
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
    await execAsync("sudo networksetup -setairportpower en0 on");

    return {
      success: true,
      message: `Disconnected from "${networkName}"`,
    };
  } catch (error) {
    console.error("WiFi disconnect error:", error);
    return {
      success: false,
      message: `Failed to disconnect: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

//! SOLUTION 3 - AUTO DISCONNECT

export async function createHotspotMac(ssid: string, password: string) {
  try {
    // Always disconnect from Wi-Fi first
    console.log("🔌 Disconnecting from Wi-Fi...");
    const disconnectResult = await disconnectFromWiFi();

    if (disconnectResult.success) {
      console.log("✅ Wi-Fi disconnected:", disconnectResult.message);
    } else {
      console.warn("⚠️ Wi-Fi disconnect failed:", disconnectResult.message);
    }

    // Copy SSID to clipboard
    clipboard.writeText(ssid);

    // Open Sharing preferences
    shell.openExternal(
      "x-apple.systempreferences:com.apple.preferences.sharing"
    );

    // Wait a moment for window to open

    // Show simplified instructions
    const buttons = ["Copy SSID", "Copy Password", "Done"];

    await new Promise((resolve) => setTimeout(resolve, 1700));
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
      buttons,
    });

    // Handle button clicks
    if (result.response === 0) {
      clipboard.writeText(ssid);
    } else if (result.response === 1) {
      clipboard.writeText(password);
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
