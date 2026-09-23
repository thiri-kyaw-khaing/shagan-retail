"use client";

import { useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import LanguageSwitcherButton from "@/components/custom/common/language-switcher-button";
import MoreMenu from "./more-menu";
import SettingsDialog from "./settings-dialog";
import CloseShiftDialog from "./close-shift-dialog";
import { useTranslation } from "@/lib/i18n/use-translation";

type ShiftHeaderActionsProps = {
  hasAlert?: boolean;
};

export default function ShiftHeaderActions({ hasAlert = false }: ShiftHeaderActionsProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);

  const moreRef = useRef<HTMLDivElement>(null);

  useClickOutside(moreRef, () => setIsMoreOpen(false));

  return (
    <>
      <div className="flex items-center gap-2">
        <LanguageSwitcherButton className="bg-white/15 text-white hover:bg-white/25" />

        <div ref={moreRef} className="relative">
          <button
            type="button"
            onClick={() => setIsMoreOpen((open) => !open)}
            aria-label={t("moreMenu.ariaLabel")}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25"
          >
            <MoreHorizontal className="h-4 w-4" />
            {hasAlert && (
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-white" />
            )}
          </button>

          {isMoreOpen && (
            <MoreMenu
              onOpenSettings={() => {
                setIsMoreOpen(false);
                setIsSettingsOpen(true);
              }}
              onOpenCloseShift={() => {
                setIsMoreOpen(false);
                setIsCloseShiftOpen(true);
              }}
            />
          )}
        </div>
      </div>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <CloseShiftDialog
        isOpen={isCloseShiftOpen}
        onClose={() => setIsCloseShiftOpen(false)}
        onConfirm={() => {
          setIsCloseShiftOpen(false);
          router.push("/pos/close-shift");
        }}
      />
    </>
  );
}
