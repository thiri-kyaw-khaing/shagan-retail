"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import NumPad, { PinDots } from "@/components/custom/common/numpad";
import { DeviceStatusCard } from "@/components/custom/common/device-status-card";
import { StockAlertsCard, type StockAlert } from "@/components/custom/common/stock-alerts-card";
import CustomButton from "@/components/custom/common/custom-button";
import BackButton from "@/components/custom/common/back-button";
import AvatarInitials from "@/components/custom/common/avatar-initials";
import FormError from "@/components/custom/common/forms/form-error";
import { useTranslation } from "@/lib/i18n/use-translation";
import { signInStaffAction } from "@/lib/pos/actions";

type StaffPinPadProps = {
  staff: { id: number; name: string };
  alerts: StockAlert[];
};

export default function StaffPinPad({ staff, alerts }: StaffPinPadProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePinChange = (nextPin: string) => {
    setError(null);
    setPin(nextPin.slice(0, 6));
  };

  const handleContinue = () => {
    if (pin.length !== 6) return;
    startTransition(async () => {
      const result = await signInStaffAction(staff.id, pin);
      if (result.ok) {
        router.push(result.data.next);
      } else {
        setError(result.error);
        setPin("");
      }
    });
  };

  return (
    <main className="min-h-screen overflow-y-auto bg-rose-50 px-4 py-8 md:px-8">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <section className="relative rounded-2xl bg-white p-6 shadow-md sm:p-10 lg:min-h-[700px]">
          <BackButton href="/pos/select-staff" className="absolute left-6 top-6" />

          <div className="mx-auto flex max-w-2xl flex-col items-center pt-8 sm:pt-10">
            <AvatarInitials name={staff.name} className="size-28 text-4xl sm:size-32" />
            <p className="mt-4 text-lg font-semibold text-ink">{staff.name}</p>

            <h1 className="mt-4 text-center text-2xl font-medium text-slate-600">
              {t("pin.title")}
            </h1>

            <div className="mt-8">
              <PinDots total={6} current={pin.length} />
            </div>
            <div className="mt-6 w-full max-w-md">
              <FormError message={error} />
            </div>
            <div className="mt-4 w-full">
              <NumPad
                value={pin}
                onChange={handlePinChange}
                mode="pin"
                maxPin={6}
                large
                disabled={isPending}
              />
            </div>
          </div>
          <CustomButton
            label={isPending ? "Checking..." : t("pin.continue")}
            icon={ArrowRight}
            onClick={handleContinue}
            disabled={pin.length !== 6 || isPending}
            className="mt-6 min-h-12 w-full rounded-xl bg-rose-600 text-base font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          />
        </section>

        <aside className="grid grid-cols-1 gap-5">
          <StockAlertsCard alerts={alerts} />
          <DeviceStatusCard />
        </aside>
      </div>
    </main>
  );
}
