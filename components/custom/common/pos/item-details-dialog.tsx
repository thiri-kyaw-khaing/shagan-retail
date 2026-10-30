"use client";

import { PackageCheck } from "lucide-react";
import type { ReactNode } from "react";

import CustomButton from "@/components/custom/common/custom-button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { SellableCombo } from "@/lib/types/model/combos";
import type { Product } from "@/lib/types/model/product";

/** What a held card shows. Counts are after what's already in the cart. */
export type ItemDetails =
  | { kind: "product"; product: Product; inCart: number; stockLeft: number }
  | { kind: "combo"; combo: SellableCombo; inCart: number; available: number };

type ItemDetailsDialogProps = {
  /** null = closed. */
  details: ItemDetails | null;
  onClose: () => void;
  onAdd: () => void;
};

const money = (amount: number) => `K ${amount.toLocaleString()}`;

/** A product's or combo's details, opened by holding its card in the product grid. */
export default function ItemDetailsDialog({ details, onClose, onAdd }: ItemDetailsDialogProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  if (!details) return null;

  const isProduct = details.kind === "product";
  const name = isProduct ? details.product.name : details.combo.name;
  const imageUrl = isProduct ? details.product.imageUrl : details.combo.imageUrl;
  const canAdd = isProduct ? details.stockLeft > 0 && details.product.isActive : details.available > 0;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- presigned, expiring storage URL; not optimizable
                <img src={imageUrl} alt={name} className="absolute inset-0 size-full object-cover" />
              ) : (
                <PackageCheck className="size-8 text-violet-500" />
              )}
            </div>
            <div className="min-w-0 text-left">
              {!isProduct && (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                  {t("combo.badge")}
                </span>
              )}
              <DialogTitle className="mt-1 text-lg">{name}</DialogTitle>
              <DialogDescription>
                {isProduct ? `${t("details.barcode")}: ${details.product.barcode || "—"}` : null}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <dl className="divide-y divide-slate-100 rounded-xl bg-slate-50 px-4 text-sm">
          {isProduct ? <ProductRows details={details} t={t} /> : <ComboRows details={details} t={t} locale={locale} />}
        </dl>

        <div className="grid grid-cols-2 gap-2">
          <CustomButton
            label={t("details.close")}
            onClick={onClose}
            className="min-h-12 border border-slate-200 bg-white text-slate-600 shadow-none hover:bg-slate-50"
          />
          <CustomButton
            label={t("details.addToCart")}
            onClick={onAdd}
            disabled={!canAdd}
            className="min-h-12 bg-brand font-semibold text-white hover:bg-brand/90 disabled:bg-rose-200"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

type Translate = ReturnType<typeof useTranslation>["t"];

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{children}</dd>
    </div>
  );
}

function ProductRows({ details, t }: { details: Extract<ItemDetails, { kind: "product" }>; t: Translate }) {
  const { product } = details;
  const salePrice = product.price - product.discount;
  // Same rule as the backend: the tax inside one unit at the sale price.
  const unitTax = Math.round((salePrice * product.taxPercent * 100) / (100 + product.taxPercent)) / 100;
  return (
    <>
      <Row label={t("details.price")}>
        <span className="font-bold text-rose-900">{money(salePrice)}</span>
      </Row>
      {product.discount > 0 && (
        <Row label={t("details.discount")}>
          <s className="mr-2 font-normal text-slate-400">{money(product.price)}</s>
          <span className="text-emerald-600">−{product.discountPercent}%</span>
        </Row>
      )}
      {product.taxPercent > 0 && (
        <Row label={t("details.tax")}>
          {product.taxPercent}% · {money(unitTax)} {t("details.perUnit")}
        </Row>
      )}
      <Row label={t("details.inStock")}>
        {details.stockLeft}
        {details.inCart > 0 && (
          <span className="ml-1 font-normal text-slate-400">
            ({details.inCart} {t("details.inCart")})
          </span>
        )}
      </Row>
      {product.modifier && <Row label={t("details.modifier")}>{product.modifier}</Row>}
    </>
  );
}

function ComboRows({
  details,
  t,
  locale,
}: {
  details: Extract<ItemDetails, { kind: "combo" }>;
  t: Translate;
  locale: ReturnType<typeof useLocale>["locale"];
}) {
  const { combo } = details;
  const saves = combo.normalPrice - combo.price;
  return (
    <>
      <Row label={t("details.price")}>
        <span className="font-bold text-rose-900">{money(combo.price)}</span>
      </Row>
      {saves > 0 && (
        <Row label={t("details.normalPrice")}>
          <s className="mr-2 font-normal text-slate-400">{money(combo.normalPrice)}</s>
          <span className="text-emerald-600">
            {t("combo.save")} {money(saves)}
          </span>
        </Row>
      )}
      <Row label={t("combo.contains")}>
        <ul className="space-y-1">
          {combo.parts.map((part) => (
            <li key={part.productId}>
              {part.qty}× {part.name}
              <span className="ml-2 font-normal text-slate-400">{money(part.price * part.qty)}</span>
            </li>
          ))}
        </ul>
      </Row>
      <Row label={t("details.inStock")}>
        {details.available > 0 ? t("combo.available").replace("{count}", String(details.available)) : t("combo.outOfStock")}
        {details.inCart > 0 && (
          <span className="ml-1 font-normal text-slate-400">
            ({details.inCart} {t("details.inCart")})
          </span>
        )}
      </Row>
      <Row label={t("details.ends")}>{formatDate(new Date(combo.expiresAt), locale)}</Row>
    </>
  );
}
