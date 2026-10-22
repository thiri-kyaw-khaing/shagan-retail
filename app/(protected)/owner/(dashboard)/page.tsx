import { cookies } from "next/headers";

import PageHeader from "@/components/custom/common/back-office/page-header";
import ChooseSectionActions from "@/components/custom/common/back-office/choose-section-actions";
import CurrentBranchCard from "@/components/custom/common/back-office/current-branch-card";
import DashboardSummaryPreview from "@/components/custom/common/back-office/dashboard-summary-preview";
import SectionCardGrid, { type SectionKey } from "@/components/custom/common/back-office/section-card-grid";
import { decimalToNumber, expensesTotalOn, businessToday } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { canUse, requireBackOfficeViewer } from "@/lib/backoffice/session";
import { ACCOUNT_TYPE_COOKIE } from "@/lib/api/session";
import { getBranchSelection } from "@/lib/branch/selected-branch";

/** Which permission opens each section (Access rights V1). */
const SECTION_ACCESS: Record<SectionKey, string[]> = {
  staff: ["view_staff"],
  products: ["manage_catalog"],
  inventoryLedger: ["view_inventory"],
  suppliers: ["manage_suppliers", "manage_purchase_orders", "receive_stock"],
  customers: ["view_customers"],
  salesHistory: ["view_sales"],
  auditLog: ["view_audit_log"],
  reports: ["view_reports"],
};

async function BackOffice() {
  const [{ selected }, viewer] = await Promise.all([getBranchSelection(), requireBackOfficeViewer()]);
  const branchId = selected?.id ?? null;
  const canSeeReports = canUse(viewer, "view_reports");
  const [summary, expenses] = canSeeReports
    ? await Promise.all([api.homeSummary({ branchId }), api.expenses()])
    : [null, []];
  const visible = (Object.keys(SECTION_ACCESS) as SectionKey[]).filter((key) =>
    canUse(viewer, ...SECTION_ACCESS[key]),
  );
  const [summary, expenses, store] = await Promise.all([
    api.homeSummary({ branchId }),
    api.expenses(),
    cookies(),
  ]);
  // A till only reaches the Back Office with a manager's PIN (see proxy.ts).
  const isManager = store.get(ACCOUNT_TYPE_COOKIE)?.value === "pos";

  return (
    <div className="p-4 sm:p-6">
      <CurrentBranchCard branchName={selected?.name ?? "All branches"} />

      <PageHeader
        title="Choose a section"
        subtitle="Select a section to manage your store"
        action={<ChooseSectionActions isManager={isManager} />}
      />

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-[300px_1fr] lg:grid-cols-[440px_1fr]">
        {/* Today's figures are reports: hidden for a role without view_reports. */}
        {summary ? (
          <DashboardSummaryPreview
            salesToday={summary.transaction_count}
            revenue={decimalToNumber(summary.net_sales)}
            lowStockCount={summary.low_stock_count}
            expensesToday={expensesTotalOn(expenses, businessToday(), branchId)}
          />
        ) : (
          <div />
        )}
        <SectionCardGrid visible={visible} />
      </div>
    </div>
  );
}

export default BackOffice;
