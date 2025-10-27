import { attendanceRecord } from "@/types";
import { platform } from "os";
import { createHotspotMyPublicWifi } from "./win";
import { createHotspotLinux } from "./linux";
import { createHotspotMac } from "./mac";
import { BrowserWindow } from "electron";
import { startAttendanceServer } from "./attendanceServer";
import { createBluetoothBeacon } from "./mac-linux-bluetooth-beacon";

export async function createHotspot({
  semester,
  section,
  subjectName,
  classroomNo,
}: attendanceRecord) {
  console.log(
    `🚀 ~ createHotspot ~ ${{ semester, section, subjectName, classroomNo }} `
  );

  // Generate shorter, mobile-friendly SSID (max 15 chars)
  let timestamp = Date.now().toString().slice(-4); // Last 4 digits only
  const password = `${classroomNo.toUpperCase()[0]}CL${classroomNo
    .toUpperCase()
    .slice(1, 6)}A${timestamp}SS`;

  //? session to be shared with students to identify their attendance.
  const sessionId = `${classroomNo.toUpperCase().slice(1, 6)}${section
    .toUpperCase()
    .slice(0, 3)}${classroomNo.toUpperCase()[0]}`;

  await new Promise((resolve) => setTimeout(resolve, 10));
  timestamp = Date.now().toString().slice(-8); // Last 8 digits only
  const ssid = `${timestamp}SSID${section.toUpperCase().slice(0, 3)}`;

  // Send credentials to the focused renderer window (if any)
  const focused =
    BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
  if (focused) {
    focused.webContents.send("hotspot-credentials", { ssid, password });
  } else {
    console.warn("No renderer window available to send hotspot credentials");
  }

  //
  console.log({ sessionId });

  // Start BLE advertising for all platforms (runs in parallel)
  console.log("📡 Starting BLE beacon...");
  createBluetoothBeacon(ssid, password)
    .then((result) => {
      if (result.success) {
        console.log("✅ BLE beacon broadcasting WiFi credentials");
      } else {
        console.warn("⚠️ BLE beacon failed:", result.error);
        console.log("📶 WiFi hotspot still available for manual connection");
      }
    })
    .catch((error) => {
      console.error("❌ BLE beacon error:", error);
    });

  switch (platform()) {
    case "win32":
      console.log("calling windows hotspot\n");

      //? in windows start the webserver before launching myPublicWifi.
      startAttendanceServer(sessionId);
      await createHotspotMyPublicWifi(ssid, password);
      break;

    case "linux":
      await createHotspotLinux(ssid, password);
      startAttendanceServer(sessionId);
      break;

    case "darwin":
      await createBluetoothBeacon(ssid, password);
      await startAttendanceServer(sessionId);
      await createHotspotMac(ssid, password);
      break;

    default:
      console.log("Unsupported platform for hotspot creation");
      break;
  }
}
