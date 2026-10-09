import ReceiptListView from "@/components/custom/common/pos/receipt-list-view";
import { nameById, toTillSale } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";

// A POS token only sees its own branch's sales. The latest 100 receipts (the
// backend's page cap), newest first; older ones are in the Back Office.
export default async function SalesHistoryPage() {
  const [page, staff, customers] = await Promise.all([
    api.sales({ branchId: null, pageSize: 100 }),
    api.staff(),
    api.customers(),
  ]);
  const staffNames = nameById(staff);
  const customerNames = nameById(customers);

  return (
    <ReceiptListView
      rows={page.sales
        // An "open" sale is mid-checkout, not a receipt yet.
        .filter((sale) => sale.status !== "open")
        .map((sale) => ({
          sale: toTillSale(sale),
          cashierName: staffNames.get(sale.staff_id),
          customerName: sale.customer_id !== null ? customerNames.get(sale.customer_id) : undefined,
        }))}
    />
  );
}
