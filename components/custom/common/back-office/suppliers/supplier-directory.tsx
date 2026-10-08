"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import PurchaseOrderDetailsDialog from "@/components/custom/common/back-office/suppliers/purchase-order-details-dialog";
import PurchaseOrderTable from "@/components/custom/common/back-office/suppliers/purchase-order-table";
import SupplierTable from "@/components/custom/common/back-office/suppliers/supplier-table";
import SupplierTabs from "@/components/custom/common/back-office/suppliers/supplier-tabs";
import { Input } from "@/components/ui/input";
import type { PurchaseOrder } from "@/lib/types/model/purchase-orders";
import type { Supplier } from "@/lib/types/model/suppliers";

type Tab = "suppliers" | "orders";

type SupplierDirectoryProps = {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
};

// Read-only for now; supplier CRUD, New PO and receiving return in Phase 3.
export default function SupplierDirectory({ suppliers, purchaseOrders }: SupplierDirectoryProps) {
  const [activeTab, setActiveTab] = useState<Tab>("suppliers");
  const [search, setSearch] = useState("");
  const [viewOrder, setViewOrder] = useState<PurchaseOrder | null>(null);

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

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Supplier"
        subtitle={`${suppliers.length} suppliers · ${purchaseOrders.length} purchase orders`}
        backHref="/owner"
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
          <SupplierTable suppliers={filteredSuppliers} />
        ) : (
          <PurchaseOrderTable orders={filteredOrders} onView={setViewOrder} />
        )}
      </div>

      <PurchaseOrderDetailsDialog order={viewOrder} onClose={() => setViewOrder(null)} />
    </main>
  );
}
