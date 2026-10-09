"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import BackButton from "@/components/custom/common/back-button";
import FormError from "@/components/custom/common/forms/form-error";
import NoticeBanner from "@/components/custom/common/notice-banner";
import StatusBadge from "@/components/custom/common/status-badge";
import SummaryCard from "@/components/custom/common/summary-card";
import Header from "@/components/custom/common/pos/header";
import ReceiptActions from "@/components/custom/common/pos/receipt-actions";
import SaleTotals from "@/components/custom/common/pos/sale-totals";
import { useTranslation } from "@/lib/i18n/use-translation";
import { reprintReceiptAction } from "@/lib/pos/actions";
import { formatSaleDateTime, getReceiptNumber, type Sale } from "@/lib/types/model/sales";

type ReceiptDetailViewProps = {
  sale: Sale;
  cashierName: string | null;
  customerName: string | null;
  /** The void's explanation, when this sale was voided. */
  voidNote: string | null;
  /** All returns against this sale, added up. */
  returned: { refundTotal: number; refundMethods: ("cash" | "qr")[] } | null;
  /** All exchanges against this sale; > 0 the customer paid, < 0 they were refunded. */
  exchanged: { netDifference: number } | null;
  canReturn: boolean;
  canVoid: boolean;
};

export default function ReceiptDetailView({
  sale,
  cashierName,
  customerName,
  voidNote,
  returned,
  exchanged,
  canReturn,
  canVoid,
}: ReceiptDetailViewProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [reprinted, setReprinted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const customerLabel =
    sale.customerId === null
      ? t("sell.walkIn")
      : (customerName ?? `Customer #${sale.customerId}`);
  const isVoided = sale.status === "voided";

  const handleReprint = () => {
    setError(null);
    setReprinted(false);
    startTransition(async () => {
      const result = await reprintReceiptAction(sale.id);
      if (result.ok) setReprinted(true);
      else if (result.signedOut) router.push("/pos/select-staff");
      else setError(result.error);
    });
  };

  return (
    <>
      <Header
        title={`${t("receiptDetail.receipt")} #${getReceiptNumber(sale.id)}`}
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
        <BackButton href="/pos/sales-history" className="text-white" />
      </Header>

      <div className="mx-4 space-y-4 rounded-2xl bg-white p-4">
        <SummaryCard
          rows={[
            {
              label: t("receiptDetail.receipt"),
              value: `#${getReceiptNumber(sale.id)}`,
            },
            {
              label: t("receiptDetail.dateTime"),
              value: formatSaleDateTime(sale.completedAt),
            },
            { label: t("receiptDetail.customer"), value: customerLabel },
            {
              label: t("receiptDetail.cashier"),
              value: cashierName ?? "—",
            },
            {
              label: t("receiptDetail.status"),
              value: <StatusBadge isVoided={isVoided} />,
            },
          ]}
        />

        <SaleTotals
          subtotal={sale.subtotal}
          discount={sale.discount}
          tax={sale.tax}
          total={sale.total}
        />

        {voidNote !== null && (
          <NoticeBanner tone="rose" title={t("receiptDetail.voidedTitle")}>
            {voidNote}
          </NoticeBanner>
        )}

        {returned && (
          <NoticeBanner
            tone="amber"
            title={`${t("receiptDetail.returnedPrefix")} · K ${returned.refundTotal.toLocaleString()} ${t("receiptDetail.viaConnector")} ${returned.refundMethods.join(" + ")}`}
          />
        )}

        {exchanged && (
          <NoticeBanner
            tone="amber"
            title={
              exchanged.netDifference === 0
                ? `${t("receiptDetail.exchangedPrefix")} · ${t("exchange.noPaymentNeeded")}`
                : `${t("receiptDetail.exchangedPrefix")} · K ${Math.abs(exchanged.netDifference).toLocaleString()} ${exchanged.netDifference > 0 ? t("receiptDetail.collected") : t("receiptDetail.refunded")}`
            }
          />
        )}

        {reprinted && <NoticeBanner tone="amber" title="Receipt sent to the printer." />}
        <FormError message={error} />

        {!isVoided && (
          <ReceiptActions
            saleId={sale.id}
            onReprint={handleReprint}
            reprinting={isPending}
            canReturn={canReturn}
            canVoid={canVoid}
          />
        )}
      </div>
    </>
  );
}
