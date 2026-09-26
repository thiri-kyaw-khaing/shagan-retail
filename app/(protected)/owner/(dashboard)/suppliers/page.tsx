"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import SupplierFormDialog from "@/components/custom/common/back-office/supplier-form-dialog";
import DeleteSupplierDialog from "@/components/custom/common/back-office/suppliers/delete-supplier-dialog";
import PurchaseOrderDetailsDialog from "@/components/custom/common/back-office/suppliers/purchase-order-details-dialog";
import PurchaseOrderTable from "@/components/custom/common/back-office/suppliers/purchase-order-table";
import ReceiveStockDialog from "@/components/custom/common/back-office/suppliers/receive-stock-dialog";
import SupplierTable from "@/components/custom/common/back-office/suppliers/supplier-table";
import SupplierTabs from "@/components/custom/common/back-office/suppliers/supplier-tabs";
import CustomButton from "@/components/custom/common/custom-button";
import { Input } from "@/components/ui/input";
import {
  purchaseOrders,
  type PurchaseOrder,
} from "@/lib/types/model/purchase-orders";
import { suppliers, type Supplier } from "@/lib/types/model/suppliers";
import type { SupplierFormValues } from "@/components/custom/common/back-office/supplier-form-dialog";

type Tab = "suppliers" | "orders";
type SupplierDialog = {
  type: "add" | "edit" | "delete";
  supplier?: Supplier;
} | null;

export default function SuppliersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("suppliers");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<SupplierDialog>(null);
  const [viewOrder, setViewOrder] = useState<PurchaseOrder | null>(null);
  const [receiveOrder, setReceiveOrder] = useState<PurchaseOrder | null>(null);
  const [supplierRows, setSupplierRows] = useState<Supplier[]>(suppliers);
  const [formValues, setFormValues] = useState({
    name: "",
    contact: "",
    phone: "",
  });

  const isSupplierFormOpen = dialog?.type === "add" || dialog?.type === "edit";
  const supplierFormMode = dialog?.type === "edit" ? "edit" : "add";

  const openSupplierDialog = (nextDialog: SupplierDialog) => {
    setDialog(nextDialog);
    setFormValues(
      nextDialog?.supplier
        ? {
            name: nextDialog.supplier.name,
            contact: nextDialog.supplier.contact,
            phone: nextDialog.supplier.phone,
          }
        : { name: "", contact: "", phone: "" },
    );
  };

  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return supplierRows.filter((supplier) =>
      [supplier.name, supplier.contact, supplier.phone].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [search, supplierRows]);

  const saveSupplier = (values: typeof formValues) => {
    if (!dialog || dialog.type === "delete" || !values.name.trim()) return;

    if (dialog.type === "add") {
      setSupplierRows((rows) => [
        ...rows,
        {
          id: Date.now(),
          name: values.name.trim(),
          contact: values.contact.trim(),
          phone: values.phone.trim(),
          lastOrder: "-",
        },
      ]);
    } else if (dialog.supplier) {
      setSupplierRows((rows) =>
        rows.map((supplier) =>
          supplier.id === dialog.supplier?.id
            ? {
                ...supplier,
                name: values.name.trim(),
                contact: values.contact.trim(),
                phone: values.phone.trim(),
              }
            : supplier,
        ),
      );
    }

    setDialog(null);
  };

  const deleteSupplier = () => {
    if (dialog?.type !== "delete" || !dialog.supplier) return;

    setSupplierRows((rows) =>
      rows.filter((supplier) => supplier.id !== dialog.supplier?.id),
    );
    setDialog(null);
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return purchaseOrders.filter((order) =>
      [order.id, order.supplier, order.date, order.status].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [search]);

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Supplier"
        subtitle={`${supplierRows.length} suppliers · ${purchaseOrders.length} purchase orders`}
        backHref="/owner"
        action={
          <CustomButton
            label={activeTab === "suppliers" ? "Add supplier" : "New PO"}
            icon={Plus}
            onClick={() => openSupplierDialog({ type: "add" })}
            className="min-h-11 bg-brand px-4 font-semibold text-white hover:bg-brand/90"
          />
        }
      />

      <SupplierTabs
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          setSearch("");
        }}
      />

      <div className="relative mt-5 max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            activeTab === "orders"
              ? "Search by PO number or supplier..."
              : "Search suppliers..."
          }
          className="h-11 rounded-xl border-slate-200 bg-white pl-10"
        />
      </div>

      <div className="mt-5">
        {activeTab === "suppliers" ? (
          <SupplierTable
            suppliers={filteredSuppliers}
            onEdit={(supplier) =>
              openSupplierDialog({ type: "edit", supplier })
            }
            onDelete={(supplier) =>
              openSupplierDialog({ type: "delete", supplier })
            }
          />
        ) : (
          <PurchaseOrderTable
            orders={filteredOrders}
            onView={setViewOrder}
            onReceive={setReceiveOrder}
          />
        )}
      </div>

      {isSupplierFormOpen && (
        <SupplierFormDialog
          mode={supplierFormMode}
          isOpen
          values={formValues}
          onClose={() => setDialog(null)}
          onSave={saveSupplier}
        />
      )}

      <DeleteSupplierDialog
        supplier={dialog?.type === "delete" ? (dialog.supplier ?? null) : null}
        onClose={() => setDialog(null)}
        onConfirm={deleteSupplier}
      />
      <PurchaseOrderDetailsDialog
        order={viewOrder}
        onClose={() => setViewOrder(null)}
      />
      <ReceiveStockDialog
        order={receiveOrder}
        onClose={() => setReceiveOrder(null)}
        onConfirm={() => setReceiveOrder(null)}
      />
    </main>
  );
}
