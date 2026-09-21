import { LockKeyhole, PanelsTopLeft } from "lucide-react";
import BackButton from "@/components/custom/common/back-button";
import CustomButton from "@/components/custom/common/custom-button";
import { useTranslation } from "@/lib/i18n/use-translation";

type CloseShiftHeaderProps = {
  branchName: string;
  staffName: string;
  onOpenDrawer: () => void;
};

export default function CloseShiftHeader({
  branchName,
  staffName,
  onOpenDrawer,
}: CloseShiftHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-rose-200 bg-rose-50 px-5 py-5 sm:px-6">
      <div className="flex items-center gap-3">
        <BackButton
          href="/pos/sell"
          className="size-11 shrink-0 bg-transparent p-0 text-slate-600 shadow-none hover:bg-rose-100"
        />

        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-100">
          <LockKeyhole aria-hidden="true" className="size-5 text-rose-700" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {t("closeShift.title")}
          </h1>

          <p className="text-sm text-slate-500">
            {branchName} · {staffName}
          </p>
        </div>
      </div>

      <CustomButton
        label={t("closeShift.openDrawer")}
        icon={PanelsTopLeft}
        onClick={onOpenDrawer}
        className="min-h-11 rounded-xl border-2 border-rose-300 bg-white px-4 text-slate-700 shadow-none hover:bg-rose-100"
      />
    </header>
  );
}
