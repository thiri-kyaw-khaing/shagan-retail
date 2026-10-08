"use client";

import { useMemo, useState } from "react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import SalesHistoryTable from "@/components/custom/common/back-office/sales-history/sales-history-table";
import VoidSaleDialog from "@/components/custom/common/back-office/sales-history/void-sale-dialog";
import SearchBar from "@/components/custom/common/pos/search-bar";
import { Input } from "@/components/ui/input";
import { useAction } from "@/lib/api/use-action";
import { voidSaleAction } from "@/lib/sales/actions";
import type { SalesHistoryRow } from "@/lib/types/model/sales";

type SalesHistoryViewProps = {
  /** The latest page of receipts. */
  sales: SalesHistoryRow[];
  /** All receipts in scope, including older ones not loaded. */
  totalCount: number;
};

export default function SalesHistoryView({ sales, totalCount }: SalesHistoryViewProps) {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [voiding, setVoiding] = useState<SalesHistoryRow | null>(null);
  const { isPending, error, run, clearError } = useAction();

  const closeVoid = () => {
    clearError();
    setVoiding(null);
  };

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
        subtitle={
          totalCount > sales.length
            ? `${filteredSales.length} shown · latest ${sales.length} of ${totalCount} receipts`
            : `${filteredSales.length} receipts · ${sales.length} total`
        }
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
        <SalesHistoryTable sales={filteredSales} onVoid={setVoiding} />
      </div>

      {voiding && (
        <VoidSaleDialog
          sale={voiding}
          onClose={closeVoid}
          onConfirm={(reason, explanation) =>
            run(() => voidSaleAction(voiding.id, reason, explanation), closeVoid)
          }
          pending={isPending}
          error={error}
        />
      )}
    </main>
  );
}
