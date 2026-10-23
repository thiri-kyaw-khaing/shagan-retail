import PaymentView from "@/components/custom/common/pos/payment-view";
import { api } from "@/lib/api/server";

export default async function PaymentPage() {
  const me = await api.me();
  const qrCodes = await api.paymentQrCodes(me.branch_id!);

  return (
    <PaymentView
      qrCodes={qrCodes.map((qr) => ({ id: qr.id, bankName: qr.bank_name, imageUrl: qr.image_url }))}
    />
  );
}
