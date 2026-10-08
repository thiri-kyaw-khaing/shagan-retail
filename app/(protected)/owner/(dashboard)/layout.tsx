import OwnerHeader from "@/components/custom/common/back-office/owner-header";
import { api } from "@/lib/api/server";
import { getBranchSelection } from "@/lib/branch/selected-branch";

export default async function BackOfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [me, { branches, selected }] = await Promise.all([api.me(), getBranchSelection()]);

  return (
    <div className="min-h-dvh bg-page">
      {/* Owner accounts are created without a name, so fall back to the email. */}
      <OwnerHeader
        userName={me.name || me.email}
        branches={branches.map(({ id, name }) => ({ id, name }))}
        selectedBranchId={selected?.id ?? null}
      />
      {children}
    </div>
  );
}
