"use client";

import { useRef, useState } from "react";
import { Globe, MoreHorizontal } from "lucide-react";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import LanguageMenu from "./language-menu";
import MoreMenu from "./more-menu";
import SettingsDialog from "./settings-dialog";
import CloseShiftDialog from "./close-shift-dialog";

type ShiftHeaderActionsProps = {
  hasAlert?: boolean;
};

export default function ShiftHeaderActions({ hasAlert = false }: ShiftHeaderActionsProps) {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);

  const languageRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useClickOutside(languageRef, () => setIsLanguageOpen(false));
  useClickOutside(moreRef, () => setIsMoreOpen(false));

  return (
    <>
      <div className="flex items-center gap-2">
        <div ref={languageRef} className="relative">
          <button
            type="button"
            onClick={() => setIsLanguageOpen((open) => !open)}
            aria-label="Switch language"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25"
          >
            <Globe className="h-4 w-4" />
          </button>

          {isLanguageOpen && (
            <LanguageMenu onSelect={() => setIsLanguageOpen(false)} />
          )}
        </div>

        <div ref={moreRef} className="relative">
          <button
            type="button"
            onClick={() => setIsMoreOpen((open) => !open)}
            aria-label="More options"
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
        onConfirm={() => setIsCloseShiftOpen(false)}
      />
    </>
  );
}
