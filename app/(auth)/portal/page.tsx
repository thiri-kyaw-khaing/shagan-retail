"use client";

import PortalCard from "@/components/admin-portal/portal-card";
import Logo from "@/components/custom/logo/logo";
import { Monitor, Archive, Store } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

function UserPortalPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center">
          <Logo icon={<Store color="white" />} />
        </div>
        <h1 className="text-3xl font-bold">{t("portal.title")}</h1>
        <p className="text-muted-foreground">{t("portal.subtitle")}</p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PortalCard
            href="/pos/select-staff"
            icon={<Monitor />}
            title={t("portal.pos.title")}
            subtitle={t("portal.pos.subtitle")}
          />
          <PortalCard
            href="/admin/pin"
            icon={<Archive />}
            title={t("portal.backOffice.title")}
            subtitle={t("portal.backOffice.subtitle")}
          />
        </div>
      </div>
    </div>
  );
}

export default UserPortalPage;
