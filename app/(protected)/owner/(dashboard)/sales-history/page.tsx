"use client";

import { useMemo, useState } from "react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import SalesHistoryTable from "@/components/custom/common/back-office/sales-history/sales-history-table";
import VoidItemsDialog from "@/components/custom/common/back-office/sales-history/void-items-dialog";
import SearchBar from "@/components/custom/common/pos/search-bar";
import { Input } from "@/components/ui/input";
import { customers } from "@/lib/types/model/customers";
import { getReceiptNumber, sales as initialSales, type Sale } from "@/lib/types/model/sales";
import type { VoidReason } from "@/lib/types/model/voids";

export default function SalesHistoryPage() {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [salesRows, setSalesRows] = useState<Sale[]>(initialSales);
  const [voidingSale, setVoidingSale] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();
    return salesRows.filter((sale) => {
      const customerName =
        customers.find((customer) => customer.id === sale.customerId)?.name ??
        "Walk-in";
      const matchesQuery =
        query === "" ||
        getReceiptNumber(sale.id).toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query);
      const matchesDate =
        date === "" || sale.completedAt?.slice(0, 10) === date;
      return matchesQuery && matchesDate;
    });
  }, [search, date, salesRows]);

  const confirmVoid = (itemIds: number[], reason: VoidReason) => {
    if (!voidingSale) return;
    console.log(
      "Sales History - void items:",
      voidingSale.id,
      itemIds,
      reason,
    );

    // No per-item void modeled yet (schema voids at the sale level) — marks
    // the whole sale voided regardless of which items were checked.
    setSalesRows((rows) =>
      rows.map((sale) =>
        sale.id === voidingSale.id ? { ...sale, status: "voided" } : sale,
      ),
    );
    setVoidingSale(null);
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Sales History"
        subtitle={`${filteredSales.length} receipts · ${salesRows.length} total`}
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
        <SalesHistoryTable sales={filteredSales} onVoid={setVoidingSale} />
      </div>

      <VoidItemsDialog
        // Remounts on every open so its internal selection/reason state starts fresh.
        key={voidingSale?.id ?? "void-items-dialog"}
        sale={voidingSale}
        onClose={() => setVoidingSale(null)}
        onConfirm={confirmVoid}
      />
    </main>
  );
}
