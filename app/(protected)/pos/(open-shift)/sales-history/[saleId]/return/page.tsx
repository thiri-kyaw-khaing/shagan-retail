import ReturnItemsView from "@/components/custom/common/pos/return-items-view";
import { decimalToNumber, imageByProduct, nameById, toSaleItem } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { approversFor, requireReceipt } from "@/lib/pos/after-sale";

export default async function ReturnItemsPage({
  params,
}: {
  params: Promise<{ saleId: string }>;
}) {
  const { saleId } = await params;
  const [{ sale, items }, products, customers, approvers] = await Promise.all([
    requireReceipt(saleId),
    api.products(),
    api.customers(),
    approversFor("approve_return"),
  ]);
  const images = imageByProduct(products);

  return (
    <ReturnItemsView
      sale={{
        id: sale.id,
        total: decimalToNumber(sale.total),
        customerName: sale.customer_id !== null ? (nameById(customers).get(sale.customer_id) ?? null) : null,
      }}
      // Lines already fully returned/exchanged can't come back again.
      items={items.filter((item) => item.returnable_qty > 0).map((item) => toSaleItem(item, images))}
      approvers={approvers}
    />
  );
}
