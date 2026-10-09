import ReceiptDetailView from "@/components/custom/common/pos/receipt-detail-view";
import { decimalToNumber, nameById, toTillSale } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { requireReceipt } from "@/lib/pos/after-sale";

/** "duplicate_transaction" -> "Duplicate transaction". */
const humanize = (code: string) => {
  const words = code.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ saleId: string }>;
}) {
  const { saleId } = await params;
  const receipt = await requireReceipt(saleId);

  // /voids, /returns and /exchanges are branch-wide lists; this receipt's own
  // are picked out here. A sale stays "completed" after returns/exchanges
  // (they can be partial), so these banners are where they show up.
  const [staff, customers, voids, returns, exchanges] = await Promise.all([
    api.staff(),
    api.customers(),
    api.voids({ branchId: null }),
    api.returns({ branchId: null }),
    api.exchanges({ branchId: null }),
  ]);
  const { sale } = receipt;
  const voided = voids.find((v) => v.sale_id === sale.id);
  const saleReturns = returns.filter((r) => r.sale_id === sale.id);
  const saleExchanges = exchanges.filter((e) => e.sale_id === sale.id);

  return (
    <ReceiptDetailView
      sale={toTillSale(sale)}
      cashierName={nameById(staff).get(sale.staff_id) ?? null}
      customerName={sale.customer_id !== null ? (nameById(customers).get(sale.customer_id) ?? null) : null}
      // The till sends no explanation, only its reason code ("duplicate_transaction").
      voidNote={voided ? voided.explanation || humanize(voided.reason) : null}
      returned={
        saleReturns.length > 0
          ? {
              refundTotal: saleReturns.reduce((sum, r) => sum + decimalToNumber(r.refund_total), 0),
              refundMethods: [...new Set(saleReturns.map((r) => r.refund_method))],
            }
          : null
      }
      exchanged={
        saleExchanges.length > 0
          ? { netDifference: saleExchanges.reduce((sum, e) => sum + decimalToNumber(e.net_difference), 0) }
          : null
      }
      // Only a completed sale with something left to bring back can be returned or
      // exchanged; once it has either, the backend refuses a whole-sale void.
      canReturn={sale.status === "completed" && receipt.items.some((item) => item.returnable_qty > 0)}
      canVoid={!sale.has_return && !sale.has_exchange}
    />
  );
}
