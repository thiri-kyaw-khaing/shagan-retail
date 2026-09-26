"use client";

import { Pencil, Trash2 } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import type { Combo } from "@/lib/types/model/combos";
import type { Product } from "@/lib/types/model/product";
import { cn } from "@/lib/utils";

export function isExpired(combo: Combo) {
  return new Date(combo.expiresAt) < new Date();
}

function formatExpiry(expiresAt: string) {
  if (!expiresAt) return "No expiry set";

  return new Date(expiresAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function itemSummary(combo: Combo, products: Product[]) {
  return combo.items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return item.quantity > 1
        ? `${item.quantity}x ${product.name}`
        : product.name;
    })
    .filter(Boolean)
    .join(" + ");
}

function ExpiryBadge({ combo }: { combo: Combo }) {
  const expired = isExpired(combo);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        expired ? "bg-rose-50 text-brand" : "bg-emerald-50 text-emerald-700",
      )}
    >
      {expired ? "Expired" : "Active"}
    </span>
  );
}

type ComboTableProps = {
  combos: Combo[];
  products: Product[];
  onEdit: (combo: Combo) => void;
  onDelete: (combo: Combo) => void;
};

export default function ComboTable({
  combos,
  products,
  onEdit,
  onDelete,
}: ComboTableProps) {
  if (combos.length === 0) {
    return (
      <div className="rounded-xl border border-rose-200 bg-white p-8 text-center text-sm text-slate-500">
        No combos found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white">
      {combos.map((combo) => (
        <div
          key={combo.id}
          className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-ink">{combo.name}</span>
              <ExpiryBadge combo={combo} />
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              {itemSummary(combo, products) || "No items"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Expires {formatExpiry(combo.expiresAt)}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="font-bold text-black">
              K {combo.price.toLocaleString()}
            </span>
            <div className="flex gap-1">
              <CustomButton
                icon={Pencil}
                aria-label={`Edit ${combo.name}`}
                onClick={() => onEdit(combo)}
                className="size-9 bg-transparent p-0 text-slate-500 shadow-none hover:bg-slate-50"
              />
              <CustomButton
                icon={Trash2}
                aria-label={`Delete ${combo.name}`}
                onClick={() => onDelete(combo)}
                className="size-9 bg-transparent p-0 text-brand shadow-none hover:bg-rose-50"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
