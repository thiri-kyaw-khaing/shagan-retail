"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import PaymentBreakdownCard from "@/components/custom/common/back-office/reports/payment-breakdown-card";
import ProductSalesKpis from "@/components/custom/common/back-office/reports/product-sales-kpis";
import ProductSalesTable from "@/components/custom/common/back-office/reports/product-sales-table";
import ReportFilters, {
  type ReportTab,
} from "@/components/custom/common/back-office/reports/report-filters";
import SalesSummaryKpis from "@/components/custom/common/back-office/reports/sales-summary-kpis";
import SalesTrendCard from "@/components/custom/common/back-office/reports/sales-trend-card";
import TopSellingProductsCard from "@/components/custom/common/back-office/reports/top-selling-products-card";
import TransactionsTable from "@/components/custom/common/back-office/reports/transactions-table";
import CustomButton from "@/components/custom/common/custom-button";
import { downloadCsv } from "@/lib/download-csv";
import { branches } from "@/lib/types/model/branches";
import { returns } from "@/lib/types/model/returns";
import { saleItems } from "@/lib/types/model/sale-items";
import { sales } from "@/lib/types/model/sales";
import { shifts } from "@/lib/types/model/shifts";
import { staffs } from "@/lib/types/model/staffs";
import {
  buildProductSales,
  buildReportRows,
  getPaymentBreakdown,
  getDefaultChartView,
  getPresetRange,
  getReportAnchor,
  isInRange,
  isSingleDay,
  summarize,
  summarizeProductSales,
  type ActiveDatePreset,
  type DateRange,
  type DateRangePreset,
  type TrendGranularity,
} from "@/lib/types/model/reports";

const ALL = "all";
const allReportRows = buildReportRows(sales, returns, staffs);
const anchor = getReportAnchor(allReportRows);

type DateFilter = DateRange & { activePreset: ActiveDatePreset };

const DEFAULT_PRESET: DateRangePreset = "today";
const defaultDateFilter = (): DateFilter => ({
  activePreset: DEFAULT_PRESET,
  ...getPresetRange(DEFAULT_PRESET, anchor),
});

const BRANCH_OPTIONS = [
  { value: ALL, label: "All Branches" },
  ...branches.map((branch) => ({ value: String(branch.id), label: branch.name })),
];

const CASHIER_OPTIONS = [
  { value: ALL, label: "All Cashiers" },
  ...[...new Set(allReportRows.map((row) => row.staffId))].map((staffId) => ({
    value: String(staffId),
    label: staffs.find((staff) => staff.id === staffId)?.name ?? "Unknown",
  })),
];

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>("summary");
  const [dateFilter, setDateFilter] = useState<DateFilter>(defaultDateFilter);
  const [chartView, setChartView] = useState<TrendGranularity>(
    getDefaultChartView(DEFAULT_PRESET, defaultDateFilter()),
  );
  const [branch, setBranch] = useState(ALL);
  const [cashier, setCashier] = useState(ALL);

  const rows = useMemo(() => {
    return allReportRows
      .filter(
        (row) =>
          isInRange(row.completedAt, dateFilter) &&
          (branch === ALL || String(row.branchId) === branch) &&
          (cashier === ALL || String(row.staffId) === cashier),
      )
      .sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
  }, [dateFilter, branch, cashier]);

  const rangeShifts = useMemo(() => {
    const shiftIds = new Set(rows.map((row) => row.shiftId));
    return shifts.filter((shift) => shiftIds.has(shift.id));
  }, [rows]);

  const summary = useMemo(() => summarize(rows), [rows]);
  const payments = useMemo(() => getPaymentBreakdown(rows), [rows]);
  const productRows = useMemo(() => buildProductSales(rows, saleItems), [rows]);

  const canReset =
    dateFilter.activePreset !== DEFAULT_PRESET ||
    branch !== ALL ||
    cashier !== ALL;

  // Changing the date range also resets the chart to that range's default view.
  const applyDateFilter = (next: DateFilter) => {
    setDateFilter(next);
    setChartView(getDefaultChartView(next.activePreset, next));
  };

  const selectPreset = (preset: DateRangePreset) =>
    applyDateFilter({ activePreset: preset, ...getPresetRange(preset, anchor) });

  const applyCustomRange = (range: DateRange) =>
    applyDateFilter({ activePreset: "custom", ...range });

  const resetFilters = () => {
    applyDateFilter(defaultDateFilter());
    setBranch(ALL);
    setCashier(ALL);
  };

  const exportCsv = () => {
    if (tab === "products") {
      downloadCsv(
        "product-sales.csv",
        ["Product", "Units sold", "Revenue"],
        productRows.map((row) => [row.name, row.quantity, row.revenue]),
      );
      return;
    }
    downloadCsv(
      "sales-summary.csv",
      ["Receipt", "Date", "Cashier", "Method", "Gross", "Discount", "Refund", "Net", "Status"],
      rows.map((row) => [
        row.receiptNo,
        row.completedAt.toISOString(),
        row.cashierName,
        row.method,
        row.gross,
        row.discount,
        row.refund,
        row.net,
        row.status,
      ]),
    );
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] space-y-4 bg-page p-4 sm:p-6">
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
        tab={tab}
        onTabChange={setTab}
        activePreset={dateFilter.activePreset}
        range={dateFilter}
        onPresetChange={selectPreset}
        onCustomRangeApply={applyCustomRange}
        branch={branch}
        onBranchChange={setBranch}
        branchOptions={BRANCH_OPTIONS}
        cashier={cashier}
        onCashierChange={setCashier}
        cashierOptions={CASHIER_OPTIONS}
        canReset={canReset}
        onReset={resetFilters}
      />

      {tab === "summary" ? (
        <>
          <SalesSummaryKpis summary={summary} payments={payments} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SalesTrendCard
              rows={rows}
              shifts={rangeShifts}
              range={dateFilter}
              activePreset={dateFilter.activePreset}
              view={chartView}
              onViewChange={setChartView}
              weeklyDisabled={isSingleDay(dateFilter)}
            />
            <PaymentBreakdownCard payments={payments} />
          </div>
          <TransactionsTable rows={rows} />
        </>
      ) : (
        <>
          <ProductSalesKpis summary={summarizeProductSales(productRows)} />
          <TopSellingProductsCard rows={productRows} />
          <ProductSalesTable rows={productRows} />
        </>
      )}
    </main>
  );
}
