import { exec } from "child_process";
import { promisify } from "util";
const execPromise = promisify(exec);

export async function createHotspotLinux(ssid: string, password: string) {
  try {
    // Check if NetworkManager is available
    await execPromise("which nmcli");

    // Delete existing hotspot connection if exists
    try {
      await execPromise(`nmcli connection delete "${ssid}"`);
    } catch (e) {
      // Connection might not exist, ignore
    }

    // Create new hotspot
    const createCmd = `nmcli device wifi hotspot ifname wlan0 ssid "${ssid}" password "${password}"`;
    await execPromise(createCmd);

    console.log("✅ Linux hotspot created");

    return {
      success: true,
      platform: "linux",
      ssid,
      message: "Hotspot started successfully",
    };
  } catch (error) {
    console.error("❌ Linux hotspot error:", error);
    return {
      success: false,
      platform: "linux",
      // @ts-expect-error suppressing ts error for error.message
      error: error.message,
    };
  }
}

export async function stopHotspotLinux() {
  try {
    // Turn off hotspot
    await execPromise("nmcli device disconnect wlan0");
    console.log("✅ Linux hotspot stopped");
  } catch (error) {
    console.error("Error stopping Linux hotspot:", error);
  }
}
