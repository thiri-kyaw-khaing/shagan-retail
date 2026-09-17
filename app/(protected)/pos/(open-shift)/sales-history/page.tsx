"use client";
import { useMemo, useState } from "react";

import BackButton from "@/components/custom/common/back-button";
import Header from "@/components/custom/common/pos/header";
import ProductSearchBar from "@/components/custom/common/pos/search-bar";
import ReceiptRow from "@/components/custom/common/pos/receipt-row";
import SalesStatusTabs, {
  type SalesStatusFilter,
} from "@/components/custom/common/pos/sales-status-tabs";
import { getReceiptNumber, sales } from "@/lib/types/model/sales";

function SalesHistoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SalesStatusFilter>("all");

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sales.filter((sale) => {
      const statusMatches =
        statusFilter === "all" || sale.status === statusFilter;

      const searchMatches =
        query === "" ||
        getReceiptNumber(sale.id).toLowerCase().includes(query) ||
        sale.total.toString().includes(query);

      return statusMatches && searchMatches;
    });
  }, [search, statusFilter]);

  return (
    <>
      <Header
        title="Sales History"
        description="Find a sale, view details or manage a receipt"
      >
        <BackButton href="/pos/sell" className="text-white" />
      </Header>

      <ProductSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by receipt number or customer name..."
      />

      <SalesStatusTabs selected={statusFilter} onSelect={setStatusFilter} />

      <div className="mx-4 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white">
        {filteredSales.length === 0 ? (
          <p className="p-6 text-center text-sm text-ink-muted">
            No receipts found
          </p>
        ) : (
          filteredSales.map((sale) => <ReceiptRow key={sale.id} sale={sale} />)
        )}
      </div>
    </>
  );
}

export default SalesHistoryPage;
