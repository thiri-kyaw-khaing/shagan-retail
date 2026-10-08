"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import CustomerTable, {
  type CustomerRow,
} from "@/components/custom/common/back-office/customers/customer-table";
import { Input } from "@/components/ui/input";

// Read-only for now; Add Customer returns with real writes in Phase 3.
export default function CustomerDirectory({ customers }: { customers: CustomerRow[] }) {
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;

    return customers.filter((customer) =>
      [customer.name, customer.phone].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [search, customers]);

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Customer"
        subtitle={`${filteredCustomers.length} of ${customers.length} customers`}
        backHref="/owner"
      />

      <div className="relative mt-5 max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or phone..."
          className="h-11 rounded-xl border-slate-200 bg-white pl-10"
        />
      </div>

      <div className="mt-5">
        <CustomerTable
          customers={filteredCustomers}
          emptyMessage={
            search.trim()
              ? "No customers match your search."
              : "No customers yet."
          }
        />
      </div>
    </main>
  );
}
