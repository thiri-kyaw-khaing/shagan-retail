import { QrCode as QrCodeIcon } from "lucide-react";

import type { QrCode } from "@/lib/types/model/qr-codes";
import { cn } from "@/lib/utils";

export default function QrPaymentPreview({ qrCodes }: { qrCodes: QrCode[] }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
          Payment Screen Preview
        </p>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
          Preview only
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white">
        <div className="flex items-center gap-2 border-b border-rose-100 bg-rose-50 px-4 py-3 font-bold text-ink">
          <QrCodeIcon className="size-4 text-brand" />
          QR Code
        </div>

        <div className="p-4">
          {qrCodes.length === 0 ? (
            <div className="mx-auto flex aspect-square w-3/5 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-200 text-center">
              <QrCodeIcon className="size-10 text-rose-200" />
              <span className="text-sm text-slate-400">No QR uploaded</span>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-3",
                qrCodes.length === 1 ? "grid-cols-1" : "grid-cols-2",
              )}
            >
              {qrCodes.map((qr) => (
                <figure
                  key={qr.id}
                  className="rounded-xl border border-rose-100 p-2 text-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- presigned storage URL, not an optimizable Next.js asset */}
                  <img
                    src={qr.imageUrl}
                    alt={`${qr.bankName} QR code`}
                    className="aspect-square w-full object-contain"
                  />
                  <figcaption className="mt-1 truncate text-sm font-semibold text-ink">
                    {qr.bankName}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

          <p className="mt-4 text-center text-sm text-slate-400">
            Scan with any banking app to pay
          </p>
        </div>
      </div>
    </div>
  );
}
