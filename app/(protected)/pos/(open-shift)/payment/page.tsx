import PaymentView from "@/components/custom/common/pos/payment-view";
import { api } from "@/lib/api/server";

export default async function PaymentPage() {
  const me = await api.me();
  const branchId = me.branch_id!;
  const [qrCodes, approvers] = await Promise.all([
    api.paymentQrCodes(branchId),
    // Anyone at this branch whose role can give a discount can approve one.
    api.approvers(branchId, "apply_manual_discount"),
  ]);

  return (
    <PaymentView
      qrCodes={qrCodes.map((qr) => ({ id: qr.id, bankName: qr.bank_name, imageUrl: qr.image_url }))}
      approvers={approvers
        .filter((s) => s.status === "active")
        .map((s) => ({ id: s.id, name: s.name }))}
    />
  );
}
