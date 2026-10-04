import { Trash2 } from "lucide-react";

import type { QrCode } from "@/lib/types/model/qr-codes";

type SavedQrListProps = {
  qrCodes: QrCode[];
  onRemove: (id: number) => void;
};

export default function SavedQrList({ qrCodes, onRemove }: SavedQrListProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-bold text-ink">Saved QR codes</h2>

      <ul className="mt-4 divide-y divide-slate-100">
        {qrCodes.map((qr) => (
          <li
            key={qr.id}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not an optimizable Next.js asset */}
            <img
              src={qr.imageUrl}
              alt={`${qr.bankName} QR code`}
              className="size-12 shrink-0 rounded-lg border border-slate-200 bg-white object-contain"
            />
            <span className="min-w-0 flex-1 truncate font-semibold text-ink">
              {qr.bankName}
            </span>
            <button
              type="button"
              onClick={() => onRemove(qr.id)}
              aria-label={`Remove ${qr.bankName} QR code`}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-brand"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
