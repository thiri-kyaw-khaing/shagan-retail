"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import CustomerFormDialog, {
  type CustomerFormValues,
} from "@/components/custom/common/back-office/customers/customer-form-dialog";
import CustomerTable, {
  type CustomerRow,
} from "@/components/custom/common/back-office/customers/customer-table";
import CustomButton from "@/components/custom/common/custom-button";
import { Input } from "@/components/ui/input";
import { useAction } from "@/lib/api/use-action";
import { createCustomerAction } from "@/lib/customers/actions";

export default function CustomerDirectory({ customers }: { customers: CustomerRow[] }) {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { isPending, error, run, clearError } = useAction();
  const existingPhones = useMemo(() => customers.map((c) => c.phone), [customers]);

  const closeAdd = () => {
    clearError();
    setIsAddOpen(false);
  };

  const addCustomer = (values: CustomerFormValues) => {
    run(() => createCustomerAction(values), closeAdd);
  };

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
        action={
          <CustomButton
            label="Add Customer"
            icon={Plus}
            onClick={() => setIsAddOpen(true)}
            className="min-h-11 bg-brand px-4 font-semibold text-white hover:bg-brand/90"
          />
        }
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

      {isAddOpen && (
        <CustomerFormDialog
          isOpen
          existingPhones={existingPhones}
          onClose={closeAdd}
          onSave={addCustomer}
          pending={isPending}
          error={error}
        />
      )}
    </main>
  );
}
