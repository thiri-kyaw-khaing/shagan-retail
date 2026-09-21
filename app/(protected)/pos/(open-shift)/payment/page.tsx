"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import CashPayment from "@/components/custom/common/pos/cash-payment";
import PaymentComplete from "@/components/custom/common/pos/payment-complete";
import PaymentMethodSelection from "@/components/custom/common/pos/payment-method-selection";
import QrPayment from "@/components/custom/common/pos/qr-payment";
import SaleComplete from "@/components/custom/common/pos/sale-complete";
import SplitPayment from "@/components/custom/common/pos/split-payment";
import { usePos } from "@/components/custom/common/pos/pos-context";
import { useLocale } from "@/lib/i18n/locale-context";
import type { PaymentMethod } from "@/lib/types/model/payment";

export default function PaymentPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const { cart, setCart } = usePos();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [cashInput, setCashInput] = useState("");
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [isQrConfirmed, setIsQrConfirmed] = useState(false);
  const [isSaleComplete, setIsSaleComplete] = useState(false);

  const totalDue = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const customerGives = Number(cashInput || "0");
  const difference = customerGives - totalDue;
  const hasEnoughCash = customerGives >= totalDue && cashInput !== "";

  const handleCashContinue = () => {
    if (hasEnoughCash) setIsPaymentComplete(true);
  };

  const handleNewSale = () => {
    setCart([]);
    router.push("/pos/sell");
  };

  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-y-auto bg-rose-50 px-4 py-8 sm:px-6">
      <section className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
        {isSaleComplete && (
          <SaleComplete
            total={totalDue}
            change={difference}
            locale={locale}
            onNewSale={handleNewSale}
          />
        )}

        {!isSaleComplete && !paymentMethod && (
          <PaymentMethodSelection
            totalDue={totalDue}
            locale={locale}
            onSelect={(method) => {
              setPaymentMethod(method);
              setIsQrConfirmed(false);
            }}
          />
        )}

        {!isSaleComplete && paymentMethod === "cash" && !isPaymentComplete && (
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
            onContinue={handleCashContinue}
          />
        )}

        {!isSaleComplete && paymentMethod === "qr" && (
          <QrPayment
            totalDue={totalDue}
            locale={locale}
            isConfirmed={isQrConfirmed}
            onBack={() => setPaymentMethod(null)}
            onSelectMethod={(method) => {
              setPaymentMethod(method);
              setIsQrConfirmed(false);
            }}
            onConfirmPayment={() => setIsQrConfirmed(true)}
            onCompleteSale={() => setIsSaleComplete(true)}
          />
        )}

        {!isSaleComplete && paymentMethod === "cash" && isPaymentComplete && (
          <PaymentComplete
            totalDue={totalDue}
            customerGives={customerGives}
            change={difference}
            locale={locale}
            onBack={() => setIsPaymentComplete(false)}
            onComplete={() => setIsSaleComplete(true)}
          />
        )}

        {!isSaleComplete && paymentMethod === "split" && (
          <SplitPayment
            totalDue={totalDue}
            locale={locale}
            onBack={() => setPaymentMethod(null)}
            onSelectMethod={(method) => {
              setPaymentMethod(method);
              setIsQrConfirmed(false);
            }}
            onCompleteSale={() => setIsSaleComplete(true)}
          />
        )}
      </section>
    </main>
  );
}
