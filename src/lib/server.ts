// main.js
import { studentData } from "@/types";
import http from "http";
import os from "os";

let attendanceServer = null;
let attendanceData: studentData[] = [];

// Get local IP address
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      //
      console.log("🚀 ~ getLocalIPAddress ~ iface:", iface);
      // Skip internal and non-IPv4
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }

  return "192.168.137.1"; // Default hotspot IP
}

// Start server to receive attendance
export function startAttendanceServer(sessionId: string, port = 8080) {
  attendanceData = [];

  attendanceServer = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method === "POST" && req.url === "/submit-attendance") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        try {
          const studentData = JSON.parse(body);

          // Validate session ID
          if (studentData.sessionId !== sessionId) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid session" }));
            return;
          }

          // Add timestamp
          studentData.submittedAt = new Date().toISOString();

          // Store attendance
          attendanceData.push(studentData);

          console.log("Attendance received:", studentData);

          res.writeHead(200);
          res.end(
            JSON.stringify({ success: true, message: "Attendance recorded" })
          );
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Invalid data" }));
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  attendanceServer.listen(port, () => {
    const ip = getLocalIPAddress();
    console.log(`Attendance server running at http://${ip}:${port}`);
  });

  return {
    ip: getLocalIPAddress(),
    port,
  };
}

function stopAttendanceServer() {
  if (attendanceServer) {
    attendanceServer.close();
    attendanceServer = null;
  }
}

function getAttendanceData() {
  return attendanceData;
}
