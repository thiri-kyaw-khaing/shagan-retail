import CustomButton from "@/components/custom/common/custom-button";
import OptionTiles from "@/components/custom/common/option-tiles";
import SummaryCard from "@/components/custom/common/summary-card";
import {
  CONDITION_LABEL_KEYS,
  type ItemCondition,
} from "@/components/custom/common/pos/return-reason-step";
import type { RefundMethod } from "@/components/custom/common/pos/return-confirm-step";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

type ExchangeConfirmStepProps = {
  returnedCount: number;
  condition: ItemCondition;
  returnedValue: number;
  replacementValue: number;
  netDifference: number;
  method: RefundMethod | null;
  onMethodChange: (method: RefundMethod) => void;
  onSubmit: () => void;
};

export default function ExchangeConfirmStep({
  returnedCount,
  condition,
  returnedValue,
  replacementValue,
  netDifference,
  method,
  onMethodChange,
  onSubmit,
}: ExchangeConfirmStepProps) {
  const { t } = useTranslation();

  const methods: { id: RefundMethod; label: string }[] = [
    { id: "cash", label: t("return.cash") },
    { id: "qr", label: t("return.qr") },
  ];

  const netLabel =
    netDifference < 0
      ? t("exchange.refundDue")
      : netDifference > 0
        ? t("exchange.amountDue")
        : t("exchange.evenExchange");

  const canContinue = netDifference === 0 || method !== null;

  return (
    <>
      <div className="mx-4">
        <SummaryCard
          rows={[
            {
              label: t("exchange.itemsReturned"),
              value: `${returnedCount} · K ${returnedValue.toLocaleString()}`,
            },
            {
              label: t("return.itemCondition"),
              value: t(CONDITION_LABEL_KEYS[condition]),
            },
            {
              label: t("exchange.itemsReceived"),
              value: `K ${replacementValue.toLocaleString()}`,
            },
            {
              label: netLabel,
              value: `K ${Math.abs(netDifference).toLocaleString()}`,
              emphasize: true,
            },
          ]}
        />
      </div>

      {netDifference !== 0 && (
        <div className="mx-4 mt-4">
          <h2 className="mb-2 text-sm font-bold text-ink">
            {netDifference < 0
              ? t("return.refundMethod")
              : t("exchange.paymentMethod")}
          </h2>

          <OptionTiles options={methods} value={method} onChange={onMethodChange} />
        </div>
      )}

      <div className="m-4">
        <CustomButton
          label={`${t("exchange.confirmExchange")} →`}
          onClick={onSubmit}
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
