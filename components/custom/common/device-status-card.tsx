"use client";

import { useState } from "react";
import { Printer, ScanLine, RefreshCw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomButton from "@/components/custom/common/custom-button";

const initialDevices = [
  {
    name: "Receipt Printer",
    status: "Connected",
    lastChecked: "15:58",
    connected: true,
    icon: Printer,
  },
  {
    name: "Barcode Scanner",
    status: "Disconnected",
    lastChecked: "15:54",
    connected: false,
    icon: ScanLine,
  },
];

export function DeviceStatusCard() {
  const [devices, setDevices] = useState(initialDevices);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      // Temporary UI simulation.
      await new Promise((resolve) => setTimeout(resolve, 800));

      const checkedAt = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      setDevices((currentDevices) =>
        currentDevices.map((device) => ({
          ...device,
          lastChecked: checkedAt,
        })),
      );
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card className="rounded-2xl border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg text-slate-500">DEVICE STATUS</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {devices.map((device) => {
          const Icon = device.icon;

          return (
            <div
              key={device.name}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5"
            >
              <div className="flex min-w-0 items-center gap-4">
                <Icon
                  aria-hidden="true"
                  className="size-6 shrink-0 text-slate-600"
                />

                <div>
                  <p className="font-semibold text-slate-700">{device.name}</p>

                  <p className="mt-1 text-sm text-slate-400">
                    Last checked {device.lastChecked}
                  </p>
                </div>
              </div>

              <div
                className={`flex shrink-0 items-center gap-2 font-semibold ${
                  device.connected ? "text-emerald-600" : "text-rose-500"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="size-3 rounded-full bg-current"
                />

                <span>{device.status}</span>
              </div>
            </div>
          );
        })}

        <CustomButton
          label={refreshing ? "Checking devices…" : "Refresh Device Status"}
          icon={RefreshCw}
          onClick={handleRefresh}
          disabled={refreshing}
          className={`min-h-12 w-full rounded-xl border border-rose-200 bg-white font-semibold text-rose-800 shadow-none hover:bg-rose-50 ${
            refreshing ? "[&_svg]:animate-spin" : ""
          }`}
        />
      </CardContent>
    </Card>
  );
}
