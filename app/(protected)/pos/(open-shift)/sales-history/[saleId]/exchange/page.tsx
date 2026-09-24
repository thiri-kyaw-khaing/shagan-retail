"use client";

import { use, useMemo, useState } from "react";
import { Banknote, WalletCards } from "lucide-react";
import { notFound, useRouter } from "next/navigation";

import TransactionStepHeader from "@/components/custom/common/pos/transaction-step-header";
import ExchangeSelectStep from "@/components/custom/common/pos/exchange-select-step";
import ExchangeReplacementStep from "@/components/custom/common/pos/exchange-replacement-step";
import ExchangeConfirmStep from "@/components/custom/common/pos/exchange-confirm-step";
import type { ItemCondition } from "@/components/custom/common/pos/return-reason-step";
import type { RefundMethod } from "@/components/custom/common/pos/return-confirm-step";
import ManagerApprovalStep from "@/components/custom/common/pos/manager-approval-step";
import AmountConfirmStep from "@/components/custom/common/pos/amount-confirm-step";
import CashCollectStep from "@/components/custom/common/pos/cash-collect-step";
import QrCollectStep from "@/components/custom/common/pos/qr-collect-step";
import TransactionDoneStep from "@/components/custom/common/pos/transaction-done-step";
import { sales } from "@/lib/types/model/sales";
import { saleItems } from "@/lib/types/model/sale-items";
import { useReplacementCart } from "@/lib/hooks/use-replacement-cart";
import { useTranslation } from "@/lib/i18n/use-translation";

type Step =
  | "select"
  | "replacement"
  | "confirm"
  | "approval"
  | "payout"
  | "done";

const PREVIOUS_STEP: Record<Step, Step | null> = {
  select: null,
  replacement: "select",
  confirm: "replacement",
  approval: "confirm",
  payout: "approval",
  done: null,
};

type ExchangeItemsPageProps = {
  params: Promise<{ saleId: string }>;
};

