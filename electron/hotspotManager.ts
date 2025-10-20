import { attendanceRecord } from "@/types";

export function createHotspot({
  semester,
  section,
  subjectName,
  classroomNo,
}: attendanceRecord) {
  console.log(
    `🚀 ~ createHotspot ~ ${{ semester, section, subjectName, classroomNo }} `
  );
}
