"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import CustomerTable from "@/components/custom/common/back-office/customers/customer-table";
import CustomerFormDialog, {
  type CustomerFormValues,
} from "@/components/custom/common/back-office/customers/customer-form-dialog";
import CustomButton from "@/components/custom/common/custom-button";
import { Input } from "@/components/ui/input";
import { customers as initialCustomers, type Customer } from "@/lib/types/model/customers";

export default function CustomersPage() {
  const [customerRows, setCustomerRows] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customerRows;

    return customerRows.filter((customer) =>
      [customer.name, customer.phone].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [search, customerRows]);

  const addCustomer = (values: CustomerFormValues) => {
    setCustomerRows((rows) => [
      ...rows,
      {
        id: Date.now(),
        name: values.name,
        phone: values.phone,
        email: values.email,
        visits: 0,
        lifetimeSpend: 0,
      },
    ]);
    setIsAddOpen(false);
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Customer"
        subtitle={`${filteredCustomers.length} of ${customerRows.length} customers`}
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
          existingPhones={customerRows.map((customer) => customer.phone)}
          onClose={() => setIsAddOpen(false)}
          onSave={addCustomer}
        />
      )}
    </main>
  );
}
