"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy, QrCode } from "lucide-react";
import { sessionCreds } from "@/types";
import { Button } from "./ui/button";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  qrCodeData: sessionCreds | null | undefined;
}

export function QRCodeDisplay({ qrCodeData }: QRCodeDisplayProps) {
  const ssid = qrCodeData?.ssid;
  const password = qrCodeData?.password;

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

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
            <div className="text-center p-2">
              {/* Placeholder QR Code - In real app, use a QR code library */}
              <div className="w-44 h-44 bg-foreground mx-auto mb-4 rounded-lg flex items-center justify-center">
                <div className=" gap-1 ">
                  <QRCodeSVG
                    value={`WIFI:T:WPA2;S:${ssid};P:${password};;`}
                    size={130}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"H"}
                    includeMargin={false}
                  />
                </div>
              </div>
            </div>
          ) : (
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
          )}
        </div>
        <p className="text-xs text-muted-foreground break-all">
          Session ID: {ssid || ""}
        </p>

        {/* Action Buttons */}
        {
          <div className="space-y-2">
            {/* SSID */}
            <div className="flex items-center justify-between p-3 bg-gray-50 border rounded">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">SSID</p>
                <p className="text-sm font-medium">{ssid || ""}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={!ssid}
                onClick={() => ssid && handleCopy(ssid, "ssid")}
                className="ml-2"
              >
                {copiedField === "ssid" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {/* Password */}
            <div className="flex items-center justify-between p-3 bg-gray-50 border rounded">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Password</p>
                <p className="text-sm font-medium">{password || ""}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={!password}
                onClick={() => password && handleCopy(password, "password")}
                className="ml-2"
              >
                {copiedField === "password" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        }
      </CardContent>
    </Card>
  );
}
