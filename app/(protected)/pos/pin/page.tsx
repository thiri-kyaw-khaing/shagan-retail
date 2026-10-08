import { notFound } from "next/navigation";

import StaffPinPad from "@/components/custom/common/pos/staff-pin-pad";
import { api } from "@/lib/api/server";

export default async function StaffPinPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const staffId = Number((await searchParams).staffId);
  const me = await api.me();
  const [staff, lowStock, products, managers] = await Promise.all([
    api.staff(),
    // A POS token's own branch.
    api.lowStock({ branchId: null }),
    api.products(),
    // Who can force-close a shift another cashier left open on this till.
    api.approvers(me.branch_id!, "access_backoffice"),
  ]);
  const member = staff.find((s) => s.id === staffId && s.status === "active");
  if (!member) notFound();

  const productNames = new Map(products.map((p) => [p.id, p.name]));
  return (
    <StaffPinPad
      staff={{ id: member.id, name: member.name }}
      managers={managers.filter((s) => s.status === "active").map((s) => ({ id: s.id, name: s.name }))}
      alerts={lowStock.map((level) => ({
        product: productNames.get(level.product_id) ?? `Product #${level.product_id}`,
        quantity: level.qty,
      }))}
    />
  );
}
