"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import BackButton from "@/components/custom/common/back-button";
import CashPayment from "@/components/custom/common/pos/cash-payment";
import CustomButton from "@/components/custom/common/custom-button";
import PaymentComplete from "@/components/custom/common/pos/payment-complete";
import PaymentMethodSelection from "@/components/custom/common/pos/payment-method-selection";
import SaleComplete from "@/components/custom/common/pos/sale-complete";
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
            onSelect={setPaymentMethod}
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
            }}
            onCashChange={setCashInput}
            onContinue={handleCashContinue}
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

        {!isSaleComplete &&
          paymentMethod !== null &&
          paymentMethod !== "cash" && (
            <div className="p-6 sm:p-8">
              <BackButton
                href="/pos/sell"
                className="size-11 p-0 text-slate-600 hover:bg-rose-50"
              />
              <h1 className="mt-4 text-xl font-bold text-slate-900">
                {paymentMethod === "qr" ? "QR Code payment" : "Split payment"}
              </h1>
              <p className="mt-2 text-slate-500">
                This payment method is ready for integration.
              </p>
              <CustomButton
                label="Back to payment methods"
                onClick={() => setPaymentMethod(null)}
                className="mt-6 min-h-12 bg-brand font-semibold text-white"
              />
            </div>
          )}
      </section>
    </main>
  );
}
