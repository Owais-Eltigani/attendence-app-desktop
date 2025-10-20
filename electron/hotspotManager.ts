import { attendanceRecord } from "@/types";
import { platform } from "os";
import { createHotspotWindows } from "./win";
import { createHotspotLinux } from "./linux";
import { createHotspotMac, createHotspotMacAutoDisconnect } from "./mac";

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

  const ssid = `SESSION-${section.toUpperCase()}-${semester}${Date.now()}`;
  const password = `@${Date.now()}class#${classroomNo.toUpperCase()}!!`;
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
      //   TODO: testing second mac solution
      // await createHotspotMac2(ssid, password);
      // TODO: using auto-disconnect version
      await createHotspotMacAutoDisconnect(ssid, password);
      break;

    default:
      console.log("Unsupported platform for hotspot creation");
      return;
      break;
  }
}
