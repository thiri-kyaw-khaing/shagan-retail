import ManagerHeader from "@/components/custom/common/back-office/manager-header";
import OwnerHeader from "@/components/custom/common/back-office/owner-header";
import PlanNotices from "@/components/custom/common/back-office/plan-notices";
import { api } from "@/lib/api/server";
import { requireBackOfficeViewer } from "@/lib/backoffice/session";
import { getBranchSelection } from "@/lib/branch/selected-branch";
import { planNotices } from "@/lib/subscription/plan";

// The Owner's Back Office, also opened by a Manager at a till (WORKFLOWS §4):
// same screens, scoped to the till's branch by getBranchSelection().
export default async function BackOfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [viewer, { branches, selected }, me] = await Promise.all([
    requireBackOfficeViewer(),
    getBranchSelection(),
    api.me(),
  ]);
  // Tier reminders are for the Owner, who deals with Shagan about the plan.
  const subscription = viewer.kind === "owner" ? me.subscription : null;

  return (
    <div className="min-h-dvh bg-page">
      {viewer.kind === "manager" ? (
        <ManagerHeader userName={viewer.name} branchName={viewer.branch.name} />
      ) : (
        <OwnerHeader
          userName={viewer.name}
          branches={branches.map(({ id, name }) => ({ id, name }))}
          selectedBranchId={selected?.id ?? null}
        />
      )}
      {subscription && (
        <PlanNotices plan={subscription.plan} notices={planNotices(subscription)} />
      )}
      {children}
    </div>
  );
}
