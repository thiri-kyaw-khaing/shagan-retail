"use client";

import { use } from "react";
import { notFound } from "next/navigation";

import BackButton from "@/components/custom/common/back-button";
import NoticeBanner from "@/components/custom/common/notice-banner";
import StatusBadge from "@/components/custom/common/status-badge";
import SummaryCard from "@/components/custom/common/summary-card";
import Header from "@/components/custom/common/pos/header";
import ReceiptActions from "@/components/custom/common/pos/receipt-actions";
import SaleTotals from "@/components/custom/common/pos/sale-totals";
import {
  formatSaleDateTime,
  getReceiptNumber,
  sales,
} from "@/lib/types/model/sales";
import { voids } from "@/lib/types/model/voids";
import { returns } from "@/lib/types/model/returns";
import { staffs } from "@/lib/types/model/staffs";

type ReceiptDetailPageProps = {
  params: Promise<{ saleId: string }>;
};

export default function ReceiptDetailPage({ params }: ReceiptDetailPageProps) {
  const { saleId } = use(params);
  const sale = sales.find((item) => item.id === saleId);

  if (!sale) notFound();

  const cashier = staffs.find((staff) => staff.id === sale.staffId);
  const customerLabel =
    sale.customerId === null ? "Walk-in" : `Customer #${sale.customerId}`;
  const isVoided = sale.status === "voided";
  const relatedVoid = voids.find((item) => item.saleId === sale.id);
  const relatedReturn = returns.find((item) => item.saleId === sale.id);

  return (
    <>
      <Header
        title={`Receipt #${getReceiptNumber(sale.id)}`}
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
            { label: "Receipt", value: `#${getReceiptNumber(sale.id)}` },
            { label: "Date & Time", value: formatSaleDateTime(sale.completedAt) },
            { label: "Customer", value: customerLabel },
            { label: "Cashier", value: cashier?.name ?? "—" },
            { label: "Status", value: <StatusBadge isVoided={isVoided} /> },
          ]}
        />

        <SaleTotals
          subtotal={sale.subtotal}
          discount={sale.discount}
          tax={sale.tax}
          total={sale.total}
        />

        {relatedVoid && (
          <NoticeBanner tone="rose" title="Voided">
            {relatedVoid.explanation ?? relatedVoid.reason}
          </NoticeBanner>
        )}

        {relatedReturn && (
          <NoticeBanner
            tone="amber"
            title={`Returned · K ${relatedReturn.refundTotal.toLocaleString()} via ${relatedReturn.refundMethod}`}
          />
        )}

        {!isVoided && <ReceiptActions saleId={sale.id} />}
      </div>
    </>
  );
}
