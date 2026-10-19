"use client";

import { useState } from "react";

import CustomizeReceiptTabs, {
  type CustomizeReceiptTab,
} from "@/components/custom/common/back-office/customize-receipt/customize-receipt-tabs";
import QrPaymentTab from "@/components/custom/common/back-office/customize-receipt/qr-payment-tab";
import ReceiptFormTab from "@/components/custom/common/back-office/customize-receipt/receipt-form-tab";
import PageHeader from "@/components/custom/common/back-office/page-header";
import type { QrCode } from "@/lib/types/model/qr-codes";
import type { ReceiptSettingsEntry, ReceiptTarget } from "@/lib/types/model/receipt-settings";

type CustomizeReceiptViewProps = {
  settings: Record<ReceiptTarget, ReceiptSettingsEntry>;
  targetOptions: { value: ReceiptTarget; label: string }[];
  initialTarget: ReceiptTarget;
  branchOptions: { value: string; label: string }[];
  qrByBranch: Record<string, QrCode[]>;
  initialBranchId: string;
  /** False for a manager: payment QR codes are the Owner's to manage. */
  showQrPayment?: boolean;
};

export default function CustomizeReceiptView({ showQrPayment = true, ...props }: CustomizeReceiptViewProps) {
  const [activeTab, setActiveTab] = useState<CustomizeReceiptTab>("receipt");

  // Both tabs stay mounted (just hidden) so unsaved edits survive switching.
  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Customize Receipt"
        subtitle="Manage your receipt layout and QR payment codes."
        backHref="/owner"
      />

      {showQrPayment && <CustomizeReceiptTabs activeTab={activeTab} onChange={setActiveTab} />}

      <div hidden={activeTab !== "receipt"}>
        <ReceiptFormTab
          settings={props.settings}
          targetOptions={props.targetOptions}
          initialTarget={props.initialTarget}
        />
      </div>
      {showQrPayment && (
        <div hidden={activeTab !== "qr"}>
          {props.branchOptions.length > 0 ? (
            <QrPaymentTab
              branchOptions={props.branchOptions}
              qrByBranch={props.qrByBranch}
              initialBranchId={props.initialBranchId}
            />
          ) : (
            <p className="mt-6 text-sm text-ink-muted">Add a branch first - QR codes belong to a branch.</p>
          )}
        </div>
      )}
    </div>
  );
}
