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
export function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const address of iface) {
      // Skip internal and non-IPv4
      if (address.family === "IPv4" && !address.internal) {
        console.log("🚀 ~ getLocalIPAddress ~ address:", address);
        return address.address;
      }
    }
  }

  return "192.168.137.1"; // Default hotspot IP
}

// Start server to receive attendance
export async function startAttendanceServer(sessionId: string, port = 8080) {
  console.log("Starting attendance server");
  attendanceData = [];

  attendanceServer = http.createServer((req, res) => {
    // Log all incoming requests
    console.log(`🌐 ${req.method} ${req.url} from ${req.socket.remoteAddress}`);

    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      console.log("✓ CORS preflight request");
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
      console.log("\n📥 Incoming attendance submission...");
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
        console.log("📦 Receiving data chunk...");
      });

      req.on("end", () => {
        console.log("✅ Data received completely");
        try {
          const studentData = JSON.parse(body);
          console.log("🔍 Parsed student data:", studentData);

          // Validate session ID
          if (studentData.sessionId !== sessionId) {
            console.log(
              `❌ Invalid session ID. Expected: ${sessionId}, Got: ${studentData.sessionId}`
            );
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid session" }));
            return;
          }

          // Add timestamp
          studentData.submittedAt = new Date().toISOString();

          // Store attendance
          attendanceData.push(studentData);

          console.log("\n" + "=".repeat(60));
          console.log("✅ ATTENDANCE RECORDED!");
          console.log("=".repeat(60));
          console.log(`👤 Name: ${studentData.name}`);
          console.log(`🎓 Enrollment: ${studentData.enrollmentNo}`);
          console.log(`📋 Session: ${studentData.sessionId}`);
          console.log(`⏰ Time: ${studentData.submittedAt}`);
          console.log(`📊 Total Records: ${attendanceData.length}`);
          console.log("=".repeat(60) + "\n");

          res.writeHead(200);
          res.end(
            JSON.stringify({ success: true, message: "Attendance recorded" })
          );
        } catch (error) {
          console.error("❌ Error parsing attendance data:", error);
          console.error("Raw body:", body);
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Invalid data" }));
        }
      });
    } else {
      console.log(`⚠️  Unhandled request: ${req.method} ${req.url}`);
      res.writeHead(404);
      res.end();
    }
  });

  //! listen on all interfaces.
  attendanceServer.listen(port, "0.0.0.0", () => {
    // const ip = "192.168.137.1";
    const ip = getLocalIPAddress();
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📡 Attendance Server Started`);
    console.log(`${"=".repeat(60)}`);
    console.log(`🌐 Server URL: http://${ip}:${port}`);
    console.log(`📱 Test in phone browser: http://${ip}:${port}`);
    console.log(`📋 Session ID: ${sessionId}`);
    console.log(`${"=".repeat(60)}\n`);
  });

  console.log("server 100% running");

  return {
    // ip: "192.168.137.1",
    ip: getLocalIPAddress(),
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
