"use client";

import {
  BookOpen,
  ChartColumn,
  CircleUser,
  Package,
  Receipt,
  ScrollText,
  Truck,
  Users,
} from "lucide-react";

import SectionCard from "@/components/custom/common/back-office/section-card";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function SectionCardGrid() {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <SectionCard
        href="/owner/staff-management"
        icon={Users}
        title={t("sections.staff.title")}
        subtitle={t("sections.staff.subtitle")}
      />
      <SectionCard
        href="/owner/products"
        icon={Package}
        title={t("sections.products.title")}
        subtitle={t("sections.products.subtitle")}
      />
      <SectionCard
        href="/owner/inventory-ledger"
        icon={BookOpen}
        title={t("sections.inventoryLedger.title")}
        subtitle={t("sections.inventoryLedger.subtitle")}
      />
      <SectionCard
        href="/owner/suppliers"
        icon={Truck}
        title={t("sections.suppliers.title")}
        subtitle={t("sections.suppliers.subtitle")}
      />
      <SectionCard
        href="/owner/customers"
        icon={CircleUser}
        title={t("sections.customers.title")}
        subtitle={t("sections.customers.subtitle")}
      />
      <SectionCard
        href="/owner/sales-history"
        icon={Receipt}
        title={t("sections.salesHistory.title")}
        subtitle={t("sections.salesHistory.subtitle")}
      />
      <SectionCard
        href="/owner/audit-log"
        icon={ScrollText}
        title={t("sections.auditLog.title")}
        subtitle={t("sections.auditLog.subtitle")}
      />
      <SectionCard
        href="/owner/reports"
        icon={ChartColumn}
        title={t("sections.reports.title")}
        subtitle={t("sections.reports.subtitle")}
      />
    </div>
  );
}
