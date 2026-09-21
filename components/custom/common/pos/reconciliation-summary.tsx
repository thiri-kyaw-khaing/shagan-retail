import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

type ReconciliationSummaryProps = {
  hasCashCount: boolean;
  expectedCash: number;
  countedCash: number;
  difference: number;
  formatMoney: (amount: number) => string;
};

export default function ReconciliationSummary({
  hasCashCount,
  expectedCash,
  countedCash,
  difference,
  formatMoney,
}: ReconciliationSummaryProps) {
  const { t } = useTranslation();

  if (!hasCashCount) {
    return (
      <p className="rounded-xl border border-rose-100 p-4 text-center text-slate-500">
        {t("closeShift.enterCashPrompt")}
      </p>
    );
  }

  return (
    <dl className="space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-5">
      <div className="flex justify-between gap-4">
        <dt className="text-slate-500">{t("closeShift.expected")}</dt>
        <dd className="font-semibold text-slate-800">
          {formatMoney(expectedCash)}
        </dd>
      </div>

      <div className="flex justify-between gap-4">
        <dt className="text-slate-500">{t("closeShift.counted")}</dt>
        <dd className="font-semibold text-slate-800">
          {formatMoney(countedCash)}
        </dd>
      </div>

      <div className="flex justify-between gap-4 border-t border-rose-200 pt-3">
        <dt className="font-semibold text-slate-500">
          {t("closeShift.difference")}
        </dt>

        <dd
          className={cn(
            "font-bold",
            difference > 0 && "text-emerald-600",
            difference < 0 && "text-rose-700",
            difference === 0 && "text-slate-800",
          )}
        >
          {difference > 0 ? "+" : difference < 0 ? "−" : ""}
          {formatMoney(Math.abs(difference))}
        </dd>
      </div>
    </dl>
  );
}
