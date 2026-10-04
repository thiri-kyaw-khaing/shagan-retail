import { branches } from "@/lib/types/model/branches";
import {
  receiptSettings,
  type ReceiptSettings,
} from "@/lib/types/model/receipt-settings";

export type CustomizeReceiptFormValues = {
  branchId: string;
  shopName: string;
  address: string;
  showAddress: boolean;
  phone: string;
  showPhone: boolean;
  thankYouMessage: string;
  showThankYouMessage: boolean;
};

export const branchOptions = branches.map((branch) => ({
  value: String(branch.id),
  label: branch.name,
}));

export function getSettingsForBranch(branchId: number): ReceiptSettings {
  return (
    receiptSettings.find((settings) => settings.branchId === branchId) ??
    receiptSettings[0]
  );
}

export function toFormValues(
  settings: ReceiptSettings,
): CustomizeReceiptFormValues {
  return {
    branchId: String(settings.branchId),
    shopName: settings.shopName,
    address: settings.address,
    showAddress: settings.showAddress,
    phone: settings.phone,
    showPhone: settings.showPhone,
    thankYouMessage: settings.thankYouMessage,
    showThankYouMessage: settings.showThankYouMessage,
  };
}
