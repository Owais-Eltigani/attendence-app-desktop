"use client";

import { useState, useEffect } from "react";
import { SessionForm } from "./components/session-form";
import { QRCodeDisplay } from "./components/qr-code-display";
import { GraduationCap } from "lucide-react";
import { Button } from "./components/ui/button";
import { validateSessionattendanceRecord } from "./utils";
import { attendanceRecord, sessionCreds } from "./types";
import Tabular from "./components/tabular-data";

export default function StudentAttendanceApp() {
  const [sessionData, setSessionData] = useState<attendanceRecord>({
    subjectName: "OS",
    classroomNo: "B101",
    section: "B",
    semester: "7",
  });

  const [showAttendance, setShowAttendance] = useState(true);
  const [hotspotCreds, setHotspotCreds] = useState<sessionCreds | null>(null);

  const handleCreateSession = async () => {
    // check form not empty
    if (validateSessionattendanceRecord(sessionData)) {
      try {
        //@ts-expect-error. suppressing ts error for electronAPI
        await window.electronAPI.createHotspotSession(sessionData);
      } catch (error) {
        console.log("🚀 ~ handleCreateSession ~ error:", error);
      }

      //TODO implement the qrcode generation logic here
      setShowAttendance(true);
    }
  };

  // Listen for hotspot credentials sent from main process
  useEffect(() => {
    if (typeof window === "undefined" || !window.electronAPI) return;

    const unsubscribe = window.electronAPI.onHotspotCredentials((creds) => {
      console.log("Received hotspot creds:", creds);
      setHotspotCreds(creds);
    });

    return () => unsubscribe();
  }, []);

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
      <div className=" flex gap-4 mb-4">
        {/* Left Side - Session Form */}
        <div className="flex-1/2">
          <SessionForm
            sessionData={sessionData}
            setSessionData={setSessionData}
            onCreateSession={handleCreateSession}
          />
        </div>

        {/* Right Side - QR Code Display */}
        <div className="flex-1">
          <QRCodeDisplay qrCodeData={hotspotCreds} />
        </div>
      </div>

      {/* Bottom - Attendance Table */}
      {showAttendance && <Tabular />}
    </div>
  );
}
