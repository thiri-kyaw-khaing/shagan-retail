"use client";

import { useState } from "react";

import FilterSelect from "@/components/custom/common/back-office/filter-select";
import CustomButton from "@/components/custom/common/custom-button";
import FormError from "@/components/custom/common/forms/form-error";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { VoidReasonCode } from "@/lib/sales/actions";
import type { SalesHistoryRow } from "@/lib/types/model/sales";

const REASONS: { value: VoidReasonCode; label: string }[] = [
  { value: "customer_request", label: "Customer request" },
  { value: "price_error", label: "Wrong price" },
  { value: "item_error", label: "Wrong item" },
  { value: "staff_error", label: "Staff mistake" },
  { value: "other", label: "Other" },
];

type VoidSaleDialogProps = {
  sale: SalesHistoryRow;
  onClose: () => void;
  onConfirm: (reason: VoidReasonCode, explanation: string) => void;
  pending?: boolean;
  error?: string | null;
};

/** Whole-sale void (WORKFLOWS §9: no partial voids - that's a Return). */
export default function VoidSaleDialog({ sale, onClose, onConfirm, pending = false, error }: VoidSaleDialogProps) {
  const [reason, setReason] = useState<VoidReasonCode>("customer_request");
  const [explanation, setExplanation] = useState("");
  // The backend requires an explanation on every void.
  const needsExplanation = explanation.trim() === "";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl border-0 bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Void receipt #{sale.receiptNo}?</DialogTitle>
          <DialogDescription>
            {sale.customerName} · K {sale.total.toLocaleString("en-US")} · {sale.completedAtLabel}. The
            whole sale is cancelled and its items go back into stock. Only possible while the
            sale&apos;s shift is still open - after that, use a return.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <FilterSelect
            aria-label="Void reason"
            value={reason}
            onChange={(value) => setReason(value as VoidReasonCode)}
            options={REASONS}
          />
          <Textarea
            aria-label="Explanation"
            placeholder="What happened? (required)"
            value={explanation}
            onChange={(event) => setExplanation(event.target.value)}
            className="border-rose-200"
          />
        </div>

        <FormError message={error} />

        <DialogFooter>
          <CustomButton
            label="Keep sale"
            onClick={onClose}
            className="border border-slate-200 bg-white text-slate-600 shadow-none hover:bg-slate-50"
          />
          <CustomButton
            label={pending ? "Voiding..." : "Void sale"}
            onClick={() => onConfirm(reason, explanation)}
            disabled={pending || needsExplanation}
            className="bg-brand text-white hover:bg-brand/90 disabled:bg-rose-200"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
