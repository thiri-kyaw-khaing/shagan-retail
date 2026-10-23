import SellView from "@/components/custom/common/pos/sell-view";
import { stockByProduct, toProduct } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { getStaffSession } from "@/lib/pos/staff-session";

// Products and categories are org-wide; stock comes from this till's branch
// (a POS token is scoped to it).
export default async function SellPage() {
  const [me, staff] = await Promise.all([api.me(), getStaffSession()]);
  const [products, categories, stockLevels, customers, approvers] = await Promise.all([
    api.products(),
    api.categories(),
    api.stockLevels(),
    api.customers(),
    // Who can approve a custom discount with their PIN (Discount V1).
    api.approvers(me.branch_id!, "approve_manual_discount"),
  ]);
  const stock = stockByProduct(stockLevels);

  return (
    <SellView
      products={products.filter((p) => p.is_active).map((p) => toProduct(p, stock))}
      categories={categories}
      customers={customers.map(({ id, name, phone }) => ({ id, name, phone }))}
      // The cashier never approves their own through the PIN pad: with
      // approve_own_discount they confirm without one (canSelfApproveDiscount).
      discountApprovers={approvers
        .filter((s) => s.status === "active" && s.id !== staff?.staffId)
        .map((s) => ({ id: s.id, name: s.name }))}
    />
  );
}
