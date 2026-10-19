"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Home, LogOut } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import LanguageSwitcherButton from "@/components/custom/common/language-switcher-button";
import { logoutAction } from "@/lib/auth/actions";
import { useTranslation } from "@/lib/i18n/use-translation";

type BackOfficeHeaderActionsProps = {
  userName: string;
  role: string;
  branchName: string;
  /** Replaces the static branch name, e.g. with the Owner's branch picker. */
  branchSlot?: ReactNode;
  /** Owners have no POS portal to return to (WORKFLOWS §3). */
  showExitToPortal?: boolean;
  /** Replaces the default "go to /portal" (a manager also closes their Back Office). */
  onExitToPortal?: () => void;
  /** Replaces the default device logout (a manager only leaves the Back Office). */
  onSignOut?: () => void;
};

export default function BackOfficeHeaderActions({
  userName,
  role,
  branchName,
  branchSlot,
  showExitToPortal = false,
  onExitToPortal,
  onSignOut,
}: BackOfficeHeaderActionsProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3">
      <div className="text-right text-white">
        <p className="font-bold">{userName}</p>
        <p className="text-xs text-white/80">
          {branchSlot ? role : `${role} · ${branchName}`}
        </p>
      </div>

      {branchSlot}

      <LanguageSwitcherButton className="bg-white/15 text-white hover:bg-white/25" />

      <span className="h-6 w-px bg-white/30" />

      {showExitToPortal && (
        <CustomButton
          label={t("backOffice.exitToPortal")}
          icon={Home}
          onClick={onExitToPortal ?? (() => router.push("/portal"))}
          className="bg-white h-10 font-semibold text-brand hover:bg-white/90"
        />
      )}

      <CustomButton
        label={t("backOffice.signOut")}
        icon={LogOut}
        onClick={onSignOut ?? (() => logoutAction())}
        className="bg-white h-10 font-semibold text-brand hover:bg-white/90"
      />
    </div>
  );
}
