"use client";

import { Suspense, useState } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

import NumPad, { PinDots } from "@/components/custom/common/numpad";

import { DeviceStatusCard } from "@/components/custom/common/device-status-card";
import { StockAlertsCard } from "@/components/custom/common/stock-alerts-card";
import CustomButton from "@/components/custom/common/custom-button";
import BackButton from "@/components/custom/common/back-button";
import AvatarInitials from "@/components/custom/common/avatar-initials";
import { staffs } from "@/lib/types/model/staffs";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function StaffPinPage() {
  return (
    <Suspense>
      <StaffPin />
    </Suspense>
  );
}

function StaffPin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [pin, setPin] = useState("");

  const staffId = Number(searchParams.get("staffId"));
  const staff = staffs.find((item) => item.id === staffId);

  if (!staff) notFound();

  const handlePinChange = (nextPin: string) => {
    const sixDigitPin = nextPin.slice(0, 6);
    setPin(sixDigitPin);

    if (sixDigitPin.length === 6) {
      // Later, verify the PIN here.
      console.log("Entered PIN:", { staffId: staff.id, pin: sixDigitPin });
    }
  };
  const handleContinue = () => {
    if (pin.length !== 6) return;

    // Verify the PIN here later.
    router.push("/pos/open-shift");
  };

  return (
    <main className="min-h-screen overflow-y-auto bg-rose-50 px-4 py-8 md:px-8">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        {/* PIN section */}
        <section className="relative rounded-2xl bg-white p-6 shadow-md sm:p-10 lg:min-h-[700px]">
          {/* Back button */}
          <BackButton
            href="/pos/select-staff"
            className="absolute left-6 top-6"
          />

          {/* PIN content */}
          <div className="mx-auto flex max-w-2xl flex-col items-center pt-8 sm:pt-10">
            <AvatarInitials
              name={staff.name}
              className="size-28 text-4xl sm:size-32"
            />

            <h1 className="mt-8 text-center text-2xl font-medium text-slate-600">
              {t("pin.title")}
            </h1>

            <div className="mt-8">
              <PinDots total={6} current={pin.length} />
            </div>
            <div className="mt-10 w-full">
              <NumPad
                value={pin}
                onChange={handlePinChange}
                mode="pin"
                maxPin={6}
                large
              />
            </div>
          </div>
          {/* Continue Button*/}
          <CustomButton
            label={t("pin.continue")}
            icon={ArrowRight}
            onClick={handleContinue}
            disabled={pin.length !== 6}
            className="mt-6 min-h-12 w-full rounded-xl bg-rose-600 text-base font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          />
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
