"use client";

import { useRef, useState } from "react";
import { Globe } from "lucide-react";

import LanguageMenu from "@/components/custom/common/pos/language-menu";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

type LanguageSwitcherButtonProps = {
  className?: string;
};

export default function LanguageSwitcherButton({
  className,
}: LanguageSwitcherButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={t("language.switchLabel")}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition",
          className,
        )}
      >
        <Globe className="h-4 w-4" />
      </button>

      {isOpen && <LanguageMenu onSelect={() => setIsOpen(false)} />}
    </div>
  );
}
