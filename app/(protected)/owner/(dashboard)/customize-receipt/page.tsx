"use client";

import { useState } from "react";

import CustomizeReceiptTabs, {
  type CustomizeReceiptTab,
} from "@/components/custom/common/back-office/customize-receipt/customize-receipt-tabs";
import QrPaymentTab from "@/components/custom/common/back-office/customize-receipt/qr-payment-tab";
import ReceiptFormTab from "@/components/custom/common/back-office/customize-receipt/receipt-form-tab";
import PageHeader from "@/components/custom/common/back-office/page-header";

function CustomizeReceiptPage() {
  const [activeTab, setActiveTab] = useState<CustomizeReceiptTab>("receipt");

  // Both tabs stay mounted (just hidden) so unsaved edits and saved QR codes
  // survive switching between them.
  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Customize Receipt"
        subtitle="Manage your receipt layout and QR payment code."
        backHref="/owner"
      />

      <CustomizeReceiptTabs activeTab={activeTab} onChange={setActiveTab} />

      <div hidden={activeTab !== "receipt"}>
        <ReceiptFormTab />
      </div>
      <div hidden={activeTab !== "qr"}>
        <QrPaymentTab />
      </div>
    </div>
  );
}

export default CustomizeReceiptPage;
