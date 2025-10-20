import { attendanceRecord } from "@/types";
import { platform } from "os";
import { createHotspotWindows } from "./win";
import { createHotspotLinux } from "./linux";
import { createHotspotMac } from "./mac";

export async function createHotspot({
  semester,
  section,
  subjectName,
  classroomNo,
}: attendanceRecord) {
  console.log(
    `🚀 ~ createHotspot ~ ${{ semester, section, subjectName, classroomNo }} `
  );

  //   check platform and call respective hotspot creation logic

  // Generate shorter, mobile-friendly SSID (max 15 chars)
  const timestamp = Date.now().toString().slice(-4); // Last 4 digits only
  const ssid = `ATT-${section.toUpperCase().slice(0, 3)}-${timestamp}`;
  const password = `CLASS${classroomNo.toUpperCase().slice(0, 6)}${timestamp}`;

  console.log({ ssid, password });

  switch (platform()) {
    case "win32":
      await createHotspotWindows(ssid, password);

      break;

    case "linux":
      await createHotspotLinux(ssid, password);
      break;

    case "darwin":
      //   await createHotspotMac(ssid, password);
      //   TODO: using auto-disconnect version
      await createHotspotMac(ssid, password);
      break;

    default:
      console.log("Unsupported platform for hotspot creation");
      return;
      break;
  }
}