export default function ExchangeItemsPage({ params }: ExchangeItemsPageProps) {
  const { saleId } = use(params);
  const router = useRouter();
  const { t } = useTranslation();

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
  const replacement = useReplacementCart();
  const [method, setMethod] = useState<RefundMethod | null>(null);
  const [managerPin, setManagerPin] = useState("");
  const [cashInput, setCashInput] = useState("");
  const [isQrConfirmed, setIsQrConfirmed] = useState(false);

  if (!sale) notFound();

  const customerLabel =
    sale.customerId === null
      ? t("sell.walkIn")
      : `Customer #${sale.customerId}`;

  const selectedLines = items
    .map((item) => ({ item, qty: returnQtyByItemId[item.id] ?? 0 }))
    .filter((line) => line.qty > 0);
  const returnedCount = selectedLines.reduce((sum, line) => sum + line.qty, 0);
  const returnedValue = selectedLines.reduce(
    (sum, line) => sum + line.item.unitPrice * line.qty,
    0,
  );
  const replacementValue = replacement.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const netDifference = replacementValue - returnedValue;

  const handleSelectContinue = () => {
    console.log("Exchange - items handed back:", selectedLines, "condition:", condition);
    setStep("replacement");
  };

  const handleReplacementContinue = () => {
    console.log("Exchange - replacement items:", replacement.cart);
    setStep("confirm");
  };

  const handleConfirmSubmit = () => {
    console.log("Exchange - net difference:", netDifference, "method:", method);
    setStep("approval");
  };

  const handleApprove = () => {
    console.log("Exchange - manager PIN entered:", managerPin);
    // No approval/exchanges backend yet — the mock data isn't updated here.
    // Refund payouts skip a QR confirm step (instant, like Return); amount-due
    // always needs one, cash or QR, since the customer is actively paying.
    const needsPayout = netDifference > 0 || (netDifference < 0 && method === "cash");
    setStep(needsPayout ? "payout" : "done");
  };

  const handleCompletePayout = () => {
    console.log("Exchange - payout completed:", netDifference);
    setStep("done");
  };

  const previousStep = PREVIOUS_STEP[step];

  const headerTitle =
    step === "select" || step === "confirm"
      ? t("exchange.title")
      : step === "replacement"
        ? t("exchange.chooseReplacement")
        : step === "approval"
          ? t("return.managerApprovalTitle")
          : step === "payout"
            ? netDifference < 0
              ? t("return.refundPayoutTitle")
              : t("exchange.paymentDueTitle")
            : "";

  const doneMessage =
    netDifference === 0
      ? `${t("exchange.processedPrefix")} ${returnedCount} ${returnedCount === 1 ? t("return.item") : t("return.items")} — ${t("exchange.noPaymentNeeded")}`
      : `${t("exchange.processedPrefix")} ${returnedCount} ${returnedCount === 1 ? t("return.item") : t("return.items")} — K ${Math.abs(netDifference).toLocaleString()} ${netDifference < 0 ? t("return.refundedViaSuffix") : t("exchange.collectedViaSuffix")} ${method}`;

  return (
    <>
      {step !== "done" && (
        <TransactionStepHeader
          title={headerTitle}
          customerLabel={customerLabel}
          total={sale.total}
          backHref={`/pos/sales-history/${sale.id}`}
          onBackStep={previousStep ? () => setStep(previousStep) : undefined}
        />
      )}

      {step === "select" && (
        <ExchangeSelectStep
          items={items}
          returnQtyByItemId={returnQtyByItemId}
          onChangeQty={(itemId, qty) =>
            setReturnQtyByItemId((current) => ({ ...current, [itemId]: qty }))
          }
          condition={condition}
          onConditionChange={setCondition}
          canContinue={returnedCount > 0 && condition !== null}
          onContinue={handleSelectContinue}
        />
      )}

      {step === "replacement" && (
        <ExchangeReplacementStep
          returnedValue={returnedValue}
          cart={replacement.cart}
          onAdd={replacement.add}
          onQtyChange={replacement.setQty}
          onRemove={replacement.remove}
          canContinue={replacement.cart.length > 0}
          onContinue={handleReplacementContinue}
        />
      )}

      {step === "confirm" && condition && (
        <ExchangeConfirmStep
          returnedCount={returnedCount}
          condition={condition}
          returnedValue={returnedValue}
          replacementValue={replacementValue}
          netDifference={netDifference}
          method={method}
          onMethodChange={setMethod}
          onSubmit={handleConfirmSubmit}
        />
      )}

      {step === "approval" && (
        <ManagerApprovalStep
          title={t("return.managerApprovalRequired")}
          subtitle={
            netDifference === 0
              ? t("exchange.approvingEvenExchange")
              : `${netDifference < 0 ? t("return.approvingRefundPrefix") : t("exchange.approvingPaymentPrefix")} K ${Math.abs(netDifference).toLocaleString()}`
          }
          pin={managerPin}
          onPinChange={setManagerPin}
          onSubmit={handleApprove}
        />
      )}

      {step === "payout" && netDifference < 0 && (
        <AmountConfirmStep
          icon={Banknote}
          bannerIcon={WalletCards}
          title={t("return.refundDue")}
          amount={Math.abs(netDifference)}
          bannerText={t("return.cashDrawerOpened")}
          buttonLabel={t("exchange.completeExchange")}
          onComplete={handleCompletePayout}
        />
      )}

      {step === "payout" && netDifference > 0 && method === "cash" && (
        <CashCollectStep
          amountDue={netDifference}
          cashInput={cashInput}
          onCashChange={setCashInput}
          onContinue={handleCompletePayout}
        />
      )}

      {step === "payout" && netDifference > 0 && method === "qr" && (
        <QrCollectStep
          isConfirmed={isQrConfirmed}
          onConfirmPayment={() => setIsQrConfirmed(true)}
          onContinue={handleCompletePayout}
        />
      )}

      {step === "done" && (
        <TransactionDoneStep
          title={t("return.done")}
          message={doneMessage}
          buttonLabel={t("return.backToSalesHistory")}
          onBack={() => router.push("/pos/sales-history")}
        />
      )}
    </>
  );
}
