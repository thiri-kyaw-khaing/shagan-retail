"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import BackButton from "@/components/custom/common/back-button";
import FilterSelect from "@/components/custom/common/back-office/filter-select";
import FormError from "@/components/custom/common/forms/form-error";
import ManagerApprovalStep from "@/components/custom/common/pos/manager-approval-step";
import { enterBackOfficeAction } from "@/lib/backoffice/actions";
import { useTranslation } from "@/lib/i18n/use-translation";

type ManagerPinViewProps = {
  /** Active staff at this till's branch whose role grants `access_backoffice`. */
  managers: { id: number; name: string }[];
};

export default function ManagerPinView({ managers }: ManagerPinViewProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [managerId, setManagerId] = useState(managers[0] ? String(managers[0].id) : "");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (pin.length !== 6 || !managerId) return;
    setError(null);
    startTransition(async () => {
      const result = await enterBackOfficeAction(Number(managerId), pin);
      setPin("");
      if (result.ok) router.push("/owner");
      else setError(result.error);
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-rose-50 px-4 py-8 md:px-8">
      <div className="relative w-full max-w-md">
        <BackButton href="/portal" className="absolute left-6 top-6" />

        <ManagerApprovalStep
          title={t("managerPin.title")}
          subtitle={t("managerPin.subtitle")}
          pin={pin}
          onPinChange={(next) => {
            setError(null);
            setPin(next.slice(0, 6));
          }}
          onSubmit={handleSubmit}
          pending={isPending}
          error={error}
        >
          {managers.length > 0 ? (
            <FilterSelect
              aria-label="Manager"
              value={managerId}
              onChange={setManagerId}
              options={managers.map((m) => ({ value: String(m.id), label: m.name }))}
            />
          ) : (
            <FormError message="Nobody at this branch can open the Back Office." />
          )}
        </ManagerApprovalStep>
      </div>
    </main>
  );
}
