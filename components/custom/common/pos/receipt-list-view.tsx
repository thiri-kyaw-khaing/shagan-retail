"use client";

import { useMemo, useState } from "react";

import BackButton from "@/components/custom/common/back-button";
import Header from "@/components/custom/common/pos/header";
import ProductSearchBar from "@/components/custom/common/pos/search-bar";
import ReceiptRow from "@/components/custom/common/pos/receipt-row";
import SalesStatusTabs, {
  type SalesStatusFilter,
} from "@/components/custom/common/pos/sales-status-tabs";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getReceiptNumber, type Sale } from "@/lib/types/model/sales";

export type ReceiptListRow = {
  sale: Sale;
  cashierName?: string;
  customerName?: string;
};

export default function ReceiptListView({ rows }: { rows: ReceiptListRow[] }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SalesStatusFilter>("all");

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter(({ sale }) => {
      const statusMatches =
        statusFilter === "all" || sale.status === statusFilter;

      const searchMatches =
        query === "" ||
        getReceiptNumber(sale.id).toLowerCase().includes(query) ||
        sale.total.toString().includes(query);

      return statusMatches && searchMatches;
    });
  }, [rows, search, statusFilter]);

  return (
    <>
      <Header
        title={t("salesHistory.title")}
        description={t("salesHistory.description")}
      >
        <BackButton href="/pos/sell" className="text-white" />
      </Header>

      <ProductSearchBar
        value={search}
        onChange={setSearch}
        placeholder={t("salesHistory.searchPlaceholder")}
      />

      <SalesStatusTabs selected={statusFilter} onSelect={setStatusFilter} />

      <div className="mx-4 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white">
        {filteredRows.length === 0 ? (
          <p className="p-6 text-center text-sm text-ink-muted">
            {t("salesHistory.noReceipts")}
          </p>
        ) : (
          filteredRows.map((row) => (
            <ReceiptRow
              key={row.sale.id}
              sale={row.sale}
              cashierName={row.cashierName}
              customerName={row.customerName}
            />
          ))
        )}
      </div>
    </>
  );
}
