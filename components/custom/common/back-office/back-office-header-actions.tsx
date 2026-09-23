"use client";

import { useRouter } from "next/navigation";
import { Home, LogOut } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import LanguageSwitcherButton from "@/components/custom/common/language-switcher-button";
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

  return (
    <div className="flex items-center gap-3">
      <div className="text-right text-white">
        <p className="font-bold">{userName}</p>
        <p className="text-xs text-white/80">
          {role} · {branchName}
        </p>
      </div>

      <LanguageSwitcherButton className="bg-white/15 text-white hover:bg-white/25" />

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
