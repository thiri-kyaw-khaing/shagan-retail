"use client";

import BackOfficeHeader from "@/components/custom/common/back-office/back-office-header";
import { useTranslation } from "@/lib/i18n/use-translation";

/** Back Office header for the Owner: org-wide, so no single branch. */
export default function OwnerHeader({ userName }: { userName: string }) {
  const { t } = useTranslation();

  return (
    <BackOfficeHeader
      title={t("portal.title")}
      subtitle={t("backOffice.subtitle")}
      userName={userName}
      role={t("backOffice.ownerRole")}
      branchName={t("backOffice.allBranches")}
    />
  );
}
