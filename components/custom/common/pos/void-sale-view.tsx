"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import FilterSelect from "@/components/custom/common/back-office/filter-select";
import FormError from "@/components/custom/common/forms/form-error";
import ManagerApprovalStep from "@/components/custom/common/pos/manager-approval-step";
import TransactionDoneStep from "@/components/custom/common/pos/transaction-done-step";
import TransactionStepHeader from "@/components/custom/common/pos/transaction-step-header";
import VoidSelectStep from "@/components/custom/common/pos/void-select-step";
import { useTranslation } from "@/lib/i18n/use-translation";
import { approveAction, voidTillSaleAction } from "@/lib/pos/actions";
import { getReceiptNumber } from "@/lib/types/model/sales";
import type { VoidReason } from "@/lib/types/model/voids";

type Step = "select" | "approval" | "done";

type VoidSaleViewProps = {
  sale: { id: string; total: number; customerName: string | null };
  /** Active staff at this branch who can approve a void. */
  approvers: { id: number; name: string }[];
};

export default function VoidSaleView({ sale, approvers }: VoidSaleViewProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>("select");
  const [reason, setReason] = useState<VoidReason | null>(null);
  const [approverId, setApproverId] = useState(approvers[0] ? String(approvers[0].id) : "");
  const [managerPin, setManagerPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const receiptNumber = getReceiptNumber(sale.id);
  const customerLabel = sale.customerName ?? t("sell.walkIn");

  const handleKeepSale = () => {
    router.push(`/pos/sales-history/${sale.id}`);
  };

  const handleConfirmVoid = () => {
    if (!reason) return;
    setError(null);
    setStep("approval");
  };

  const handleApprove = () => {
    if (!reason || managerPin.length !== 6) return;
    setError(null);
    startTransition(async () => {
      const approval = await approveAction(Number(approverId), managerPin, "approve_void");
      setManagerPin("");
      if (!approval.ok) {
        if (approval.signedOut) router.push("/pos/select-staff");
        setError(approval.error);
        return;
      }
      // The till's reasons are backend void codes as-is; it has no free-text box.
      const result = await voidTillSaleAction(sale.id, reason, "", approval.data.token);
      if (result.ok) setStep("done");
      else if (result.signedOut) router.push("/pos/select-staff");
      else setError(result.error);
    });
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
          onPinChange={(pin) => {
            setError(null);
            setManagerPin(pin.slice(0, 6));
          }}
          onSubmit={handleApprove}
          pending={isPending}
          error={error}
        >
          {approvers.length > 0 ? (
            <FilterSelect
              aria-label="Approver"
              value={approverId}
              onChange={setApproverId}
              options={approvers.map((a) => ({ value: String(a.id), label: a.name }))}
            />
          ) : (
            <FormError message="Nobody at this branch can approve a void." />
          )}
        </ManagerApprovalStep>
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
