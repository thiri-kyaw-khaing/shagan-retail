import { ArrowRight } from "lucide-react";
import CustomButton from "@/components/custom/common/custom-button";
import { useTranslation } from "@/lib/i18n/use-translation";

type MobileCartBarProps = {
  itemCount: number;
  totalLabel: string;
  disabled: boolean;
  onViewCart: () => void;
};

export default function MobileCartBar({
  itemCount,
  totalLabel,
  disabled,
  onViewCart,
}: MobileCartBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex shrink-0 items-center gap-3 border-t bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-500">
          {itemCount} {t("sell.itemsSuffix")}
        </p>
        <p className="truncate text-xl font-bold text-rose-900">
          {totalLabel}
        </p>
      </div>
      <CustomButton
        label={t("sell.viewCart")}
        icon={ArrowRight}
        onClick={onViewCart}
        disabled={disabled}
        className="min-h-14 min-w-36 bg-brand px-5 font-bold text-white hover:bg-brand/90 disabled:bg-rose-200"
      />
    </div>
  );
}
