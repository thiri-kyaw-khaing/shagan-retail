import CustomizeReceiptView from "@/components/custom/common/back-office/customize-receipt/customize-receipt-view";
import { api } from "@/lib/api/server";
import type { ApiReceiptSettings } from "@/lib/api/types";
import { getBranchSelection } from "@/lib/branch/selected-branch";
import type { ReceiptSettingsEntry, ReceiptTarget } from "@/lib/types/model/receipt-settings";

const toSettings = (row: ApiReceiptSettings | null) =>
  row && {
    shopName: row.shop_name,
    address: row.address,
    phone: row.phone,
    thankYouMessage: row.thank_you,
  };

export default async function CustomizeReceiptPage() {
  const { branches, selected } = await getBranchSelection();

  // One request per branch, plus the default and each branch's QR codes:
  // there's no bulk endpoint, and an org has only a handful of branches.
  const [defaultRow, branchRows, qrLists] = await Promise.all([
    api.receiptSettings({ branchId: null }),
    Promise.all(branches.map((b) => api.receiptSettings({ branchId: b.id }))),
    Promise.all(branches.map((b) => api.paymentQrCodes(b.id))),
  ]);

  const settings: Record<ReceiptTarget, ReceiptSettingsEntry> = {
    default: { settings: toSettings(defaultRow), usesDefault: false },
  };
  branches.forEach((branch, index) => {
    const row = branchRows[index];
    // A branch without its own row gets the org default back (is_global).
    settings[`${branch.id}`] = { settings: toSettings(row), usesDefault: row?.is_global ?? true };
  });

  return (
    <CustomizeReceiptView
      settings={settings}
      targetOptions={[
        { value: "default", label: "Default (all branches)" },
        ...branches.map((b) => ({ value: `${b.id}` as ReceiptTarget, label: b.name })),
      ]}
      initialTarget={selected ? `${selected.id}` : "default"}
      branchOptions={branches.map((b) => ({ value: String(b.id), label: b.name }))}
      qrByBranch={Object.fromEntries(
        branches.map((branch, index) => [
          String(branch.id),
          qrLists[index].map((qr) => ({ id: qr.id, bankName: qr.bank_name, imageUrl: qr.image_url })),
        ]),
      )}
      initialBranchId={String(selected?.id ?? branches[0]?.id ?? "")}
    />
  );
}
