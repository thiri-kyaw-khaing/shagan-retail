"use client";

import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";

import TransactionStepHeader from "@/components/custom/common/pos/transaction-step-header";
import VoidSelectStep from "@/components/custom/common/pos/void-select-step";
import ManagerApprovalStep from "@/components/custom/common/pos/manager-approval-step";
import TransactionDoneStep from "@/components/custom/common/pos/transaction-done-step";
import { sales, getReceiptNumber } from "@/lib/types/model/sales";
import type { VoidReason } from "@/lib/types/model/voids";
import { useTranslation } from "@/lib/i18n/use-translation";

type Step = "select" | "approval" | "done";

type VoidSalePageProps = {
  params: Promise<{ saleId: string }>;
};

export default function VoidSalePage({ params }: VoidSalePageProps) {
  const { saleId } = use(params);
  const router = useRouter();
  const { t } = useTranslation();

  const sale = sales.find((item) => item.id === saleId);
  const [step, setStep] = useState<Step>("select");
  const [reason, setReason] = useState<VoidReason | null>(null);
  const [managerPin, setManagerPin] = useState("");

  if (!sale) notFound();

  const receiptNumber = getReceiptNumber(sale.id);
  const customerLabel =
    sale.customerId === null
      ? t("sell.walkIn")
      : `Customer #${sale.customerId}`;

  const handleKeepSale = () => {
    router.push(`/pos/sales-history/${sale.id}`);
  };

  const handleConfirmVoid = () => {
    if (!reason) return;
    console.log("Void - reason selected:", reason);
    setStep("approval");
  };

  const handleApprove = () => {
    console.log("Void - manager PIN entered:", managerPin);
    // No approval/voids backend yet — the mock `voids` array isn't updated here.
    setStep("done");
  };

  return (
    <>
      {step !== "done" && (
        <TransactionStepHeader
          title={step === "select" ? t("void.title") : t("return.managerApprovalTitle")}
          customerLabel={customerLabel}
          total={sale.total}
          backHref={`/pos/sales-history/${sale.id}`}
          onBackStep={step === "approval" ? () => setStep("select") : undefined}
        />
      )}

      {step === "select" && (
        <VoidSelectStep
          receiptNumber={receiptNumber}
          customerLabel={customerLabel}
          total={sale.total}
          reason={reason}
          onReasonChange={setReason}
          onKeepSale={handleKeepSale}
          onConfirmVoid={handleConfirmVoid}
        />
      )}

      {step === "approval" && (
        <ManagerApprovalStep
          title={t("return.managerApprovalRequired")}
          subtitle={`${t("void.approvingVoidPrefix")} #${receiptNumber}`}
          pin={managerPin}
          onPinChange={setManagerPin}
          onSubmit={handleApprove}
        />
      )}

      {step === "done" && (
        <TransactionDoneStep
          title={t("return.done")}
          message={`${t("void.processedPrefix")} #${receiptNumber}`}
          buttonLabel={t("return.backToSalesHistory")}
          onBack={() => router.push("/pos/sales-history")}
        />
      )}
    </>
  );
}
