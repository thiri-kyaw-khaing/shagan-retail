"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import BackButton from "@/components/custom/common/back-button";
import ManagerApprovalStep from "@/components/custom/common/pos/manager-approval-step";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function ManagerPinPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [pin, setPin] = useState("");

  const handleSubmit = () => {
    console.log("Manager PIN entered:", pin);
    // Verify the PIN here later.
    router.push("/manager");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-rose-50 px-4 py-8 md:px-8">
      <div className="relative w-full max-w-md">
        <BackButton href="/portal" className="absolute left-6 top-6" />

        <ManagerApprovalStep
          title={t("managerPin.title")}
          subtitle={t("managerPin.subtitle")}
          pin={pin}
          onPinChange={setPin}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
