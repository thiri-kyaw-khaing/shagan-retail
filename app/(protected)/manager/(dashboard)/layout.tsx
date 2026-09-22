"use client";

import BackOfficeHeader from "@/components/custom/common/back-office/back-office-header";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function BackOfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh bg-page">
      <BackOfficeHeader
        title={t("portal.title")}
        subtitle={t("backOffice.subtitle")}
        userName="U Aye Paung"
        role="Owner"
        branchName="Main Street Branch"
      />
      {children}
    </div>
  );
}
