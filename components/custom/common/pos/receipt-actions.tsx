"use client";

import { useRouter } from "next/navigation";
import CustomButton from "@/components/custom/common/custom-button";
import type { SaleId } from "@/lib/types/model/sales";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

const actionClass =
  "rounded-xl h-12 border-2 border-slate-300 bg-white py-3 text-sm text-ink hover:border-slate-400 hover:bg-slate-50";

type ReceiptActionsProps = {
  saleId: SaleId;
  onReprint?: () => void;
  reprinting?: boolean;
  /** False once nothing on the sale can come back (all returned/exchanged). */
  canReturn?: boolean;
  /** False once the sale has a return or exchange - the backend refuses a void then. */
  canVoid?: boolean;
};

export default function ReceiptActions({
  saleId,
  onReprint,
  reprinting = false,
  canReturn = true,
  canVoid = true,
}: ReceiptActionsProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="space-y-2 p-2">
      {canReturn && (
        <div className="grid grid-cols-2 gap-2">
          <CustomButton
            label={`← ${t("receiptDetail.returnItems")}`}
            onClick={() => router.push(`/pos/sales-history/${saleId}/return`)}
            className={actionClass}
          />
          <CustomButton
            label={`⟲ ${t("receiptDetail.exchangeItems")}`}
            onClick={() => router.push(`/pos/sales-history/${saleId}/exchange`)}
            className={actionClass}
          />
        </div>
      )}

      <CustomButton
        label={reprinting ? "Printing..." : t("receiptDetail.reprintReceipt")}
        onClick={onReprint}
        disabled={reprinting}
        className={cn("w-full", actionClass)}
      />

      {canVoid && (
        <CustomButton
          label={t("receiptDetail.voidSale")}
          onClick={() => router.push(`/pos/sales-history/${saleId}/void`)}
          className="w-full rounded-xl border-2 border-rose-300 bg-white py-3 text-sm text-rose-600 hover:bg-rose-50"
        />
      )}
    </div>
  );
}
