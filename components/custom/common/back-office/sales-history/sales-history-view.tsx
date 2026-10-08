"use client";

import { useMemo, useState } from "react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import SalesHistoryTable from "@/components/custom/common/back-office/sales-history/sales-history-table";
import SearchBar from "@/components/custom/common/pos/search-bar";
import { Input } from "@/components/ui/input";
import type { SalesHistoryRow } from "@/lib/types/model/sales";

export default function SalesHistoryView({ sales }: { sales: SalesHistoryRow[] }) {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sales.filter((sale) => {
      const matchesQuery =
        query === "" ||
        sale.receiptNo.toLowerCase().includes(query) ||
        sale.customerName.toLowerCase().includes(query);
      const matchesDate = date === "" || sale.completedOn === date;
      return matchesQuery && matchesDate;
    });
  }, [search, date, sales]);

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Sales History"
        subtitle={`${filteredSales.length} receipts · ${sales.length} total`}
        backHref="/owner"
      />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by receipt # or customer..."
          className="flex-1 px-0 pt-0"
        />
        <Input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="h-11 border-rose-200 bg-white sm:w-56"
        />
      </div>

      <div className="mt-5">
        <SalesHistoryTable sales={filteredSales} />
      </div>
    </main>
  );
}
