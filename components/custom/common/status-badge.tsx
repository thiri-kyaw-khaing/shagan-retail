import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

export default function StatusBadge({ isVoided }: { isVoided: boolean }) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        isVoided
          ? "bg-rose-100 text-rose-700"
          : "bg-emerald-100 text-emerald-700",
      )}
    >
      {isVoided
        ? `✕ ${t("statusBadge.voided")}`
        : `✓ ${t("statusBadge.completed")}`}
    </span>
  );
}
