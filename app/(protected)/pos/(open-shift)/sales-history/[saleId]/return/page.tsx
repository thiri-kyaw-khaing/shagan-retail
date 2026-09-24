"use client";

import { use, useMemo, useState } from "react";
import { ChevronLeft, Banknote, WalletCards } from "lucide-react";
import { notFound, useRouter } from "next/navigation";

import BackButton from "@/components/custom/common/back-button";
import CustomButton from "@/components/custom/common/custom-button";
import Header from "@/components/custom/common/pos/header";
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
import { sales } from "@/lib/types/model/sales";
import { saleItems } from "@/lib/types/model/sale-items";
import { useTranslation } from "@/lib/i18n/use-translation";

type Step = "select" | "reason" | "confirm" | "approval" | "payout" | "done";

const PREVIOUS_STEP: Record<Step, Step | null> = {
  select: null,
  reason: "select",
  confirm: "reason",
  approval: "confirm",
  payout: "approval",
  done: null,
};

type ReturnItemsPageProps = {
  params: Promise<{ saleId: string }>;
};

export default function ReturnItemsPage({ params }: ReturnItemsPageProps) {
  const { saleId } = use(params);
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

  const sale = sales.find((item) => item.id === saleId);
  const items = useMemo(
    () => saleItems.filter((item) => item.saleId === saleId),
    [saleId],
  );

  const [step, setStep] = useState<Step>("select");
  const [returnQtyByItemId, setReturnQtyByItemId] = useState<
    Record<number, number>
  >({});
  const [condition, setCondition] = useState<ItemCondition | null>(null);
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState<RefundMethod | null>(null);
  const [managerPin, setManagerPin] = useState("");

  if (!sale) {
    notFound();
  }

  const customerLabel =
    sale.customerId === null
      ? t("sell.walkIn")
      : `Customer #${sale.customerId}`;

  const selectedLines = items
    .map((item) => ({ item, qty: returnQtyByItemId[item.id] ?? 0 }))
    .filter((line) => line.qty > 0);

  const selectedCount = selectedLines.reduce((sum, line) => sum + line.qty, 0);
  const refundTotal = selectedLines.reduce(
    (sum, line) => sum + line.item.unitPrice * line.qty,
    0,
  );

  const handleSelectContinue = () => {
    console.log(
      "Return - selected items:",
      selectedLines.map(({ item, qty }) => ({
        productId: item.productId,
        name: item.name,
        qty,
        lineTotal: item.unitPrice * qty,
      })),
      "refundTotal:",
      refundTotal,
    );
    setStep("reason");
  };

  const handleReasonContinue = () => {
    console.log("Return - condition & reason:", { condition, reason });
    setStep("confirm");
  };

  const handleRequestReturn = () => {
    if (!refundMethod) return;
    console.log(
      "Return - refund method:",
      refundMethod,
      "refundTotal:",
      refundTotal,
    );
    setStep("approval");
  };

  const handleApprove = () => {
    console.log("Return - manager PIN entered:", managerPin);
    // No approval/returns backend yet — the mock `returns` array isn't updated here.
    setStep(refundMethod === "cash" ? "payout" : "done");
  };

  const handleCompleteRefund = () => {
    console.log("Return - refund payout completed:", refundTotal);
    setStep("done");
  };

  const previousStep = PREVIOUS_STEP[step];

  return (
    <>
      {step !== "done" && (
        <Header
          title={STEP_TITLE[step]}
          right={
            <div className="text-right">
              <p className="text-sm font-medium text-white/90">
                {customerLabel}
              </p>
              <p className="text-lg font-bold">
                K {sale.total.toLocaleString()}
              </p>
            </div>
          }
        >
          {previousStep ? (
            <CustomButton
              icon={ChevronLeft}
              onClick={() => setStep(previousStep)}
              className="bg-transparent p-2 text-white hover:bg-transparent hover:opacity-70"
            />
          ) : (
            <BackButton
              href={`/pos/sales-history/${sale.id}`}
              className="text-white"
            />
          )}
        </Header>
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
          onPinChange={setManagerPin}
          onSubmit={handleApprove}
        />
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
