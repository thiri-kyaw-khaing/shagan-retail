"use client";

import { Printer } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";

type ReceiptFormActionsProps = {
  canSave: boolean;
  /** Omit to disable (the org default has no printer to test). */
  onPrintTest?: () => void;
  onCancel: () => void;
  pending?: boolean;
};

export default function ReceiptFormActions({
  canSave,
  onPrintTest,
  onCancel,
  pending = false,
}: ReceiptFormActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <CustomButton
        label="Print Test Receipt"
        icon={Printer}
        onClick={onPrintTest}
        disabled={!onPrintTest || pending}
        className="h-11 border-2 border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50"
      />

      <div className="flex gap-3">
        <CustomButton
          label="Cancel"
          onClick={onCancel}
          className="h-11 border-2 border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50"
        />
        <CustomButton
          label={pending ? "Saving..." : "Save Changes"}
          type="submit"
          disabled={!canSave || pending}
          className="h-11 bg-brand font-semibold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-rose-200"
        />
      </div>
    </div>
  );
}
