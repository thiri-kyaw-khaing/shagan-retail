import CustomerDirectory from "@/components/custom/common/back-office/customers/customer-directory";
import { api } from "@/lib/api/server";

// Customers are org-wide, so the branch filter doesn't apply here.
export default async function CustomersPage() {
  const customers = await api.customers();

  return (
    <CustomerDirectory
      customers={customers.map(({ id, name, phone }) => ({ id, name, phone }))}
    />
  );
}
