import http from "http";
import os from "os";

interface StudentData {
  name: string;
  enrollmentNo: string;
  sessionId: string;
  submittedAt?: string;
}

let attendanceServer: http.Server | null = null;
let attendanceData: StudentData[] = [];

// Get local IP address
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const address of iface) {
      console.log("🚀 ~ getLocalIPAddress ~ address:", address);
      // Skip internal and non-IPv4
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }

  return "192.168.137.1"; // Default hotspot IP
}

// Start server to receive attendance
export function startAttendanceServer(sessionId: string, port = 8080) {
  console.log("Starting attendance server");
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

    // Health check endpoint - Test from phone browser
    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Attendance Server</title>
            <style>
              body { 
                font-family: Arial; 
                text-align: center; 
                padding: 50px;
                background: #f0f0f0;
              }
              .card {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                max-width: 400px;
                margin: 0 auto;
              }
              h1 { color: #4CAF50; }
              .status { font-size: 48px; margin: 20px 0; }
              .info { color: #666; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Server Online</h1>
              <p class="info">Attendance server is running</p>
              <p class="info"><strong>Session ID:</strong> ${sessionId}</p>
              <p class="info"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #999;">
                POST to /submit-attendance to record attendance
              </p>
            </div>
          </body>
        </html>
      `);
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
    // const ip = getLocalIPAddress();
    const ip = "192.168.137.1";
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📡 Attendance Server Started`);
    console.log(`${"=".repeat(60)}`);
    console.log(`🌐 Server URL: http://${ip}:${port}`);
    console.log(`📱 Test in phone browser: http://${ip}:${port}`);
    console.log(`📋 Session ID: ${sessionId}`);
    console.log(`${"=".repeat(60)}\n`);
  });

  return {
    ip: "192.168.137.1",
    port,
  };
}

export function stopAttendanceServer() {
  if (attendanceServer) {
    attendanceServer.close();
    attendanceServer = null;
    console.log("📡 Attendance server stopped");
  }
}

export function getAttendanceData() {
  return attendanceData;
}
