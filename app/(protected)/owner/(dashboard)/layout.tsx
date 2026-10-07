import OwnerHeader from "@/components/custom/common/back-office/owner-header";
import { api } from "@/lib/api/server";

export default async function BackOfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await api.me();

  return (
    <div className="min-h-dvh bg-page">
      {/* Owner accounts are created without a name, so fall back to the email. */}
      <OwnerHeader userName={me.name || me.email} />
      {children}
    </div>
  );
}
