import VoidSaleView from "@/components/custom/common/pos/void-sale-view";
import { decimalToNumber, nameById } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { approversFor, requireReceipt } from "@/lib/pos/after-sale";

export default async function VoidSalePage({
  params,
}: {
  params: Promise<{ saleId: string }>;
}) {
  const { saleId } = await params;
  const [{ sale }, customers, approvers] = await Promise.all([
    requireReceipt(saleId),
    api.customers(),
    approversFor("approve_void"),
  ]);

  return (
    <VoidSaleView
      sale={{
        id: sale.id,
        total: decimalToNumber(sale.total),
        customerName: sale.customer_id !== null ? (nameById(customers).get(sale.customer_id) ?? null) : null,
      }}
      approvers={approvers}
    />
  );
}
