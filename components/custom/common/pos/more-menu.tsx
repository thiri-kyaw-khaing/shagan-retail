"use client";

import { Settings, Lock } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

type MoreMenuProps = {
  onOpenSettings: () => void;
  onOpenCloseShift: () => void;
};

export default function MoreMenu({ onOpenSettings, onOpenCloseShift }: MoreMenuProps) {
  const { t } = useTranslation();

  return (
    <div className="absolute top-full right-0 z-20 mt-2 w-72 rounded-2xl bg-white p-2 text-ink shadow-xl">
      <button
        type="button"
        onClick={onOpenSettings}
        className="flex w-full items-start gap-3 rounded-xl p-3 text-left hover:bg-muted"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
          <Settings className="h-5 w-5" />
        </span>
        <span>
          <span className="block font-semibold">
            {t("moreMenu.settingsTitle")}
          </span>
          <span className="block text-sm text-ink-muted">
            {t("moreMenu.settingsSubtitle")}
          </span>
        </span>
      </button>

      <div className="my-1 border-t border-border" />

      <button
        type="button"
        onClick={onOpenCloseShift}
        className="flex w-full items-start gap-3 rounded-xl p-3 text-left hover:bg-muted"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Lock className="h-5 w-5" />
        </span>
        <span>
          <span className="block font-semibold text-brand">
            {t("moreMenu.closeShiftTitle")}
          </span>
          <span className="block text-sm text-brand/70">
            {t("moreMenu.closeShiftSubtitle")}
          </span>
        </span>
      </button>
    </div>
  );
}
