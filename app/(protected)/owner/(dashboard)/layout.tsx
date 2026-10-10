import ManagerHeader from "@/components/custom/common/back-office/manager-header";
import OwnerHeader from "@/components/custom/common/back-office/owner-header";
import { requireBackOfficeViewer } from "@/lib/backoffice/session";
import { getBranchSelection } from "@/lib/branch/selected-branch";

// The Owner's Back Office, also opened by a Manager at a till (WORKFLOWS §4):
// same screens, scoped to the till's branch by getBranchSelection().
export default async function BackOfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [viewer, { branches, selected }] = await Promise.all([
    requireBackOfficeViewer(),
    getBranchSelection(),
  ]);

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
      {children}
    </div>
  );
}
