import ExchangeItemsView from "@/components/custom/common/pos/exchange-items-view";
import {
  decimalToNumber,
  imageByProduct,
  nameById,
  stockByProduct,
  toExchangeProduct,
  toSaleItem,
} from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { approversFor, requireReceipt } from "@/lib/pos/after-sale";

export default async function ExchangeItemsPage({
  params,
}: {
  params: Promise<{ saleId: string }>;
}) {
  const { saleId } = await params;
  const [{ sale, items }, products, stockLevels, customers, approvers] = await Promise.all([
    requireReceipt(saleId),
    api.products(),
    // A POS token's own branch.
    api.stockLevels(),
    api.customers(),
    approversFor("approve_exchange"),
  ]);
  const qrCodes = await api.paymentQrCodes(sale.branch_id);
  const images = imageByProduct(products);
  const stock = stockByProduct(stockLevels);

  return (
    <ExchangeItemsView
      sale={{
        id: sale.id,
        total: decimalToNumber(sale.total),
        customerName: sale.customer_id !== null ? (nameById(customers).get(sale.customer_id) ?? null) : null,
      }}
      // Lines already fully returned/exchanged can't come back again.
      items={items.filter((item) => item.returnable_qty > 0).map((item) => toSaleItem(item, images))}
      products={products.filter((p) => p.is_active).map((p) => toExchangeProduct(p, stock))}
      qrCodes={qrCodes.map((qr) => ({ id: qr.id, bankName: qr.bank_name, imageUrl: qr.image_url }))}
      approvers={approvers}
    />
  );
}
