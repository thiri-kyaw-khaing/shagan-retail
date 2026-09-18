import Image from "next/image";
import { Check } from "lucide-react";

import QuantityStepper from "@/components/custom/common/quantity-stepper";
import type { SaleItem } from "@/lib/types/model/sale-items";
import { cn } from "@/lib/utils";

type ReturnItemRowProps = {
  item: SaleItem;
  returnQty: number;
  onChange: (returnQty: number) => void;
};

export default function ReturnItemRow({
  item,
  returnQty,
  onChange,
}: ReturnItemRowProps) {
  const selected = returnQty > 0;
  const lineTotal = selected
    ? item.unitPrice * returnQty
    : item.unitPrice * item.quantity;

  const toggle = () => onChange(selected ? 0 : 1);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={toggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      }}
      aria-pressed={selected}
      aria-label={selected ? `Remove ${item.name}` : `Select ${item.name}`}
      className={cn(
        "flex cursor-pointer items-center gap-3 p-4 transition",
        selected
          ? "rounded-xl border border-rose-800 bg-white"
          : "border-b border-slate-100 last:border-b-0 hover:bg-slate-50",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition",
          selected
            ? "border-rose-800 bg-rose-800 text-white"
            : "border-slate-300 bg-white",
        )}
      >
        {selected && <Check className="size-3.5" />}
      </span>

      <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-slate-100">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="44px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900">{item.name}</p>

        {selected ? (
          <div className="mt-1" onClick={(event) => event.stopPropagation()}>
            <QuantityStepper
              value={returnQty}
              min={0}
              max={item.quantity}
              onChange={onChange}
              size="sm"
            />
          </div>
        ) : (
          <p className="text-sm text-ink-muted">×{item.quantity}</p>
        )}
      </div>

      <p className="shrink-0 font-bold text-slate-900">
        K {lineTotal.toLocaleString()}
      </p>
    </div>
  );
}
