import { notFound } from "next/navigation";

import StaffPinPad from "@/components/custom/common/pos/staff-pin-pad";
import { api } from "@/lib/api/server";

export default async function StaffPinPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const staffId = Number((await searchParams).staffId);
  const [staff, lowStock, products] = await Promise.all([
    api.staff(),
    // A POS token's own branch.
    api.lowStock({ branchId: null }),
    api.products(),
  ]);
  const member = staff.find((s) => s.id === staffId && s.status === "active");
  if (!member) notFound();

  const productNames = new Map(products.map((p) => [p.id, p.name]));
  return (
    <StaffPinPad
      staff={{ id: member.id, name: member.name }}
      alerts={lowStock.map((level) => ({
        product: productNames.get(level.product_id) ?? `Product #${level.product_id}`,
        quantity: level.qty,
      }))}
    />
  );
}
