import NumPad from "@/components/custom/common/numpad";
import { useTranslation } from "@/lib/i18n/use-translation";

type CashCountPanelProps = {
  value: string;
  onChange: (value: string) => void;
  displayValue: string;
};

export default function CashCountPanel({
  value,
  onChange,
  displayValue,
}: CashCountPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="min-w-0 space-y-3">
      <div className="rounded-xl border border-brand bg-white px-5 py-4 ring-2 ring-rose-50">
        <label htmlFor="counted-cash" className="block text-sm text-slate-500">
          {t("closeShift.countedCashLabel")}
        </label>

        <input
          id="counted-cash"
          type="text"
          readOnly
          value={displayValue}
          placeholder="K 0"
          className="mt-2 w-full bg-transparent text-right text-3xl font-bold text-slate-800 outline-none placeholder:text-slate-300"
        />
      </div>

      <NumPad value={value} onChange={onChange} mode="cash" large />
    </div>
  );
}
