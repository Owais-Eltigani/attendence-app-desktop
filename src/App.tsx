"use client";

import { useState } from "react";
import { SessionForm } from "./components/session-form";
import { QRCodeDisplay } from "./components/qr-code-display";
import { GraduationCap } from "lucide-react";
import { Button } from "./components/ui/button";
import { validateSessionattendanceRecord } from "./utils";
import { attendanceRecord } from "./types";

export default function StudentAttendanceApp() {
  const [sessionData, setSessionData] = useState<attendanceRecord>({
    subjectName: "",
    classroomNo: "",
    section: "",
    semester: "",
  });

  const [qrCodeData, setQrCodeData] = useState("");
  const [showAttendance, setShowAttendance] = useState(true);

  const handleCreateSession = async () => {
    // check form not empty
    if (validateSessionattendanceRecord(sessionData)) {
      const sessionId = `${sessionData.section}${
        sessionData.semester
      }-${Date.now()}`;

      try {
        //@ts-expect-error. suppressing ts error for electronAPI
        await window.electronAPI.createHotspotSession(sessionData);
      } catch (error) {
        console.log("🚀 ~ handleCreateSession ~ error:", error);
      }

      //TODO implement the qrcode generation logic here
      setQrCodeData(sessionId);
      setShowAttendance(true);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Student Attendance System
          </h1>
        </div>
        <p className="text-muted-foreground">
          Create and manage student sessions for attendance tracking
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="flex gap-6 mb-8">
        {/* Left Side - Session Form */}
        <div className="flex-1">
          <SessionForm
            sessionData={sessionData}
            setSessionData={setSessionData}
            onCreateSession={handleCreateSession}
          />
        </div>

        {/* Right Side - QR Code Display */}
        <div className="w-90">
          <QRCodeDisplay qrCodeData={qrCodeData} />
        </div>
      </div>

      {/* Bottom - Attendance Table */}
      {showAttendance && (
        <div className="bg-white border border-gray-200 rounded-lg h-96 shadow-sm">
          {/* Empty white box for future content */}
          <h1 className="text-lg font-semibold p-4 text-center text-gray-500">
            Students Names, Enr no. in Tabular Format
          </h1>
        </div>
      )}
      <div className="flex flex-row justify-end mt-4 space-x-2  p-2">
        <Button>Export as Excel</Button>
        <Button>Export as CSV</Button>
      </div>
    </div>
  );
}
