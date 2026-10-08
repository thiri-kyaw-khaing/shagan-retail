"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import ConfirmDialog from "@/components/custom/common/back-office/confirm-dialog";
import PageHeader from "@/components/custom/common/back-office/page-header";
import SupplierFormDialog, {
  type SupplierFormValues,
} from "@/components/custom/common/back-office/supplier-form-dialog";
import DeleteSupplierDialog from "@/components/custom/common/back-office/suppliers/delete-supplier-dialog";
import PurchaseOrderDetailsDialog from "@/components/custom/common/back-office/suppliers/purchase-order-details-dialog";
import PurchaseOrderFormDialog from "@/components/custom/common/back-office/suppliers/purchase-order-form-dialog";
import PurchaseOrderTable from "@/components/custom/common/back-office/suppliers/purchase-order-table";
import ReceiveStockDialog from "@/components/custom/common/back-office/suppliers/receive-stock-dialog";
import SupplierTable from "@/components/custom/common/back-office/suppliers/supplier-table";
import SupplierTabs from "@/components/custom/common/back-office/suppliers/supplier-tabs";
import CustomButton from "@/components/custom/common/custom-button";
import { Input } from "@/components/ui/input";
import { useAction } from "@/lib/api/use-action";
import {
  createPurchaseOrderAction,
  createSupplierAction,
  deleteSupplierAction,
  receivePurchaseOrderAction,
  setPurchaseOrderStatusAction,
  updateSupplierAction,
} from "@/lib/procurement/actions";
import type { PurchaseOrder } from "@/lib/types/model/purchase-orders";
import type { Supplier } from "@/lib/types/model/suppliers";

type Tab = "suppliers" | "orders";
type Option = { value: string; label: string };

type DialogState =
  | { type: "add-supplier" }
  | { type: "edit-supplier" | "delete-supplier"; supplier: Supplier }
  | { type: "new-order" }
  | { type: "view-order" | "approve-order" | "cancel-order" | "receive-order"; order: PurchaseOrder }
  | null;

type SupplierDirectoryProps = {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  branchOptions: Option[];
  productOptions: Option[];
  defaultBranchId: string;
};

const EMPTY_SUPPLIER: SupplierFormValues = { name: "", address: "", phone: "" };

export default function SupplierDirectory({
  suppliers,
  purchaseOrders,
  branchOptions,
  productOptions,
  defaultBranchId,
}: SupplierDirectoryProps) {
  const [activeTab, setActiveTab] = useState<Tab>("suppliers");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);
  const { isPending, error, run, clearError } = useAction();

  const query = search.trim().toLowerCase();

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter((supplier) =>
        [supplier.name, supplier.address, supplier.phone].some((value) =>
          value.toLowerCase().includes(query),
        ),
      ),
    [query, suppliers],
  );

  const filteredOrders = useMemo(
    () =>
      purchaseOrders.filter((order) =>
        [order.poNumber, order.supplier, order.branch, order.date, order.status].some((value) =>
          value.toLowerCase().includes(query),
        ),
      ),
    [query, purchaseOrders],
  );

  // Stable per open dialog, so a failed save doesn't reset the form.
  const supplierValues = useMemo<SupplierFormValues>(
    () =>
      dialog?.type === "edit-supplier"
        ? { name: dialog.supplier.name, address: dialog.supplier.address, phone: dialog.supplier.phone }
        : EMPTY_SUPPLIER,
    [dialog],
  );
  const supplierOptions = useMemo(
    () => suppliers.map((s) => ({ value: String(s.id), label: s.name })),
    [suppliers],
  );

  const close = () => {
    clearError();
    setDialog(null);
  };

  const saveSupplier = (values: SupplierFormValues) => {
    if (dialog?.type === "add-supplier") run(() => createSupplierAction(values), close);
    else if (dialog?.type === "edit-supplier") {
      const id = dialog.supplier.id;
      run(() => updateSupplierAction(id, values), close);
    }
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Supplier"
        subtitle={`${suppliers.length} suppliers · ${purchaseOrders.length} purchase orders`}
        backHref="/owner"
        action={
          <CustomButton
            label={activeTab === "suppliers" ? "Add supplier" : "New PO"}
            icon={Plus}
            onClick={() => setDialog({ type: activeTab === "suppliers" ? "add-supplier" : "new-order" })}
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
            onEdit={(supplier) => setDialog({ type: "edit-supplier", supplier })}
            onDelete={(supplier) => setDialog({ type: "delete-supplier", supplier })}
          />
        ) : (
          <PurchaseOrderTable
            orders={filteredOrders}
            onView={(order) => setDialog({ type: "view-order", order })}
            onApprove={(order) => setDialog({ type: "approve-order", order })}
            onCancel={(order) => setDialog({ type: "cancel-order", order })}
            onReceive={(order) => setDialog({ type: "receive-order", order })}
          />
        )}
      </div>

      {(dialog?.type === "add-supplier" || dialog?.type === "edit-supplier") && (
        <SupplierFormDialog
          mode={dialog.type === "add-supplier" ? "add" : "edit"}
          isOpen
          values={supplierValues}
          onClose={close}
          onSave={saveSupplier}
          pending={isPending}
          error={error}
        />
      )}

      <DeleteSupplierDialog
        supplier={dialog?.type === "delete-supplier" ? dialog.supplier : null}
        onClose={close}
        onConfirm={() => {
          if (dialog?.type !== "delete-supplier") return;
          const id = dialog.supplier.id;
          run(() => deleteSupplierAction(id), close);
        }}
        pending={isPending}
        error={error}
      />

      {dialog?.type === "new-order" && (
        <PurchaseOrderFormDialog
          branchOptions={branchOptions}
          supplierOptions={supplierOptions}
          productOptions={productOptions}
          defaultBranchId={defaultBranchId}
          onClose={close}
          onSave={(order) => run(() => createPurchaseOrderAction(order), close)}
          pending={isPending}
          error={error}
        />
      )}

      <PurchaseOrderDetailsDialog
        order={dialog?.type === "view-order" ? dialog.order : null}
        onClose={close}
      />

      {dialog?.type === "approve-order" && (
        <ConfirmDialog
          title={`Approve ${dialog.order.poNumber}?`}
          description={`${dialog.order.supplier} · ${dialog.order.branch}. Once approved, the order can be received when the goods arrive.`}
          confirmLabel="Approve"
          onClose={close}
          onConfirm={() => run(() => setPurchaseOrderStatusAction(dialog.order.id, "approved"), close)}
          pending={isPending}
          error={error}
        />
      )}

      {dialog?.type === "cancel-order" && (
        <ConfirmDialog
          title={`Cancel ${dialog.order.poNumber}?`}
          description="A cancelled order can't be reopened or received."
          confirmLabel="Cancel order"
          onClose={close}
          onConfirm={() => run(() => setPurchaseOrderStatusAction(dialog.order.id, "cancelled"), close)}
          pending={isPending}
          error={error}
        />
      )}

      {dialog?.type === "receive-order" && (
        <ReceiveStockDialog
          order={dialog.order}
          onClose={close}
          onConfirm={(lines) => run(() => receivePurchaseOrderAction(dialog.order.id, lines), close)}
          pending={isPending}
          error={error}
        />
      )}
    </main>
  );
}
