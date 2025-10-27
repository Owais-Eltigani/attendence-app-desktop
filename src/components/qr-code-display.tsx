"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy, QrCode } from "lucide-react";
import { sessionCreds } from "@/types";
import { Button } from "./ui/button";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface QRCodeDisplayProps {
  qrCodeData: sessionCreds | null | undefined;
  sessionStarted: boolean;
}

export function QRCodeDisplay({
  qrCodeData,
  sessionStarted,
}: QRCodeDisplayProps) {
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
    <TooltipProvider>
      <Card className="h-full ">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Session QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Code Frame */}
          <div className="bg-card border-2 border-dashed border-border rounded-lg flex items-center justify-center">
            {sessionStarted && ssid && password ? (
              <div className="text-center p-2">
                {/* Placeholder QR Code - In real app, use a QR code library */}
                <div className="   w-full rounded-lg flex  p-4">
                  <div className=" gap-4   flex px-2  space-x-20">
                    <div className="flex flex-col items-center p-2 rounded-lg">
                      <QRCodeSVG
                        value={`WIFI:T:WPA2;S:${ssid};P:${password};;`}
                        size={130}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"H"}
                      />
                      <p className="text-xs text-muted-foreground self-start mt-1">
                        Step 1 <span className="text-red-400">*</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="inline-block ml-1 h-3 w-3 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Scan to connect to session</p>
                          </TooltipContent>
                        </Tooltip>
                      </p>
                    </div>

                    <div className="flex flex-col items-center p-2 rounded-lg">
                      <QRCodeSVG
                        value={`WIFI:T:WPA2;S:${ssid};P:${password};;`}
                        size={130}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"H"}
                      />
                      <p className="text-xs text-muted-foreground self-start mt-1">
                        Step 2 <span className="text-red-400">*</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="inline-block ml-1 h-3 w-3 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Scan to launch asam</p>
                          </TooltipContent>
                        </Tooltip>
                      </p>
                    </div>
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
    </TooltipProvider>
  );
}
