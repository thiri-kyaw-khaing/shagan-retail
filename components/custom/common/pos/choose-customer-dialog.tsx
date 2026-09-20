"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomButton from "@/components/custom/common/custom-button";
import CustomerListItem from "@/components/custom/common/pos/customer-list-item";
import CreateCustomerForm from "@/components/custom/common/pos/create-customer-form";
import {
  customers as initialCustomers,
  type Customer,
} from "@/lib/types/model/customers";
import { useTranslation } from "@/lib/i18n/use-translation";

type ChooseCustomerDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer | null) => void;
};

export default function ChooseCustomerDialog({
  isOpen,
  onClose,
  onSelect,
}: ChooseCustomerDialogProps) {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const filtered = customers.filter((customer) =>
    `${customer.name} ${customer.phone}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  const handleClose = () => {
    setSearch("");
    setIsCreating(false);
    onClose();
  };

  const handleSelect = (customer: Customer | null) => {
    onSelect(customer);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="flex max-h-[85dvh] flex-col gap-4 overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("customerDialog.title")}</DialogTitle>
        </DialogHeader>

        {isCreating ? (
          <CreateCustomerForm
            onSave={(customer) => {
              setCustomers((current) => [...current, customer]);
              handleSelect(customer);
            }}
          />
        ) : (
          <>
            <Input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("customerDialog.searchPlaceholder")}
              className="border-brand"
            />

            <div className="min-h-0 flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-muted">
                  {t("customerDialog.noResults")}
                </p>
              ) : (
                filtered.map((customer) => (
                  <CustomerListItem
                    key={customer.id}
                    customer={customer}
                    onSelect={handleSelect}
                  />
                ))
              )}
            </div>

            <CustomButton
              label={t("customerDialog.createNew")}
              onClick={() => setIsCreating(true)}
              className="w-full rounded-xl border-2 h-12 border-rose-300 bg-transparent font-semibold text-brand shadow-none hover:bg-rose-50"
            />
          </>
        )}

        <CustomButton
          label={t("customerDialog.continueAsWalkIn")}
          onClick={() => handleSelect(null)}
          className="w-full rounded-xl border-2 h-12 border-slate-300 bg-transparent text-ink-muted shadow-none hover:bg-slate-50"
        />
      </DialogContent>
    </Dialog>
  );
}
