"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import FilterSelect from "@/components/custom/common/back-office/filter-select";
import CustomButton from "@/components/custom/common/custom-button";
import FormError from "@/components/custom/common/forms/form-error";
import CashPayment from "@/components/custom/common/pos/cash-payment";
import ManagerApprovalStep from "@/components/custom/common/pos/manager-approval-step";
import PaymentComplete from "@/components/custom/common/pos/payment-complete";
import PaymentMethodSelection from "@/components/custom/common/pos/payment-method-selection";
import { usePos } from "@/components/custom/common/pos/pos-context";
import QrPayment from "@/components/custom/common/pos/qr-payment";
import SaleComplete from "@/components/custom/common/pos/sale-complete";
import SplitPayment from "@/components/custom/common/pos/split-payment";
import type { ApiCreatePayment } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/locale-context";
import { approveAction, createSaleAction } from "@/lib/pos/actions";
import { centsToDecimal, fromCents, priceCart, toCents, toSaleItems } from "@/lib/pos/pricing";
import type { PaymentMethod, SplitLine } from "@/lib/types/model/payment";
import type { QrCode } from "@/lib/types/model/qr-codes";
import { getReceiptNumber } from "@/lib/types/model/sales";

type PaymentViewProps = {
  qrCodes: QrCode[];
  /** Active staff at this branch who may approve a discount. */
  approvers: { id: number; name: string }[];
};

type Done = { receiptNo: string; total: number; change: number | null };

const payment = (method: "cash" | "qr", amountCents: number, receivedCents = amountCents): ApiCreatePayment => ({
  method,
  amount: centsToDecimal(amountCents),
  amount_received: centsToDecimal(receivedCents),
  change_given: centsToDecimal(receivedCents - amountCents),
});

