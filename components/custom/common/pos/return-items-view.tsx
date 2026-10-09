"use client";

import { useState, useTransition } from "react";
import { Banknote, WalletCards } from "lucide-react";
import { useRouter } from "next/navigation";

import FilterSelect from "@/components/custom/common/back-office/filter-select";
import FormError from "@/components/custom/common/forms/form-error";
import TransactionStepHeader from "@/components/custom/common/pos/transaction-step-header";
import ReturnSelectStep from "@/components/custom/common/pos/return-select-step";
import ReturnReasonStep, {
  type ItemCondition,
} from "@/components/custom/common/pos/return-reason-step";
import ReturnConfirmStep, {
  type RefundMethod,
} from "@/components/custom/common/pos/return-confirm-step";
import ManagerApprovalStep from "@/components/custom/common/pos/manager-approval-step";
import AmountConfirmStep from "@/components/custom/common/pos/amount-confirm-step";
import TransactionDoneStep from "@/components/custom/common/pos/transaction-done-step";
import { decimalToNumber } from "@/lib/api/mappers";
import type { ApiReturnReason } from "@/lib/api/types";
import { useTranslation } from "@/lib/i18n/use-translation";
import { approveAction, createReturnAction } from "@/lib/pos/actions";
import type { SaleItem } from "@/lib/types/model/sale-items";

type Step = "select" | "reason" | "confirm" | "approval" | "payout" | "done";

const PREVIOUS_STEP: Record<Step, Step | null> = {
  select: null,
  reason: "select",
  confirm: "reason",
  approval: "confirm",
  payout: "approval",
  done: null,
};

/**
 * The backend's return reason code for each condition the till offers (the
 * condition itself is sent as-is). Only "sellable" goes back into stock;
 * the rest are written off in the ledger. The cashier's typed reason goes
 * along as the return's `explanation`.
 */
const RETURN_REASON: Record<ItemCondition, ApiReturnReason> = {
  sellable: "changed_mind",
  damaged: "defective",
  expired: "defective",
  other: "other",
};

type ReturnItemsViewProps = {
  sale: { id: string; total: number; customerName: string | null };
  items: SaleItem[];
  /** Active staff at this branch who can approve a return. */
  approvers: { id: number; name: string }[];
};

export default function ReturnItemsView({ sale, items, approvers }: ReturnItemsViewProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const STEP_TITLE: Record<Step, string> = {
    select: t("return.title"),
    reason: t("return.title"),
    confirm: t("return.title"),
    approval: t("return.managerApprovalTitle"),
    payout: t("return.refundPayoutTitle"),
    done: "",
  };

  const [step, setStep] = useState<Step>("select");
  const [returnQtyByItemId, setReturnQtyByItemId] = useState<
    Record<number, number>
  >({});
  const [condition, setCondition] = useState<ItemCondition | null>(null);
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState<RefundMethod | null>(null);
  const [approverId, setApproverId] = useState(approvers[0] ? String(approvers[0].id) : "");
  const [managerPin, setManagerPin] = useState("");
  // What the backend actually refunded - the payout uses this, not the estimate.
  const [refunded, setRefunded] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const customerLabel = sale.customerName ?? t("sell.walkIn");

  const selectedLines = items
    .map((item) => ({ item, qty: returnQtyByItemId[item.id] ?? 0 }))
    .filter((line) => line.qty > 0);
  const selectedCount = selectedLines.reduce((sum, line) => sum + line.qty, 0);
  const refundTotal = refunded ?? selectedLines.reduce(
    (sum, line) => sum + line.item.unitPrice * line.qty,
    0,
  );

  const handleSelectContinue = () => {
    setStep("reason");
  };

  const handleReasonContinue = () => {
    setStep("confirm");
  };

  const handleRequestReturn = () => {
    if (!refundMethod) return;
    setError(null);
    setStep("approval");
  };

  const handleApprove = () => {
    if (!condition || !refundMethod || managerPin.length !== 6) return;
    setError(null);
    startTransition(async () => {
      const approval = await approveAction(Number(approverId), managerPin, "approve_return");
      setManagerPin("");
      if (!approval.ok) {
        if (approval.signedOut) router.push("/pos/select-staff");
        setError(approval.error);
        return;
      }
      const result = await createReturnAction(
        {
          sale_id: sale.id,
          items: selectedLines.map((line) => ({
            sale_item_id: line.item.id,
            qty: line.qty,
            condition,
          })),
          reason_code: RETURN_REASON[condition],
          refund_method: refundMethod,
          explanation: reason.trim(),
        },
        approval.data.token,
      );
      if (!result.ok) {
        if (result.signedOut) router.push("/pos/select-staff");
        else setError(result.error);
        return;
      }
      setRefunded(decimalToNumber(result.data.refundTotal));
      setStep(refundMethod === "cash" ? "payout" : "done");
    });
  };

  const handleCompleteRefund = () => {
    setStep("done");
  };

  const previousStep = PREVIOUS_STEP[step];

  return (
    <>
      {step !== "done" && (
        <TransactionStepHeader
          title={STEP_TITLE[step]}
          customerLabel={customerLabel}
          total={sale.total}
          backHref={`/pos/sales-history/${sale.id}`}
          // Once the backend has recorded the return there's no going back.
          onBackStep={previousStep && refunded === null ? () => setStep(previousStep) : undefined}
        />
      )}

      {step === "select" && (
        <ReturnSelectStep
          items={items}
          returnQtyByItemId={returnQtyByItemId}
          onChangeQty={(itemId, qty) =>
            setReturnQtyByItemId((current) => ({ ...current, [itemId]: qty }))
          }
          refundTotal={refundTotal}
          canContinue={selectedLines.length > 0}
          onContinue={handleSelectContinue}
        />
      )}

      {step === "reason" && (
        <ReturnReasonStep
          selectedCount={selectedCount}
          refundTotal={refundTotal}
          condition={condition}
          onConditionChange={setCondition}
          reason={reason}
          onReasonChange={setReason}
          canContinue={condition !== null && reason.trim().length > 0}
          onContinue={handleReasonContinue}
        />
      )}

      {step === "confirm" && condition && (
        <ReturnConfirmStep
          selectedCount={selectedCount}
          condition={condition}
          refundTotal={refundTotal}
          refundMethod={refundMethod}
          onRefundMethodChange={setRefundMethod}
          onSubmit={handleRequestReturn}
        />
      )}

      {step === "approval" && (
        <ManagerApprovalStep
          title={t("return.managerApprovalRequired")}
          subtitle={`${t("return.approvingRefundPrefix")} K ${refundTotal.toLocaleString()}`}
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
            <FormError message="Nobody at this branch can approve a return." />
          )}
        </ManagerApprovalStep>
      )}

      {step === "payout" && (
        <AmountConfirmStep
          icon={Banknote}
          bannerIcon={WalletCards}
          title={t("return.refundDue")}
          amount={refundTotal}
          bannerText={t("return.cashDrawerOpened")}
          buttonLabel={t("return.completeRefund")}
          onComplete={handleCompleteRefund}
        />
      )}

      {step === "done" && refundMethod && (
        <TransactionDoneStep
          title={t("return.done")}
          message={`${t("return.processedPrefix")} ${selectedCount} ${selectedCount === 1 ? t("return.item") : t("return.items")} ${t("return.refundedViaSuffix")} ${refundMethod}`}
          buttonLabel={t("return.backToSalesHistory")}
          onBack={() => router.push("/pos/sales-history")}
        />
      )}
    </>
  );
}
