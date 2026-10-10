"use client";

import BackOfficeHeader from "@/components/custom/common/back-office/back-office-header";
import { exitBackOfficeAction } from "@/lib/backoffice/actions";
import { useTranslation } from "@/lib/i18n/use-translation";

/**
 * Back Office header for a Manager at a till: locked to the till's branch,
 * no branch picker. Both "Exit to Portal" and "Sign out" only close the
 * Back Office - the till itself stays logged in for the next cashier.
 */
export default function ManagerHeader({ userName, branchName }: { userName: string; branchName: string }) {
  const { t } = useTranslation();

  return (
    <BackOfficeHeader
      title={t("portal.title")}
      subtitle={t("backOffice.subtitle")}
      userName={userName}
      role={t("backOffice.managerRole")}
      branchName={branchName}
      showExitToPortal
      onExitToPortal={() => exitBackOfficeAction()}
      onSignOut={() => exitBackOfficeAction()}
    />
  );
}
