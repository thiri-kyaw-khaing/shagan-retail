"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import PageHeader from "@/components/custom/common/back-office/page-header";
import PaymentBreakdownCard from "@/components/custom/common/back-office/reports/payment-breakdown-card";
import ProductSalesKpis from "@/components/custom/common/back-office/reports/product-sales-kpis";
import ProductSalesTable from "@/components/custom/common/back-office/reports/product-sales-table";
import ReportFilters from "@/components/custom/common/back-office/reports/report-filters";
import SalesSummaryKpis from "@/components/custom/common/back-office/reports/sales-summary-kpis";
import SalesTrendCard from "@/components/custom/common/back-office/reports/sales-trend-card";
import TopSellingProductsCard from "@/components/custom/common/back-office/reports/top-selling-products-card";
import TransactionsTable from "@/components/custom/common/back-office/reports/transactions-table";
import CustomButton from "@/components/custom/common/custom-button";
import { downloadCsv } from "@/lib/download-csv";
import type { ReportData, ReportQuery } from "@/lib/reports/report-data";
import {
  getRangeDays,
  parseDateInput,
  summarizeProductSales,
  toDateInputValue,
  type DateRange,
  type DateRangePreset,
  type TrendGranularity,
} from "@/lib/types/model/reports";

type ReportsViewProps = { query: ReportQuery; data: ReportData };

// Filter state lives in the URL; the server page re-fetches for each change.
export default function ReportsView({ query, data }: ReportsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const range: DateRange = {
    startDate: parseDateInput(query.from)!,
    endDate: parseDateInput(query.to)!,
  };

  /** Navigates to the report with `changes` applied. A date change drops `view` so it resets to that range's default. */
  const update = (changes: Partial<Record<"tab" | "preset" | "from" | "to" | "view", string | null>>) => {
    const next = new URLSearchParams();
    const merged = { tab: query.tab, preset: query.preset, from: query.from, to: query.to, view: query.view, ...changes };
    if (merged.tab !== "summary") next.set("tab", merged.tab!);
    if (merged.preset && merged.preset !== "today") next.set("preset", merged.preset);
    if (merged.preset === "custom") {
      next.set("from", merged.from!);
      next.set("to", merged.to!);
    }
    if (merged.view) next.set("view", merged.view);
    startTransition(() => router.push(next.size ? `${pathname}?${next}` : pathname, { scroll: false }));
  };

  const selectPreset = (preset: DateRangePreset) => update({ preset, view: null });
  const applyCustomRange = (custom: DateRange) =>
    update({
      preset: "custom",
      from: toDateInputValue(custom.startDate),
      to: toDateInputValue(custom.endDate),
      view: null,
    });

  const exportCsv = () => {
    if (query.tab === "products") {
      downloadCsv(
        "product-sales.csv",
        ["Product", "Units sold", "Revenue"],
        data.products.map((row) => [row.name, row.quantity, row.revenue]),
      );
      return;
    }
    downloadCsv(
      "sales-transactions.csv",
      ["Receipt", "Completed at", "Cashier", "Total", "Status"],
      data.transactions.map((row) => [row.receiptNo, row.completedAt, row.cashierName, row.total, row.status]),
    );
  };

  return (
    <main
      className={`min-h-[calc(100dvh-5rem)] space-y-4 bg-page p-4 transition-opacity sm:p-6 ${isPending ? "opacity-60" : ""}`}
    >
      <PageHeader
        title="Reports"
        subtitle="Review sales and product performance"
        backHref="/owner"
        action={
          <CustomButton
            label="Export"
            icon={Download}
            onClick={exportCsv}
            className="min-h-11 bg-brand px-4 font-semibold text-white hover:bg-brand/90"
          />
        }
      />

      <ReportFilters
        tab={query.tab}
        onTabChange={(tab) => update({ tab })}
        activePreset={query.preset}
        range={range}
        onPresetChange={selectPreset}
        onCustomRangeApply={applyCustomRange}
        canReset={query.preset !== "today"}
        onReset={() => selectPreset("today")}
      />

      {query.tab === "summary" ? (
        <>
          <SalesSummaryKpis summary={data.summary} payments={data.payments} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SalesTrendCard
              buckets={data.buckets}
              range={range}
              activePreset={query.preset}
              view={query.view}
              onViewChange={(view: TrendGranularity) => update({ view })}
              hourlyDisabled={!data.hourlyAvailable}
              weeklyDisabled={getRangeDays(range) === 1}
            />
            <PaymentBreakdownCard payments={data.payments} />
          </div>
          <TransactionsTable rows={data.transactions} totalCount={data.transactionCount} />
        </>
      ) : (
        <>
          <ProductSalesKpis summary={summarizeProductSales(data.products)} />
          <TopSellingProductsCard rows={data.products} />
          <ProductSalesTable rows={data.products} />
        </>
      )}
    </main>
  );
}
