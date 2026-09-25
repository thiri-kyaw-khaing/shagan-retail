"use client";

import { Package, Pencil, Trash2 } from "lucide-react";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/common/back-office/data-table";
import CustomButton from "@/components/custom/common/custom-button";
import type { Category } from "@/lib/types/model/categories";
import type { Product } from "@/lib/types/model/product";
import { cn } from "@/lib/utils";

function categoryLabel(categories: Category[], categoryId: number) {
  return categories.find((category) => category.id === categoryId)?.label ?? "—";
}

function StockBadge({ product }: { product: Product }) {
  const isLow = product.stock <= product.threshold;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        isLow ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-700",
      )}
    >
      {product.stock}
    </span>
  );
}

function ProductImage({ product, size }: { product: Product; size: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-lg bg-slate-100"
      style={{ width: size, height: size }}
    >
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- may be a local blob preview URL, not an optimizable Next.js asset
        <img
          src={product.imageUrl}
          alt={product.name}
          className="size-full object-cover"
        />
      ) : (
        <Package className="absolute inset-0 m-auto size-1/2 text-slate-300" />
      )}
    </div>
  );
}

function ProductThumbnail({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-3">
      <ProductImage product={product} size={40} />
      <span className="font-semibold text-ink">{product.name}</span>
    </div>
  );
}

type ProductTableProps = {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export default function ProductTable({
  products,
  categories,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const columns: DataTableColumn<Product>[] = [
    {
      key: "name",
      header: "Product",
      render: (row) => <ProductThumbnail product={row} />,
    },
    {
      key: "barcode",
      header: "Barcode",
      render: (row) => <span className="font-mono text-xs">{row.barcode}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (row) => categoryLabel(categories, row.categoryId),
    },
    {
      key: "price",
      header: "Price",
      render: (row) => `K ${row.price.toLocaleString()}`,
    },
    {
      key: "stock",
      header: "Stock",
      render: (row) => <StockBadge product={row} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "flex justify-end",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <CustomButton
            icon={Pencil}
            aria-label={`Edit ${row.name}`}
            onClick={() => onEdit(row)}
            className="size-10 bg-transparent p-0 text-slate-500 shadow-none hover:bg-slate-50"
          />
          <CustomButton
            icon={Trash2}
            aria-label={`Delete ${row.name}`}
            onClick={() => onDelete(row)}
            className="size-10 bg-transparent p-0 text-brand shadow-none hover:bg-rose-50"
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      getRowKey={(row) => row.id}
      emptyMessage="No products found."
      mobileCard={(row) => (
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <ProductImage product={row} size={48} />
            <div>
              <p className="font-semibold text-ink">{row.name}</p>
              <p className="text-sm text-ink-muted">
                {categoryLabel(categories, row.categoryId)} · {row.barcode}
              </p>
              <p className="mt-1 font-semibold text-ink">
                K {row.price.toLocaleString()}
              </p>
              <div className="mt-2">
                <StockBadge product={row} />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-1">
            <CustomButton
              icon={Pencil}
              aria-label={`Edit ${row.name}`}
              onClick={() => onEdit(row)}
              className="size-9 bg-transparent p-0 text-slate-500 shadow-none hover:bg-slate-50"
            />
            <CustomButton
              icon={Trash2}
              aria-label={`Delete ${row.name}`}
              onClick={() => onDelete(row)}
              className="size-9 bg-transparent p-0 text-brand shadow-none hover:bg-rose-50"
            />
          </div>
        </div>
      )}
    />
  );
}
