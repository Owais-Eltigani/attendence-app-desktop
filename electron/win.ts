import { exec } from "child_process";
import { promisify } from "util";
const execPromise = promisify(exec);

export async function createHotspotWindows(ssid: string, password: string) {
  try {
    // Stop any existing hotspot
    await execPromise("netsh wlan stop hostednetwork");

    // Configure hotspot
    const setupCmd = `netsh wlan set hostednetwork mode=allow ssid="${ssid}" key="${password}"`;
    await execPromise(setupCmd);

    // Start hotspot
    const startCmd = "netsh wlan start hostednetwork";
    const result = await execPromise(startCmd);

    console.log("✅ Hotspot created:", result.stdout);

    return {
      success: true,
      ssid,
      message: "Hotspot started successfully",
    };
  } catch (error) {
    console.error("❌ Error creating hotspot:", error);

    // Check if WiFi adapter supports hosted network
    // @ts-expect-error suppressing ts error for error.message
    if (error.message.includes("hosted network")) {
      return {
        success: false,
        message: "Your WiFi adapter does not support hosted networks",
      };
    }

    throw error;
  }
}

export async function stopHotspotWindows() {
  try {
    await execPromise("netsh wlan stop hostednetwork");
    console.log("✅ Hotspot stopped");
  } catch (error) {
    console.error("Error stopping hotspot:", error);
  }
}

export async function getHotspotStatusWindows() {
  try {
    const { stdout } = await execPromise("netsh wlan show hostednetwork");
    console.log("Hotspot status:", stdout);
    return stdout;
  } catch (error) {
    console.error("Error getting status:", error);
    return null;
  }
}
