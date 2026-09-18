import CustomButton from "@/components/custom/common/custom-button";
import OptionTiles from "@/components/custom/common/option-tiles";
import SummaryCard from "@/components/custom/common/summary-card";
import type { ItemCondition } from "@/components/custom/common/pos/return-reason-step";
import { cn } from "@/lib/utils";

export type RefundMethod = "cash" | "qr";

const REFUND_METHODS: { id: RefundMethod; label: string }[] = [
  { id: "cash", label: "Cash" },
  { id: "qr", label: "QR" },
];

const CONDITION_LABELS: Record<ItemCondition, string> = {
  sellable: "Sellable",
  damaged: "Damaged",
  expired: "Expired",
  other: "Other",
};

type ReturnConfirmStepProps = {
  selectedCount: number;
  condition: ItemCondition;
  refundTotal: number;
  refundMethod: RefundMethod | null;
  onRefundMethodChange: (method: RefundMethod) => void;
  onSubmit: () => void;
};

export default function ReturnConfirmStep({
  selectedCount,
  condition,
  refundTotal,
  refundMethod,
  onRefundMethodChange,
  onSubmit,
}: ReturnConfirmStepProps) {
  return (
    <>
      <div className="mx-4">
        <SummaryCard
          rows={[
            { label: "Items", value: selectedCount },
            { label: "Condition", value: CONDITION_LABELS[condition] },
            {
              label: "Refund",
              value: `K ${refundTotal.toLocaleString()}`,
              emphasize: true,
            },
          ]}
        />
      </div>

      <div className="mx-4 mt-4">
        <h2 className="mb-2 text-sm font-bold text-ink">Refund method</h2>

        <OptionTiles
          options={REFUND_METHODS}
          value={refundMethod}
          onChange={onRefundMethodChange}
        />
      </div>

      <div className="m-4">
        <CustomButton
          label="Request Return →"
          onClick={onSubmit}
          disabled={!refundMethod}
          className={cn(
            "w-full h-12 py-3 font-semibold",
            refundMethod
              ? "bg-brand text-white hover:bg-brand/90"
              : "bg-rose-200 text-white/80",
          )}
        />
      </div>
    </>
  );
}
