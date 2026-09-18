import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SyncStatusProps } from "@/lib/types/model/sync-status";

export default function SyncStatus({
  online = true,
  pendingSales = 0,
  lastSynced = "11:46 PM",
}: SyncStatusProps) {
  const upToDate = online && pendingSales === 0;

  return (
    <Card className="gap-0 rounded-2xl border border-rose-200 bg-rose-50 shadow-none">
      <CardHeader className="px-5 pb-4">
        <CardTitle className="text-lg font-bold text-slate-800">
          Sync Status
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 px-5">
        <dl className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-500">Connection</dt>

            <dd
              className={`flex items-center gap-2 font-semibold ${
                online ? "text-rose-800" : "text-slate-500"
              }`}
            >
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full bg-current"
              />

              {online ? "Online" : "Offline"}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-500">Waiting to sync</dt>

            <dd className="font-semibold text-slate-800">
              {pendingSales} {pendingSales === 1 ? "sale" : "sales"}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-500">Last synced</dt>

            <dd className="font-semibold text-slate-800">{lastSynced}</dd>
          </div>
        </dl>

        <div
          role="status"
          className="rounded-2xl bg-brand px-4 py-5 text-center font-bold text-white"
        >
          {upToDate
            ? "Everything is up to date."
            : online
              ? `${pendingSales} sales waiting to sync.`
              : "Offline. Sales will sync when connected."}
        </div>
      </CardContent>
    </Card>
  );
}
