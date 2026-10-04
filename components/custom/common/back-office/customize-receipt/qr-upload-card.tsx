"use client";

import { TriangleAlert } from "lucide-react";

import QrUploadField from "@/components/custom/common/back-office/customize-receipt/qr-upload-field";
import NoticeBanner from "@/components/custom/common/notice-banner";
import { MAX_QR_CODES } from "@/lib/types/model/qr-codes";

type QrUploadCardProps = {
  savedCount: number;
  pendingUrl: string;
  onFileAccepted: (file: File) => void;
};

export default function QrUploadCard({
  savedCount,
  pendingUrl,
  onFileAccepted,
}: QrUploadCardProps) {
  const isFull = savedCount >= MAX_QR_CODES;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-ink">QR Payment Code</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Upload your bank or wallet QR code. It will be shown to
            customers on the payment screen.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
          {savedCount}/{MAX_QR_CODES} added
        </span>
      </div>

      <div className="mt-4">
        <QrUploadField
          previewUrl={pendingUrl}
          disabled={isFull}
          onFileAccepted={onFileAccepted}
        />
      </div>

      <div className="mt-4">
        {isFull ? (
          <NoticeBanner
            tone="amber"
            title={`Maximum of ${MAX_QR_CODES} QR codes reached`}
            icon={TriangleAlert}
          >
            Remove a saved QR code to add another.
          </NoticeBanner>
        ) : (
          <p className="flex items-start gap-2 text-sm text-ink-muted">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
            Use the exact QR image provided by your bank or payment
            provider. Cropped or edited QR codes may not scan correctly.
          </p>
        )}
      </div>
    </div>
  );
}
