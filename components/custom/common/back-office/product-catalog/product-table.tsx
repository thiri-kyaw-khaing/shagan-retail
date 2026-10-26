"use client";

import { Package, Pencil, Store, Trash2 } from "lucide-react";

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

/**
 * The list price where the list is shown: the branch's (marked when it's the
 * branch's own) or the catalog's. A discount shows as the price it sells at.
 */
function PriceCell({ product, branchName }: { product: Product; branchName: string | null }) {
  const at = product.branchPricing;
  const price = at?.price ?? product.price;
  const percent = at?.discountPercent ?? product.discountPercent;
  const salePrice = at?.salePrice ?? product.price - product.discount;
  return (
    <div className="space-y-1">
      <p className="font-semibold text-ink">
        K {price.toLocaleString()}
        {percent > 0 && salePrice < price && (
          <span className="ml-1 text-xs font-normal text-ink-muted">
            → K {salePrice.toLocaleString()} ({percent}% off)
          </span>
        )}
      </p>
      {at?.overridden && (
        <p className="flex flex-wrap items-center gap-1 text-xs">
          <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-brand">
            {branchName ? `${branchName} price` : "Branch price"}
          </span>
          {at.price !== product.price && (
            <span className="text-ink-muted">catalog K {product.price.toLocaleString()}</span>
          )}
        </p>
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
  /** Omit both for a read-only table. */
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  /** Opens a product's per-branch prices; omit to hide the button. */
  onBranchPrices?: (product: Product) => void;
  branchName?: string | null;
};

export default function ProductTable({
  products,
  categories,
  onEdit,
  onDelete,
  onBranchPrices,
  branchName = null,
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
      render: (row) => <PriceCell product={row} branchName={branchName} />,
    },
    {
      key: "stock",
      header: "Stock",
      render: (row) => <StockBadge product={row} />,
    },
  ];
  if (onEdit && onDelete) {
    columns.push({
      key: "actions",
      header: "Actions",
      className: "flex justify-end",
      render: (row) => (
        <div className="flex justify-end gap-1">
          {onBranchPrices && (
            <CustomButton
              icon={Store}
              aria-label={`Branch prices for ${row.name}`}
              onClick={() => onBranchPrices(row)}
              className="size-10 bg-transparent p-0 text-slate-500 shadow-none hover:bg-slate-50"
            />
          )}
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
    });
  }

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
              <div className="mt-1">
                <PriceCell product={row} branchName={branchName} />
              </div>
              <div className="mt-2">
                <StockBadge product={row} />
              </div>
            </div>
          </div>

          {onEdit && onDelete && (
            <div className="flex shrink-0 flex-col gap-1">
              {onBranchPrices && (
                <CustomButton
                  icon={Store}
                  aria-label={`Branch prices for ${row.name}`}
                  onClick={() => onBranchPrices(row)}
                  className="size-9 bg-transparent p-0 text-slate-500 shadow-none hover:bg-slate-50"
                />
              )}
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
          )}
        </div>
      )}
    />
  );
}
