"use client";

import { useRouter } from "next/navigation";
import CustomButton from "@/components/custom/common/custom-button";
import type { SaleId } from "@/lib/types/model/sales";
import { cn } from "@/lib/utils";

const actionClass =
  "rounded-xl border border-slate-200 bg-white py-3 text-sm text-ink hover:border-slate-300 hover:bg-slate-50";

export default function ReceiptActions({ saleId }: { saleId: SaleId }) {
  const router = useRouter();

  return (
    <div className="space-y-2 p-2">
      <div className="grid grid-cols-2 gap-2">
        <CustomButton
          label="← Return Items"
          onClick={() => router.push(`/pos/sales-history/${saleId}/return`)}
          className={actionClass}
        />
        <CustomButton
          label="⟲ Exchange Items"
          onClick={() => router.push(`/pos/sales-history/${saleId}/exchange`)}
          className={actionClass}
        />
      </div>

      <CustomButton
        label="Reprint Receipt"
        className={cn("w-full", actionClass)}
      />

      <CustomButton
        label="Void Sale"
        className="w-full rounded-xl border border-rose-200 bg-white py-3 text-sm text-rose-600 hover:bg-rose-50"
      />
    </div>
  );
}
