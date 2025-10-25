# Bluetooth Low Energy (BLE) WiFi Credential Broadcasting

## Overview

The attendance app now broadcasts WiFi credentials via **Bluetooth Low Energy (BLE)** alongside the traditional WiFi hotspot. This allows students' phones to automatically discover and connect to the classroom network.

## How It Works

### Teacher's Desktop App

1. When you create a session, the app simultaneously:

   - Creates a WiFi hotspot (existing feature)
   - Starts a BLE beacon broadcasting the same WiFi credentials

2. The BLE beacon advertises:
   - **Service UUID**: `123e4567-e89b-12d3-a456-426614174000`
   - **SSID Characteristic**: Contains the WiFi network name
   - **Password Characteristic**: Contains the WiFi password

### Student's Mobile App (Requirements)

Students need a mobile app that can:

1. Scan for BLE devices advertising the attendance service UUID
2. Connect to the BLE beacon
3. Read the SSID and Password characteristics
4. Automatically connect to the WiFi network
5. Submit attendance via HTTP POST to the server

## Platform Support

✅ **Windows** - Fully supported via @abandonware/bleno  
✅ **macOS** - Fully supported via @abandonware/bleno  
✅ **Linux** - Fully supported via @abandonware/bleno

## Technical Details

### BLE Service Structure

```
Service: AttendanceApp WiFi Credentials
UUID: 123e4567-e89b-12d3-a456-426614174000

├── Characteristic: SSID
│   UUID: 123e4567-e89b-12d3-a456-426614174001
│   Properties: READ
│   Value: WiFi network name (UTF-8 string)
│
└── Characteristic: Password
    UUID: 123e4567-e89b-12d3-a456-426614174002
    Properties: READ
    Value: WiFi password (UTF-8 string)
```

### Range

- **BLE Range**: ~10-20 meters (classroom-appropriate)
- **WiFi Range**: Standard WiFi range

## Student Mobile App Implementation

### React Native Example (iOS/Android)

```javascript
import { BleManager } from "react-native-ble-plx";

const SERVICE_UUID = "123e4567-e89b-12d3-a456-426614174000";
const SSID_UUID = "123e4567-e89b-12d3-a456-426614174001";
const PASSWORD_UUID = "123e4567-e89b-12d3-a456-426614174002";

const manager = new BleManager();

// Scan for attendance beacon
manager.startDeviceScan([SERVICE_UUID], null, async (error, device) => {
  if (error) {
    console.error("Scan error:", error);
    return;
  }

  if (device && device.name === "AttendanceApp") {
    manager.stopDeviceScan();

    // Connect to device
    const connected = await device.connect();
    await connected.discoverAllServicesAndCharacteristics();

    // Read SSID
    const ssidChar = await connected.readCharacteristicForService(
      SERVICE_UUID,
      SSID_UUID
    );
    const ssid = Buffer.from(ssidChar.value, "base64").toString("utf-8");

    // Read Password
    const pwdChar = await connected.readCharacteristicForService(
      SERVICE_UUID,
      PASSWORD_UUID
    );
    const password = Buffer.from(pwdChar.value, "base64").toString("utf-8");

    console.log(`Found WiFi: ${ssid} / ${password}`);

    // Disconnect
    await device.cancelConnection();

    // Connect to WiFi and submit attendance
    await connectToWiFi(ssid, password);
  }
});
```

### Flutter Example

```dart
import 'package:flutter_blue_plus/flutter_blue_plus.dart';

const SERVICE_UUID = '123e4567-e89b-12d3-a456-426614174000';
const SSID_UUID = '123e4567-e89b-12d3-a456-426614174001';
const PASSWORD_UUID = '123e4567-e89b-12d3-a456-426614174002';

void scanForAttendance() async {
  FlutterBluePlus.startScan(
    withServices: [Guid(SERVICE_UUID)],
    timeout: Duration(seconds: 4),
  );

  var subscription = FlutterBluePlus.scanResults.listen((results) async {
    for (ScanResult r in results) {
      if (r.device.advName == 'AttendanceApp') {
        await r.device.connect();

        List<BluetoothService> services = await r.device.discoverServices();

        for (BluetoothService service in services) {
          if (service.uuid.toString() == SERVICE_UUID) {
            for (BluetoothCharacteristic c in service.characteristics) {
              if (c.uuid.toString() == SSID_UUID) {
                List<int> ssidBytes = await c.read();
                String ssid = String.fromCharCodes(ssidBytes);
                print('SSID: $ssid');
              }

              if (c.uuid.toString() == PASSWORD_UUID) {
                List<int> pwdBytes = await c.read();
                String password = String.fromCharCodes(pwdBytes);
                print('Password: $password');
              }
            }
          }
        }

        await r.device.disconnect();
      }
    }
  });
}
```

## Troubleshooting

### Desktop App Issues

**BLE not starting:**

- Check that Bluetooth is enabled on your computer
- On Linux: User must be in `bluetooth` group
- On Windows: Ensure Bluetooth drivers are up to date
- Check console for error messages (look for 📡 emoji)

**Build errors:**

```bash
# If native modules fail to build
pnpm rebuild
# or
pnpm approve-builds
```

### Student App Issues

**Can't find beacon:**

- Ensure Bluetooth is enabled on phone
- Check phone has Location permissions (required for BLE scanning)
- Student must be within ~20m of teacher's laptop
- Wait 2-3 seconds after session creation

**Can read credentials but can't connect:**

- Some phones require manual WiFi connection
- Fallback: Display credentials on screen for manual entry

## Advantages of BLE

1. **Automatic Discovery** - Students don't need to manually search for WiFi
2. **Secure** - Credentials transmitted over short-range BLE only
3. **Battery Efficient** - BLE uses minimal power on mobile devices
4. **Fast** - Credential discovery happens in 1-2 seconds
5. **Fallback Available** - WiFi hotspot still works if BLE fails

## Security Considerations

- BLE range limited to classroom (~20m)
- Credentials are temporary (session-based)
- Connection still requires proper authentication to attendance server
- BLE doesn't replace WiFi hotspot, just enhances user experience

## Dependencies

- **Desktop**: `@abandonware/bleno` - Cross-platform BLE peripheral library
- **Mobile (React Native)**: `react-native-ble-plx`
- **Mobile (Flutter)**: `flutter_blue_plus`
- **Mobile (Native iOS)**: CoreBluetooth framework
- **Mobile (Native Android)**: Android BLE APIs

## Future Enhancements

- [ ] Add encryption to BLE characteristics
- [ ] Support for multiple simultaneous BLE connections
- [ ] BLE-only mode (no WiFi hotspot needed)
- [ ] Student app examples in repository
- [ ] Automatic WiFi connection on mobile apps
