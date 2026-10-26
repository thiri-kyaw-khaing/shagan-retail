"use client";

import { useEffect, useState, useTransition } from "react";

import CustomButton from "@/components/custom/common/custom-button";
import FormError from "@/components/custom/common/forms/form-error";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { decimalToNumber } from "@/lib/api/mappers";
import type { ApiBranchPrice } from "@/lib/api/types";
import {
  clearBranchPriceAction,
  listBranchPricesAction,
  setBranchPriceAction,
} from "@/lib/catalog/actions";
import type { Product } from "@/lib/types/model/product";
import { cn } from "@/lib/utils";

type BranchPricesDialogProps = {
  product: Product;
  /**
   * Whether `product.price` / `discountPercent` are catalog values. False for
   * a manager, whose list is priced for their branch; the rows' own
   * `catalog_*` fields are used instead when the backend sends them.
   */
  catalogKnown: boolean;
  onClose: () => void;
};

const money = (value: number) => `K ${value.toLocaleString()}`;

/**
 * A product's price at every branch (WORKFLOWS §8, "Branch prices"). A blank
 * field inherits the catalog value; the backend works out each branch's sale
 * price. The Owner sees every branch; a manager only their own.
 */
export default function BranchPricesDialog({ product, catalogKnown, onClose }: BranchPricesDialogProps) {
  const [rows, setRows] = useState<ApiBranchPrice[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    void listBranchPricesAction(product.id).then((result) => {
      if (result.ok) setRows(result.data);
      else setLoadError(result.error);
    });
  }, [product.id]);

  const replaceRow = (row: ApiBranchPrice) =>
    setRows((current) => current?.map((r) => (r.branch_id === row.branch_id ? row : r)) ?? null);

  // The catalog values a blank field falls back to, when they're known.
  const fromRow = rows?.find((r) => r.catalog_price !== undefined);
  const catalog = fromRow
    ? {
        price: decimalToNumber(fromRow.catalog_price!),
        percent: decimalToNumber(fromRow.catalog_discount_percent ?? "0"),
      }
    : catalogKnown
      ? { price: product.price, percent: product.discountPercent }
      : null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl border-0 bg-white p-6 sm:max-w-3xl sm:p-8">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold text-slate-800">Prices by branch</DialogTitle>
          <DialogDescription className="text-base text-slate-500">
            {product.name}
            {catalog && (
              <>
                {" "}
                · catalog {money(catalog.price)}
                {catalog.percent > 0 && ` (${catalog.percent}% off)`}
              </>
            )}
            . Leave a field blank to use the catalog value.
          </DialogDescription>
        </DialogHeader>

        <FormError message={loadError} />
        {!rows && !loadError && <p className="text-sm text-slate-500">Loading branches…</p>}
        {rows?.length === 0 && <p className="text-sm text-slate-500">This organisation has no branches.</p>}

        {rows && rows.length > 0 && (
          <div className="divide-y divide-rose-100 rounded-xl border border-rose-100">
            {rows.map((row) => (
              <BranchPriceRow
                key={row.branch_id}
                productId={product.id}
                catalogPrice={catalog?.price ?? null}
                catalogPercent={catalog?.percent ?? null}
                row={row}
                onSaved={replaceRow}
              />
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <CustomButton
            label="Done"
            onClick={onClose}
            className="min-h-11 border border-slate-200 bg-white px-5 text-slate-600 shadow-none hover:bg-slate-50"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

type BranchPriceRowProps = {
  productId: number;
  /** null when the catalog value isn't known here (a manager on an older backend). */
  catalogPrice: number | null;
  catalogPercent: number | null;
  row: ApiBranchPrice;
  onSaved: (row: ApiBranchPrice) => void;
};

/** "" for an inherited (null) value, else the number as typed. */
const draftOf = (value: string | null) => (value === null ? "" : String(decimalToNumber(value)));

function BranchPriceRow({ productId, catalogPrice, catalogPercent, row, onSaved }: BranchPriceRowProps) {
  const [price, setPrice] = useState(() => draftOf(row.price));
  const [percent, setPercent] = useState(() => draftOf(row.discount_percent));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const priceValid = price.trim() === "" || Number(price) > 0;
  const percentValid = percent.trim() === "" || (Number(percent) >= 0 && Number(percent) <= 100);
  const changed = price !== draftOf(row.price) || percent !== draftOf(row.discount_percent);
  const overridden = row.price_source === "branch";

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await setBranchPriceAction(productId, row.branch_id, {
        price: price.trim() || null,
        discountPercent: percent.trim() || null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved(result.data);
      setPrice(draftOf(result.data.price));
      setPercent(draftOf(result.data.discount_percent));
    });
  };

  const useCatalog = () => {
    setError(null);
    startTransition(async () => {
      const result = await clearBranchPriceAction(productId, row.branch_id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // The branch now charges the catalog's price; the backend's own figure
      // for its sale price comes with the next load of the list.
      const fresh = await listBranchPricesAction(productId);
      const updated = fresh.ok ? fresh.data.find((r) => r.branch_id === row.branch_id) : undefined;
      if (updated) onSaved(updated);
      setPrice("");
      setPercent("");
    });
  };

  return (
    <div className="grid gap-3 p-4 sm:grid-cols-[1fr_8rem_7rem_11rem] sm:items-end">
      <div>
        <p className="font-semibold text-ink">{row.branch_name}</p>
        <p className="mt-1 text-sm text-ink-muted">
          Sells at{" "}
          <strong className="text-ink">{money(decimalToNumber(row.effective_sale_price))}</strong>
          <span
            className={cn(
              "ml-2 rounded-full px-2 py-0.5 text-xs font-semibold",
              overridden ? "bg-rose-50 text-brand" : "bg-slate-100 text-slate-500",
            )}
          >
            {overridden ? "Own price" : "Catalog"}
          </span>
        </p>
      </div>

      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Price (K)
        <Input
          type="number"
          inputMode="decimal"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder={catalogPrice === null ? "Catalog" : String(catalogPrice)}
          aria-invalid={!priceValid}
          className="mt-1 h-10 border-rose-200 text-base font-normal normal-case tracking-normal text-ink"
        />
      </label>

      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Discount %
        <Input
          type="number"
          inputMode="decimal"
          value={percent}
          onChange={(event) => setPercent(event.target.value)}
          placeholder={catalogPercent === null ? "Catalog" : String(catalogPercent)}
          aria-invalid={!percentValid}
          className="mt-1 h-10 border-rose-200 text-base font-normal normal-case tracking-normal text-ink"
        />
      </label>

      <div className="flex gap-2">
        <CustomButton
          label={isPending ? "Saving…" : "Save"}
          onClick={save}
          disabled={isPending || !changed || !priceValid || !percentValid}
          className="min-h-10 bg-brand px-4 font-semibold text-white hover:bg-brand/90 disabled:bg-rose-200"
        />
        {overridden && (
          <CustomButton
            label="Use catalog"
            onClick={useCatalog}
            disabled={isPending}
            className="min-h-10 border border-slate-200 bg-white px-3 text-slate-600 shadow-none hover:bg-slate-50"
          />
        )}
      </div>

      {(error || !priceValid || !percentValid) && (
        <div className="sm:col-span-4">
          <FormError
            message={
              error ?? (!priceValid ? "Price must be more than 0." : "Discount must be 0 to 100.")
            }
          />
        </div>
      )}
    </div>
  );
}
