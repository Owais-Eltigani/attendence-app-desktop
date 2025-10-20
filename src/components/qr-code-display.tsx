"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import { sessionCreds } from "@/types";

interface QRCodeDisplayProps {
  qrCodeData: sessionCreds | null | undefined;
}

export function QRCodeDisplay({ qrCodeData }: QRCodeDisplayProps) {
  const ssid = qrCodeData?.ssid;
  const password = qrCodeData?.password;
  console.log("🚀 ~ QRCodeDisplay ~ ssid:", ssid, password);
  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          Session QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Frame */}
        <div className="bg-card border-2 border-dashed border-border rounded-lg flex items-center justify-center">
          {ssid && password ? (
            <div className="text-center p-4">
              {/* Placeholder QR Code - In real app, use a QR code library */}
              <div className="w-48 h-48 bg-foreground mx-auto mb-4 rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-8 gap-1 p-4">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 ${
                        Math.random() > 0.5 ? "bg-background" : "bg-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground break-all">
                Session ID: {ssid}
              </p>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">QR Code will appear here</p>
              <p className="text-xs">Create a session to generate</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {ssid && password && (
          <div className="p-3 bg-gray-50 border rounded">
            <p className="text-sm">
              SSID: <strong>{ssid}</strong>
            </p>
            <p className="text-sm">
              Password: <strong>{password}</strong>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
