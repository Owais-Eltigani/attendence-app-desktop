export interface attendanceRecord {
  subjectName: string;
  classroomNo: string;
  section: string;
  semester: string;
}

export interface studentData {
  name: string;
  enrollmentNo: string;
  timestamp: string;
}

export type sessionCreds = {
  ssid: string;
  password: string;
};
