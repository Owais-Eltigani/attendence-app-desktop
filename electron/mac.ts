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

async function checkWiFiStatus(): Promise<string> {
  try {
    const { stdout } = await execAsync("networksetup -getairportnetwork en0");
    return stdout.trim();
  } catch (error) {
    return "Unable to check Wi-Fi status";
  }
}

//!

export async function createHotspotMac(ssid: string, password: string) {
  try {
    // open Sharing preferences
    await shell.openExternal(
      "x-apple.systempreferences:com.apple.preferences.sharing"
    );

    // Step 3: Show simplified instructions
    const result = await dialog.showMessageBox({
      type: "info",
      title: "Enable WiFi Hotspot",
      message: "Complete these 3 simple steps:",
      detail: `
Your WiFi settings are ready:
  Network Name: ${ssid}
  Password: ${password}

In the window that just opened:

1. Click "Internet Sharing" on the left
2. Check "Wi-Fi" in the list
3. Click "Wi-Fi Options" and verify/enter:
   - Network Name: ${ssid}
   - Password: ${password}
4. Enable the "Internet Sharing" checkbox

Click "Ready" when done.
      `,
      buttons: ["Ready", "Cancel"],
    });

    return {
      success: result.response === 0,
      platform: "mac",
      manualSetup: true,
      ssid,
    };
  } catch (error) {
    console.error("macOS setup error:", error);
    //@ts-expect-error suppressing ts error for error.message
    return { success: false, error: error.message };
  }
}

//!

//! SOLUTION 2

export async function createHotspotMac2(ssid: string, password: string) {
  try {
    // Check current Wi-Fi status
    const wifiStatus = await checkWiFiStatus();
    console.log("Current WiFi status:", wifiStatus);

    // Ask user if they want to disconnect from current Wi-Fi
    if (
      !wifiStatus.includes("You are not associated with an AirPort network")
    ) {
      const disconnectChoice = await dialog.showMessageBox({
        type: "question",
        title: "Wi-Fi Connection Detected",
        message: "Disconnect from current Wi-Fi?",
        detail: `${wifiStatus}\n\nTo create a hotspot, you need to disconnect from current Wi-Fi. Would you like to disconnect automatically?`,
        buttons: ["Yes, Disconnect", "No, Manual Setup", "Cancel"],
        defaultId: 0,
      });

      if (disconnectChoice.response === 2) {
        return { success: false, cancelled: true };
      }

      if (disconnectChoice.response === 0) {
        // Disconnect from Wi-Fi
        const disconnectResult = await disconnectFromWiFi();

        if (disconnectResult.success) {
          await dialog.showMessageBox({
            type: "info",
            title: "Wi-Fi Disconnected",
            message: disconnectResult.message,
            detail: "Now proceeding to set up hotspot...",
            buttons: ["Continue"],
          });
        } else {
          await dialog.showMessageBox({
            type: "warning",
            title: "Disconnect Failed",
            message: disconnectResult.message,
            detail: "You may need to disconnect manually from Wi-Fi settings.",
            buttons: ["Continue Anyway"],
          });
        }
      }
    }

    // Copy SSID to clipboard
    clipboard.writeText(ssid);

    // Open Sharing preferences
    shell.openExternal(
      "x-apple.systempreferences:com.apple.preferences.sharing"
    );

    // Wait a moment for window to open
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Show instructions with copy buttons and connection warning
    const buttons = ["Copy SSID", "Copy Password", "Done"];

    const result = await dialog.showMessageBox({
      type: "info",
      title: "Enable Internet Sharing",
      message: "Quick Setup",
      detail: `
SSID: ${ssid}
Password: ${password}

⚠️  IMPORTANT: If you don't see Wi-Fi options:
• You may be connected via Wi-Fi hotspot (iPhone/mobile)
• Try connecting via Ethernet or USB tethering instead
• Or temporarily disconnect from Wi-Fi hotspot

Instructions:
1. Select "Internet Sharing"
2. Choose your internet source (Ethernet/USB/etc.)
3. Click "Wi-Fi Options..." (if available)
4. Click "Copy SSID" below, paste in Network Name
5. Click "Copy Password" below, paste in Password field
6. Enable "Internet Sharing" checkbox

Tip: Click buttons below to copy values quickly.
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
      platform: "mac",
      manualSetup: true,
      ssid,
    };
  } catch (error) {
    console.error("macOS hotspot setup error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

//!

//! SOLUTION 3 - AUTO DISCONNECT

export async function createHotspotMacAutoDisconnect(
  ssid: string,
  password: string
) {
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
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Show simplified instructions
    const buttons = ["Copy SSID", "Copy Password", "Done"];

    const result = await dialog.showMessageBox({
      type: "info",
      title: "Hotspot Setup Ready",
      message: "Wi-Fi Disconnected - Ready to Create Hotspot",
      detail: `
SSID: ${ssid}
Password: ${password}

✅ Wi-Fi has been disconnected automatically

Instructions:
1. Select "Internet Sharing" in the window that opened
2. Choose your internet source (Ethernet recommended)
3. Check "Wi-Fi" in the "To computers using" list
4. Click "Wi-Fi Options..." button
5. Use buttons below to copy SSID and Password
6. Enable "Internet Sharing" checkbox

Your Mac will now share internet via Wi-Fi hotspot.
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
      platform: "mac",
      manualSetup: true,
      ssid,
      autoDisconnected: true,
    };
  } catch (error) {
    console.error("macOS auto-disconnect hotspot setup error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

//!