export default function PaymentView({ qrCodes, approvers }: PaymentViewProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const { till, cart, discountPercent, customer, resetOrder } = usePos();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [cashInput, setCashInput] = useState("");
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [isQrConfirmed, setIsQrConfirmed] = useState(false);
  // One id per checkout: retrying after a lost response resends the same id,
  // and the backend returns the sale it already recorded.
  const [saleId] = useState(() => crypto.randomUUID());
  const [pendingPayments, setPendingPayments] = useState<ApiCreatePayment[] | null>(null);
  const [approverId, setApproverId] = useState(approvers[0] ? String(approvers[0].id) : "");
  const [approvalPin, setApprovalPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const [isPending, startTransition] = useTransition();

  const checkout = priceCart(cart, discountPercent);
  const totalDue = fromCents(checkout.totalCents);
  const customerGives = Number(cashInput || "0");
  const difference = customerGives - totalDue;
  const hasEnoughCash = cashInput !== "" && toCents(customerGives) >= checkout.totalCents;
  // A discounted sale needs apply_manual_discount: the cashier's own, or a
  // manager's PIN approval just for this sale.
  const needsApproval = checkout.discountCents > 0 && !till.canApplyDiscount;

  const submit = (payments: ApiCreatePayment[], approvalToken?: string) => {
    setError(null);
    startTransition(async () => {
      const result = await createSaleAction(
        {
          id: saleId,
          shift_id: till.shiftId,
          device_id: till.deviceId,
          customer_id: customer?.id ?? null,
          items: toSaleItems(checkout),
          payments,
        },
        approvalToken,
      );
      if (result.ok) {
        const cash = payments.find((p) => p.method === "cash");
        setPendingPayments(null);
        setDone({
          receiptNo: getReceiptNumber(result.data.id),
          total: totalDue,
          change: cash ? Number(cash.change_given) : null,
        });
      } else if (result.signedOut) {
        router.push("/pos/select-staff");
      } else {
        setError(result.error);
      }
    });
  };

  /** Every route to "Complete sale" ends here. */
  const finish = (payments: ApiCreatePayment[]) => {
    const paid = payments.reduce((sum, p) => sum + toCents(Number(p.amount)), 0);
    if (paid !== checkout.totalCents) {
      setError("The payments don't add up to the total. Go back and check them.");
      return;
    }
    if (needsApproval) {
      setApprovalPin("");
      setPendingPayments(payments);
    } else {
      submit(payments);
    }
  };

  const approveAndSubmit = () => {
    if (!pendingPayments) return;
    setError(null);
    startTransition(async () => {
      const approval = await approveAction(Number(approverId), approvalPin, "apply_manual_discount");
      if (!approval.ok) {
        if (approval.signedOut) router.push("/pos/select-staff");
        setError(approval.error);
        setApprovalPin("");
        return;
      }
      submit(pendingPayments, approval.data.token);
    });
  };

  const fromSplit = (lines: SplitLine[]) =>
    finish(lines.map((line) => payment(line.method, toCents(line.amount))));

  const handleNewSale = () => {
    resetOrder();
    router.push("/pos/sell");
  };

  // Nothing to pay for (e.g. a reload emptied the cart): back to selling.
  if (cart.length === 0 && !done) {
    return (
      <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-rose-50 px-4">
        <div className="rounded-xl bg-white p-8 text-center shadow-xl">
          <p className="text-slate-600">The cart is empty.</p>
          <CustomButton
            label="Back to selling"
            onClick={() => router.push("/pos/sell")}
            className="mt-4 bg-brand text-white hover:bg-brand/90"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-y-auto bg-rose-50 px-4 py-8 sm:px-6">
      <section className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
        {done && (
          <SaleComplete
            total={done.total}
            change={done.change}
            receiptNo={done.receiptNo}
            locale={locale}
            onNewSale={handleNewSale}
          />
        )}

        {!done && pendingPayments && (
          <div className="p-6">
            <ManagerApprovalStep
              title="Manager approval"
              subtitle="This sale has a discount. A manager enters their PIN to approve it."
              pin={approvalPin}
              onPinChange={(pin) => {
                setError(null);
                setApprovalPin(pin.slice(0, 6));
              }}
              onSubmit={approveAndSubmit}
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
                <FormError message="Nobody at this branch can approve discounts. Remove the discount to continue." />
              )}
            </ManagerApprovalStep>
            <CustomButton
              label="Back to payment"
              onClick={() => {
                setError(null);
                setPendingPayments(null);
              }}
              className="mx-auto mt-4 flex border border-slate-200 bg-white text-slate-600 shadow-none hover:bg-slate-50"
            />
          </div>
        )}

        {!done && !pendingPayments && (
          <>
            {error && (
              <div className="space-y-2 p-4 pb-0">
                <FormError message={error} />
              </div>
            )}
            {isPending && <p className="p-4 pb-0 text-sm text-slate-500">Recording the sale…</p>}

            {!paymentMethod && (
              <PaymentMethodSelection
                totalDue={totalDue}
                locale={locale}
                onSelect={(method) => {
                  setPaymentMethod(method);
                  setIsQrConfirmed(false);
                }}
              />
            )}

            {paymentMethod === "cash" && !isPaymentComplete && (
              <CashPayment
                totalDue={totalDue}
                cashInput={cashInput}
                customerGives={customerGives}
                difference={difference}
                hasEnoughCash={hasEnoughCash}
                locale={locale}
                onBack={() => setPaymentMethod(null)}
                onSelectMethod={(method) => {
                  setPaymentMethod(method);
                  setIsPaymentComplete(false);
                  setIsQrConfirmed(false);
                }}
                onCashChange={setCashInput}
                onContinue={() => hasEnoughCash && setIsPaymentComplete(true)}
              />
            )}

            {paymentMethod === "cash" && isPaymentComplete && (
              <PaymentComplete
                totalDue={totalDue}
                customerGives={customerGives}
                change={difference}
                locale={locale}
                onBack={() => setIsPaymentComplete(false)}
                onComplete={() =>
                  !isPending && finish([payment("cash", checkout.totalCents, toCents(customerGives))])
                }
              />
            )}

            {paymentMethod === "qr" && (
              <QrPayment
                totalDue={totalDue}
                locale={locale}
                qrCodes={qrCodes}
                isConfirmed={isQrConfirmed}
                onBack={() => setPaymentMethod(null)}
                onSelectMethod={(method) => {
                  setPaymentMethod(method);
                  setIsQrConfirmed(false);
                }}
                onConfirmPayment={() => setIsQrConfirmed(true)}
                onCompleteSale={() => !isPending && finish([payment("qr", checkout.totalCents)])}
              />
            )}

            {paymentMethod === "split" && (
              <SplitPayment
                totalDue={totalDue}
                locale={locale}
                qrCodes={qrCodes}
                onBack={() => setPaymentMethod(null)}
                onSelectMethod={(method) => {
                  setPaymentMethod(method);
                  setIsQrConfirmed(false);
                }}
                onCompleteSale={(lines) => !isPending && fromSplit(lines)}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}
