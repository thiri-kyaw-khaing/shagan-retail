"use client";

import { useState, useTransition } from "react";
import { Banknote, WalletCards } from "lucide-react";
import { useRouter } from "next/navigation";

import FilterSelect from "@/components/custom/common/back-office/filter-select";
import FormError from "@/components/custom/common/forms/form-error";
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
import { decimalToNumber } from "@/lib/api/mappers";
import { useTranslation } from "@/lib/i18n/use-translation";
import { approveAction, createExchangeAction } from "@/lib/pos/actions";
import { centsToDecimal, toCents } from "@/lib/pos/pricing";
import type { CartItemData } from "@/lib/types/model/cart";
import type { Product } from "@/lib/types/model/product";
import type { QrCode } from "@/lib/types/model/qr-codes";
import type { SaleItem } from "@/lib/types/model/sale-items";

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

type ExchangeItemsViewProps = {
  sale: { id: string; total: number; customerName: string | null };
  items: SaleItem[];
  /** Replacement candidates, priced at what a customer pays per unit. */
  products: Product[];
  qrCodes: QrCode[];
  /** Active staff at this branch who can approve an exchange. */
  approvers: { id: number; name: string }[];
};

export default function ExchangeItemsView({
  sale,
  items,
  products,
  qrCodes,
  approvers,
}: ExchangeItemsViewProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>("select");
  const [returnQtyByItemId, setReturnQtyByItemId] = useState<
    Record<number, number>
  >({});
  const [condition, setCondition] = useState<ItemCondition | null>(null);
  const [cart, setCart] = useState<CartItemData[]>([]);
  const [method, setMethod] = useState<RefundMethod | null>(null);
  const [approverId, setApproverId] = useState(approvers[0] ? String(approvers[0].id) : "");
  const [managerPin, setManagerPin] = useState("");
  const [cashInput, setCashInput] = useState("");
  const [isQrConfirmed, setIsQrConfirmed] = useState(false);
  // The backend's own difference once the exchange is recorded.
  const [recordedDifference, setRecordedDifference] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const addReplacement = (product: Product) => {
    setCart((current) => {
      const existing = current.find((line) => line.productId === product.id);
      if (existing) {
        return current.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: 1,
        },
      ];
    });
  };

  const changeReplacementQty = (productId: number, qty: number) => {
    setCart((current) =>
      current.map((line) =>
        line.productId === productId ? { ...line, quantity: qty } : line,
      ),
    );
  };

  const removeReplacement = (productId: number) => {
    setCart((current) => current.filter((line) => line.productId !== productId));
  };

  const customerLabel = sale.customerName ?? t("sell.walkIn");

  const selectedLines = items
    .map((item) => ({ item, qty: returnQtyByItemId[item.id] ?? 0 }))
    .filter((line) => line.qty > 0);
  const returnedCount = selectedLines.reduce((sum, line) => sum + line.qty, 0);
  const returnedValue = selectedLines.reduce(
    (sum, line) => sum + line.item.unitPrice * line.qty,
    0,
  );
  const replacementValue = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const netDifference = recordedDifference ?? replacementValue - returnedValue;

  const handleSelectContinue = () => {
    setStep("replacement");
  };

  const handleReplacementContinue = () => {
    setStep("confirm");
  };

  const handleConfirmSubmit = () => {
    setError(null);
    setStep("approval");
  };

  const handleApprove = () => {
    if (managerPin.length !== 6) return;
    setError(null);
    startTransition(async () => {
      const approval = await approveAction(Number(approverId), managerPin, "approve_exchange");
      setManagerPin("");
      if (!approval.ok) {
        if (approval.signedOut) router.push("/pos/select-staff");
        setError(approval.error);
        return;
      }
      const result = await createExchangeAction(
        sale.id,
        [
          ...selectedLines.map((line) => ({
            direction: "in" as const,
            sale_item_id: line.item.id,
            qty: line.qty,
            // Only "sellable" goes back into stock; the rest are written off.
            ...(condition && { condition }),
          })),
          ...cart.map((line) => ({
            direction: "out" as const,
            product_id: line.productId,
            unit_price: centsToDecimal(toCents(line.price)),
            qty: line.quantity,
          })),
        ],
        method,
        approval.data.token,
      );
      if (!result.ok) {
        if (result.signedOut) router.push("/pos/select-staff");
        else setError(result.error);
        return;
      }
      const recorded = decimalToNumber(result.data.netDifference);
      setRecordedDifference(recorded);
      // Refund payouts skip a QR confirm step (instant, like Return); amount-due
      // always needs one, cash or QR, since the customer is actively paying.
      const needsPayout = recorded > 0 || (recorded < 0 && method === "cash");
      setStep(needsPayout ? "payout" : "done");
    });
  };

  const handleCompletePayout = () => {
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
          // Once the backend has recorded the exchange there's no going back.
          onBackStep={previousStep && recordedDifference === null ? () => setStep(previousStep) : undefined}
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
          products={products}
          returnedValue={returnedValue}
          cart={cart}
          onAdd={addReplacement}
          onQtyChange={changeReplacementQty}
          onRemove={removeReplacement}
          canContinue={cart.length > 0}
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
            <FormError message="Nobody at this branch can approve an exchange." />
          )}
        </ManagerApprovalStep>
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
          qrCodes={qrCodes}
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
