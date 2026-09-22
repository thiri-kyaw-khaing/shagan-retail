"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Home, LogOut } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import LanguageMenu from "@/components/custom/common/pos/language-menu";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { useTranslation } from "@/lib/i18n/use-translation";

type BackOfficeHeaderActionsProps = {
  userName: string;
  role: string;
  branchName: string;
};

export default function BackOfficeHeaderActions({
  userName,
  role,
  branchName,
}: BackOfficeHeaderActionsProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);

  useClickOutside(languageRef, () => setIsLanguageOpen(false));

  return (
    <div className="flex items-center gap-3">
      <div className="text-right text-white">
        <p className="font-bold">{userName}</p>
        <p className="text-xs text-white/80">
          {role} · {branchName}
        </p>
      </div>

      <div ref={languageRef} className="relative">
        <button
          type="button"
          onClick={() => setIsLanguageOpen((open) => !open)}
          aria-label={t("language.switchLabel")}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25"
        >
          <Globe className="h-4 w-4" />
        </button>

        {isLanguageOpen && (
          <LanguageMenu onSelect={() => setIsLanguageOpen(false)} />
        )}
      </div>

      <span className="h-6 w-px bg-white/30" />

      <CustomButton
        label={t("backOffice.exitToPortal")}
        icon={Home}
        onClick={() => router.push("/portal")}
        className="bg-white h-10 font-semibold text-brand hover:bg-white/90"
      />

      <CustomButton
        label={t("backOffice.signOut")}
        icon={LogOut}
        onClick={() => router.push("/login")}
        className="bg-white h-10 font-semibold text-brand hover:bg-white/90"
      />
    </div>
  );
}
