import { cookies } from "next/headers";

import PageHeader from "@/components/custom/common/back-office/page-header";
import ChooseSectionActions from "@/components/custom/common/back-office/choose-section-actions";
import CurrentBranchCard from "@/components/custom/common/back-office/current-branch-card";
import DashboardSummaryPreview from "@/components/custom/common/back-office/dashboard-summary-preview";
import SectionCardGrid from "@/components/custom/common/back-office/section-card-grid";
import { decimalToNumber, expensesTotalOn, businessToday } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { ACCOUNT_TYPE_COOKIE } from "@/lib/api/session";
import { getBranchSelection } from "@/lib/branch/selected-branch";

async function BackOffice() {
  const { selected } = await getBranchSelection();
  const branchId = selected?.id ?? null;
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
        <DashboardSummaryPreview
          salesToday={summary.transaction_count}
          revenue={decimalToNumber(summary.net_sales)}
          lowStockCount={summary.low_stock_count}
          expensesToday={expensesTotalOn(expenses, businessToday(), branchId)}
        />
        <SectionCardGrid />
      </div>
    </div>
  );
}

export default BackOffice;
