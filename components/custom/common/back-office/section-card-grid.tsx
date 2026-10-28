"use client";

import {
  BookOpen,
  ChartColumn,
  CircleUser,
  History,
  Package,
  Receipt,
  ScrollText,
  Truck,
  Users,
} from "lucide-react";

import SectionCard from "@/components/custom/common/back-office/section-card";
import { useTranslation } from "@/lib/i18n/use-translation";

export type SectionKey =
  | "staff"
  | "products"
  | "inventoryLedger"
  | "suppliers"
  | "customers"
  | "salesHistory"
  | "shiftHistory"
  | "auditLog"
  | "reports";

/**
 * `visible`: the sections this viewer may open (Access rights V1). Omitted =
 * every section. (Roles & Access is a tab of Staff Management.)
 */
export default function SectionCardGrid({ visible }: { visible?: SectionKey[] }) {
  const show = (key: SectionKey) => !visible || visible.includes(key);
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {show("staff") && (
        <SectionCard
          href="/owner/staff-management"
          icon={Users}
          title={t("sections.staff.title")}
          subtitle={t("sections.staff.subtitle")}
        />
      )}
      {show("products") && (
        <SectionCard
          href="/owner/products"
          icon={Package}
          title={t("sections.products.title")}
          subtitle={t("sections.products.subtitle")}
        />
      )}
      {show("inventoryLedger") && (
        <SectionCard
          href="/owner/inventory-ledger"
          icon={BookOpen}
          title={t("sections.inventoryLedger.title")}
          subtitle={t("sections.inventoryLedger.subtitle")}
        />
      )}
      {show("suppliers") && (
        <SectionCard
          href="/owner/suppliers"
          icon={Truck}
          title={t("sections.suppliers.title")}
          subtitle={t("sections.suppliers.subtitle")}
        />
      )}
      {show("customers") && (
        <SectionCard
          href="/owner/customers"
          icon={CircleUser}
          title={t("sections.customers.title")}
          subtitle={t("sections.customers.subtitle")}
        />
      )}
      {show("salesHistory") && (
        <SectionCard
          href="/owner/sales-history"
          icon={Receipt}
          title={t("sections.salesHistory.title")}
          subtitle={t("sections.salesHistory.subtitle")}
        />
      )}
      {show("shiftHistory") && (
        <SectionCard
          href="/owner/shift-history"
          icon={History}
          title={t("sections.shiftHistory.title")}
          subtitle={t("sections.shiftHistory.subtitle")}
        />
      )}
      {show("auditLog") && (
        <SectionCard
          href="/owner/audit-log"
          icon={ScrollText}
          title={t("sections.auditLog.title")}
          subtitle={t("sections.auditLog.subtitle")}
        />
      )}
      {show("reports") && (
        <SectionCard
          href="/owner/reports"
          icon={ChartColumn}
          title={t("sections.reports.title")}
          subtitle={t("sections.reports.subtitle")}
        />
      )}
    </div>
  );
}
