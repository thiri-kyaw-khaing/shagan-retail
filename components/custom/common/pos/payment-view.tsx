"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import CustomButton from "@/components/custom/common/custom-button";
import FormError from "@/components/custom/common/forms/form-error";
import CashPayment from "@/components/custom/common/pos/cash-payment";
import PaymentComplete from "@/components/custom/common/pos/payment-complete";
import PaymentMethodSelection from "@/components/custom/common/pos/payment-method-selection";
import { usePos } from "@/components/custom/common/pos/pos-context";
import QrPayment from "@/components/custom/common/pos/qr-payment";
import SaleComplete from "@/components/custom/common/pos/sale-complete";
import SplitPayment from "@/components/custom/common/pos/split-payment";
import type { ApiCreatePayment } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/locale-context";
import { createSaleAction } from "@/lib/pos/actions";
import { centsToDecimal, fromCents, priceCart, toCents, toSaleItems } from "@/lib/pos/pricing";
import { receiptFromCheckout } from "@/lib/printer/from-sale";
import type { ReceiptDoc } from "@/lib/printer/receipt";
import type { PaymentMethod, SplitLine } from "@/lib/types/model/payment";
import type { QrCode } from "@/lib/types/model/qr-codes";
import { getReceiptNumber } from "@/lib/types/model/sales";

type PaymentViewProps = {
  qrCodes: QrCode[];
};

type Done = { receiptNo: string; total: number; change: number | null; receipt: ReceiptDoc };

const payment = (method: "cash" | "qr", amountCents: number, receivedCents = amountCents): ApiCreatePayment => ({
  method,
  amount: centsToDecimal(amountCents),
  amount_received: centsToDecimal(receivedCents),
  change_given: centsToDecimal(receivedCents - amountCents),
});

export default function PaymentView({ qrCodes }: PaymentViewProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const { till, cart, customer, resetOrder } = usePos();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [cashInput, setCashInput] = useState("");
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [isQrConfirmed, setIsQrConfirmed] = useState(false);
  // One id per checkout: retrying after a lost response resends the same id,
  // and the backend returns the sale it already recorded.
  const [saleId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const [isPending, startTransition] = useTransition();

  const checkout = priceCart(cart);
  const totalDue = fromCents(checkout.totalCents);
  const customerGives = Number(cashInput || "0");
  const difference = customerGives - totalDue;
  const hasEnoughCash = cashInput !== "" && toCents(customerGives) >= checkout.totalCents;
  // Custom discounts were approved when they were added, so no PIN here.
  const submit = (payments: ApiCreatePayment[]) => {
    setError(null);
    startTransition(async () => {
      const result = await createSaleAction({
        id: saleId,
        shift_id: till.shiftId,
        device_id: till.deviceId,
        customer_id: customer?.id ?? null,
        items: toSaleItems(checkout),
        payments,
      });
      if (result.ok) {
        const cash = payments.find((p) => p.method === "cash");
        setDone({
          receiptNo: getReceiptNumber(result.data.id),
          total: totalDue,
          change: cash ? Number(cash.change_given) : null,
          receipt: receiptFromCheckout(
            {
              shop: till.receiptShop,
              branchName: till.branchName,
              cashier: till.staffName,
              customer: customer?.name ?? null,
            },
            result.data.id,
            checkout,
            payments,
          ),
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
    submit(payments);
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
            receipt={done.receipt}
            locale={locale}
            onNewSale={handleNewSale}
          />
        )}

        {!done && (
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
