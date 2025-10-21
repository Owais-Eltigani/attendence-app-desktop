import { exec } from "child_process";
import { promisify } from "util";
const execPromise = promisify(exec);

async function getWifiInterface(): Promise<string> {
  try {
    // Get list of wifi devices
    const { stdout } = await execPromise("nmcli device status | grep wifi");
    const lines = stdout.trim().split("\n");

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length > 0 && parts[1] === "wifi") {
        return parts[0]; // Return the interface name
      }
    }

    throw new Error("No Wi-Fi device found");
  } catch (error) {
    throw new Error(
      "Failed to detect Wi-Fi interface. Please ensure you have a Wi-Fi adapter."
    );
  }
}

export async function createHotspotLinux(ssid: string, password: string) {
  console.log("from linux hotspot manager");
  try {
    // Check if NetworkManager is available
    await execPromise("which nmcli");

    // Detect Wi-Fi interface dynamically
    const wifiInterface = await getWifiInterface();
    console.log(`📡 Detected Wi-Fi interface: ${wifiInterface}`);

    // Delete existing hotspot connection if exists
    try {
      await execPromise(`nmcli connection delete "${ssid}"`);
    } catch (e) {
      // Connection might not exist, ignore
    }

    // Create new hotspot
    const createCmd = `nmcli device wifi hotspot ifname ${wifiInterface} ssid "${ssid}" password "${password}"`;
    await execPromise(createCmd);

    console.log("✅ Linux hotspot created");

    return {
      success: true,
      ssid,
      password,
      message: "Hotspot started successfully",
    };
  } catch (error) {
    console.error("❌ Linux hotspot error:", error);
    return {
      success: false,
      ssid: "",
      password: "",
      // @ts-expect-error suppressing ts error for error.message
      message: error.message,
    };
  }
}

export async function stopHotspotLinux() {
  try {
    // Detect Wi-Fi interface dynamically
    const wifiInterface = await getWifiInterface();

    // Turn off hotspot
    await execPromise(`nmcli device disconnect ${wifiInterface}`);
    console.log("✅ Linux hotspot stopped");
  } catch (error) {
    console.error("Error stopping Linux hotspot:", error);
  }
}
