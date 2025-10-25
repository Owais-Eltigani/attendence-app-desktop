import { platform } from "os";

interface BleResult {
  success: boolean;
  error?: string;
  ssid: string;
  password: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let bleno: any = null;
let isAdvertising = false;

// Lazy load bleno to avoid import errors on unsupported platforms
async function getBleno() {
  if (!bleno) {
    try {
      // @abandonware/bleno works on Linux, macOS, and Windows
      bleno = await import("@abandonware/bleno");
    } catch (error) {
      throw new Error(`Bleno not installed. Run: pnpm add @abandonware/bleno`);
    }
  }
  return bleno;
}

export const createBluetoothBeacon = async (
  ssid: string,
  password: string
): Promise<BleResult> => {
  const os = platform();

  try {
    const blenoModule = await getBleno();
    // Handle both default and named exports
    const bleno = blenoModule.default || blenoModule;
    const Characteristic = bleno.Characteristic;
    const Descriptor = bleno.Descriptor;
    const PrimaryService = bleno.PrimaryService;

    // Service UUID for WiFi credentials
    const SERVICE_UUID = "123e4567-e89b-12d3-a456-426614174000";
    const SSID_CHARACTERISTIC_UUID = "123e4567-e89b-12d3-a456-426614174001";
    const PASSWORD_CHARACTERISTIC_UUID = "123e4567-e89b-12d3-a456-426614174002";

    console.log(`📡 Broadcasting WiFi credentials via BLE:`);
    console.log(`   SSID: "${ssid}"`);
    console.log(`   Password: "${password}"`);

    // Create characteristics for SSID and Password
    const SSIDCharacteristic = new Characteristic({
      uuid: SSID_CHARACTERISTIC_UUID,
      properties: ["read"],
      descriptors: [
        new Descriptor({
          uuid: "2901",
          value: Buffer.from("WiFi SSID"),
        }),
      ],
      onReadRequest: (
        offset: number,
        callback: (result: number, data?: Buffer) => void
      ) => {
        const data = Buffer.from(ssid, "utf-8");
        console.log(`📱 Device reading SSID characteristic`);
        console.log(`   String: "${ssid}"`);
        console.log(`   Hex: 0x${data.toString("hex").toUpperCase()}`);
        console.log(`   Bytes: [${Array.from(data).join(", ")}]`);
        callback(bleno.Characteristic.RESULT_SUCCESS, data.slice(offset));
      },
    });

    const PasswordCharacteristic = new Characteristic({
      uuid: PASSWORD_CHARACTERISTIC_UUID,
      properties: ["read"],
      descriptors: [
        new Descriptor({
          uuid: "2901",
          value: Buffer.from("WiFi Password"),
        }),
      ],
      onReadRequest: (
        offset: number,
        callback: (result: number, data?: Buffer) => void
      ) => {
        const data = Buffer.from(password, "utf-8");
        console.log(`📱 Device reading Password characteristic`);
        console.log(`   String: "${password}"`);
        console.log(`   Hex: 0x${data.toString("hex").toUpperCase()}`);
        console.log(`   Bytes: [${Array.from(data).join(", ")}]`);
        callback(bleno.Characteristic.RESULT_SUCCESS, data.slice(offset));
      },
    });

    // Create primary service
    const WiFiCredentialsService = new PrimaryService({
      uuid: SERVICE_UUID,
      characteristics: [SSIDCharacteristic, PasswordCharacteristic],
    });

    return new Promise((resolve, reject) => {
      // Handle state changes
      bleno.on("stateChange", (state: string) => {
        console.log(`📡 Bluetooth state: ${state}`);

        if (state === "poweredOn") {
          // Start advertising
          bleno.startAdvertising(
            "AttendanceApp",
            [SERVICE_UUID],
            (error: Error) => {
              if (error) {
                console.error("❌ BLE advertising error:", error);
                reject({
                  success: false,
                  error: `Failed to start advertising: ${error.message}`,
                  ssid,
                  password,
                });
              } else {
                console.log("✅ BLE advertising started");
              }
            }
          );
        } else if (state === "unsupported") {
          reject({
            success: false,
            error: "BLE not supported on this device",
            ssid,
            password,
          });
        } else {
          console.warn(`⚠️ BLE state: ${state}`);
        }
      });

      // Handle advertising start
      bleno.on("advertisingStart", (error: Error) => {
        if (error) {
          console.error("❌ Advertising start error:", error);
          reject({
            success: false,
            error: `Advertising failed: ${error.message}`,
            ssid,
            password,
          });
        } else {
          console.log("🎯 Advertising started, setting up services...");

          bleno.setServices([WiFiCredentialsService], (error: Error) => {
            if (error) {
              console.error("❌ Service setup error:", error);
              reject({
                success: false,
                error: `Service setup failed: ${error.message}`,
                ssid,
                password,
              });
            } else {
              isAdvertising = true;
              console.log("✅ BLE beacon active!");
              console.log(`📡 Broadcasting: SSID="${ssid}"`);
              console.log(`🔐 Service UUID: ${SERVICE_UUID}`);

              resolve({
                success: true,
                ssid,
                password,
              });
            }
          });
        }
      });

      // Handle accept/disconnect events
      bleno.on("accept", (clientAddress: string) => {
        console.log(`📱 Device connected: ${clientAddress}`);
      });

      bleno.on("disconnect", (clientAddress: string) => {
        console.log(`📴 Device disconnected: ${clientAddress}`);
      });

      // Timeout after 10 seconds if nothing happens
      setTimeout(() => {
        if (!isAdvertising) {
          reject({
            success: false,
            error: "BLE advertising timeout - check Bluetooth is enabled",
            ssid,
            password,
          });
        }
      }, 10000);
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ BLE setup failed:", errorMessage);

    return {
      success: false,
      error: `BLE failed on ${os}: ${errorMessage}`,
      ssid,
      password,
    };
  }
};

// Stop BLE advertising
export const stopBluetoothBeacon = async (): Promise<void> => {
  try {
    if (bleno && isAdvertising) {
      const blenoModule = await getBleno();
      const blenoInstance = blenoModule.default || blenoModule;
      blenoInstance.stopAdvertising();
      blenoInstance.disconnect();
      isAdvertising = false;
      console.log("🛑 BLE advertising stopped");
    }
  } catch (error) {
    console.error("Error stopping BLE:", error);
  }
};
