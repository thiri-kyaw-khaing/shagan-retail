import { DeviceStatusCard } from "@/components/custom/common/device-status-card";
import { StockAlertsCard } from "@/components/custom/common/stock-alerts-card";
import React from "react";

function StaffPin() {
  return (
    <main className="min-h-screen bg-rose-50 px-4 py-8 md:px-8">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        {/* PIN section */}
        <section className="rounded-2xl bg-white p-6 shadow-md md:p-10">
          {/* Back button, staff avatar, PIN dots and keypad */}
        </section>

        {/* Right-side cards */}
        <aside className="grid grid-cols-1 gap-5">
          <StockAlertsCard />
          <DeviceStatusCard />
        </aside>
      </div>
    </main>
  );
}

export default StaffPin;
