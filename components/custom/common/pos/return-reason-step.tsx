import CustomButton from "@/components/custom/common/custom-button";
import LabeledTextarea from "@/components/custom/common/labeled-textarea";
import OptionTiles from "@/components/custom/common/option-tiles";
import { cn } from "@/lib/utils";

export type ItemCondition = "sellable" | "damaged" | "expired" | "other";

const CONDITIONS: { id: ItemCondition; label: string }[] = [
  { id: "sellable", label: "Sellable" },
  { id: "damaged", label: "Damaged" },
  { id: "expired", label: "Expired" },
  { id: "other", label: "Other" },
];

type ReturnReasonStepProps = {
  selectedCount: number;
  refundTotal: number;
  condition: ItemCondition | null;
  onConditionChange: (condition: ItemCondition) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  canContinue: boolean;
  onContinue: () => void;
};

export default function ReturnReasonStep({
  selectedCount,
  refundTotal,
  condition,
  onConditionChange,
  reason,
  onReasonChange,
  canContinue,
  onContinue,
}: ReturnReasonStepProps) {
  return (
    <>
      <p className="mx-4 flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm shadow-sm">
        <span className="text-ink-muted">
          {selectedCount} item{selectedCount === 1 ? "" : "s"}
        </span>
        <span className="font-semibold text-ink">
          K {refundTotal.toLocaleString()}
        </span>
      </p>

      <div className="mx-4 mt-4">
        <h2 className="mb-2 text-sm font-bold text-ink">Item condition</h2>

        <OptionTiles
          options={CONDITIONS}
          value={condition}
          onChange={onConditionChange}
        />

        {condition && condition !== "sellable" && (
          <p className="mt-2 text-xs text-ink-muted">
            ✗ Items will not return to stock
          </p>
        )}
      </div>

      <div className="mx-4 mt-4">
        <LabeledTextarea
          label="Reason for return"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder="e.g. Damaged on arrival, customer changed mind..."
          className="min-h-24"
        />
      </div>

      <div className="m-4">
        <CustomButton
          label="Continue →"
          onClick={onContinue}
          disabled={!canContinue}
          className={cn(
            "w-full h-12 py-3 font-semibold",
            canContinue
              ? "bg-brand text-white hover:bg-brand/90"
              : "bg-rose-200 text-white/80",
          )}
        />
      </div>
    </>
  );
}
