"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import FilterSelect from "@/components/custom/common/back-office/filter-select";
import CustomButton from "@/components/custom/common/custom-button";
import FormError from "@/components/custom/common/forms/form-error";
import NoticeBanner from "@/components/custom/common/notice-banner";
import ManagerApprovalStep from "@/components/custom/common/pos/manager-approval-step";
import QuantityStepper from "@/components/custom/common/quantity-stepper";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { decimalToNumber } from "@/lib/api/mappers";
import { useTranslation } from "@/lib/i18n/use-translation";
import { requestDiscountApprovalAction } from "@/lib/pos/actions";
import { discountedUnitPrice } from "@/lib/pos/pricing";
import type { CartCustomDiscount, CartItemData } from "@/lib/types/model/cart";

type CustomDiscountDialogProps = {
  /** The cart line being discounted; null = closed. */
  line: CartItemData | null;
  percent: number;
  /** Staff at this branch who may approve someone else's discount (not the cashier). */
  approvers: { id: number; name: string }[];
  /** The cashier approves their own - no PIN pad. */
  canSelfApprove: boolean;
  onClose: () => void;
  onApproved: (lineId: string, discount: CartCustomDiscount) => void;
};

/**
 * A custom % discount on one cart line, approved the moment it's added
 * (Discount V1): pick how many units and an optional reason, then a manager
 * enters their PIN - or the cashier confirms, when their role approves their
 * own. Payment never asks again.
 */
export default function CustomDiscountDialog(props: CustomDiscountDialogProps) {
  // Keyed by line, so every opening starts fresh.
  return props.line ? <DiscountDialogBody key={`${props.line.lineId}-${props.percent}`} {...props} line={props.line} /> : null;
}

function DiscountDialogBody({
  line,
  percent,
  approvers,
  canSelfApprove,
  onClose,
  onApproved,
}: CustomDiscountDialogProps & { line: CartItemData }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [qty, setQty] = useState(line.quantity);
  const [reason, setReason] = useState("");
  const [step, setStep] = useState<"details" | "pin">("details");
  const [approverId, setApproverId] = useState(approvers[0] ? String(approvers[0].id) : "");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const newPrice = discountedUnitPrice(line.price, percent);
  const catalogPercent = line.catalogPercent ?? 0;
  const noApprover = !canSelfApprove && approvers.length === 0;

  const request = (approver?: { approver_staff_id: number; pin: string }) => {
    setError(null);
    startTransition(async () => {
      const result = await requestDiscountApprovalAction({
        product_id: line.productId,
        percent: String(percent),
        qty,
        reason,
        ...approver,
      });
      if (!result.ok) {
        if (result.signedOut) router.push("/pos/select-staff");
        setError(result.error);
        setPin("");
        return;
      }
      onApproved(line.lineId, {
        approvalId: result.data.id,
        percent: decimalToNumber(result.data.percent),
        maxQty: result.data.max_qty,
        unitSalePrice: decimalToNumber(result.data.unit_sale_price),
        approvedBy: result.data.approved_by.name,
        reason: reason.trim(),
      });
      onClose();
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        {step === "details" ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("discount.title")}</DialogTitle>
              <DialogDescription>
                {percent}% {t("discount.offOn")} {line.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="text-sm text-slate-500">{t("discount.pricePerUnit")}</span>
                <span className="font-semibold text-slate-900">
                  <s className="mr-2 font-normal text-slate-400">K {line.price.toLocaleString()}</s>
                  K {newPrice.toLocaleString()}
                </span>
              </div>

              {line.quantity > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    {t("discount.units")} ({t("discount.ofPrefix")} {line.quantity})
                  </span>
                  <QuantityStepper value={qty} min={1} max={line.quantity} onChange={setQty} />
                </div>
              )}

              {catalogPercent > percent && (
                <NoticeBanner tone="amber" title={`${t("discount.smallerThanCatalog")} (${catalogPercent}%)`}>
                  {t("discount.smallerThanCatalogHint")}
                </NoticeBanner>
              )}

              <div>
                <label htmlFor="discount-reason" className="text-sm text-slate-600">
                  {t("discount.reason")}
                </label>
                <Input
                  id="discount-reason"
                  value={reason}
                  maxLength={200}
                  placeholder={t("discount.reasonPlaceholder")}
                  onChange={(event) => setReason(event.target.value)}
                  className="mt-1 h-11"
                />
              </div>

              {noApprover && <FormError message={t("discount.noApprover")} />}
              <FormError message={error} />

              <div className="grid grid-cols-2 gap-2">
                <CustomButton
                  label={t("discount.cancel")}
                  onClick={onClose}
                  disabled={isPending}
                  className="min-h-12 border border-slate-200 bg-white text-slate-600 shadow-none hover:bg-slate-50"
                />
                <CustomButton
                  label={
                    isPending ? t("discount.checking") : canSelfApprove ? t("discount.apply") : t("discount.askApproval")
                  }
                  onClick={() => (canSelfApprove ? request() : setStep("pin"))}
                  disabled={isPending || noApprover}
                  className="min-h-12 bg-brand font-semibold text-white hover:bg-brand/90 disabled:bg-rose-200"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>{t("discount.approvalTitle")}</DialogTitle>
            </DialogHeader>
            <ManagerApprovalStep
              title={t("discount.approvalTitle")}
              subtitle={`${percent}% ${t("discount.offOn")} ${qty} × ${line.name}`}
              pin={pin}
              onPinChange={(next) => {
                setError(null);
                setPin(next.slice(0, 6));
              }}
              onSubmit={() => request({ approver_staff_id: Number(approverId), pin })}
              pending={isPending}
              error={error}
            >
              <FilterSelect
                aria-label={t("discount.approver")}
                value={approverId}
                onChange={setApproverId}
                options={approvers.map((a) => ({ value: String(a.id), label: a.name }))}
              />
            </ManagerApprovalStep>
            <CustomButton
              label={`← ${t("discount.back")}`}
              onClick={() => {
                setError(null);
                setPin("");
                setStep("details");
              }}
              disabled={isPending}
              className="mx-auto flex border border-slate-200 bg-white text-slate-600 shadow-none hover:bg-slate-50"
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
