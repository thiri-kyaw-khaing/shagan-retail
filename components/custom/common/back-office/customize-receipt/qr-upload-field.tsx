"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { QrCode } from "lucide-react";

import { cn } from "@/lib/utils";

const MAX_QR_BYTES = 5 * 1024 * 1024;
// What the backend can decode for QR codes (it rejects SVG and others).
const ACCEPTED_QR_TYPES = ["image/png", "image/jpeg"];

type QrUploadFieldProps = {
  previewUrl: string;
  disabled?: boolean;
  onFileAccepted: (file: File) => void;
};

export default function QrUploadField({
  previewUrl,
  disabled,
  onFileAccepted,
}: QrUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file || disabled) return;

    if (!ACCEPTED_QR_TYPES.includes(file.type)) {
      setError("Use a PNG or JPG file.");
      return;
    }
    if (file.size > MAX_QR_BYTES) {
      setError("File is larger than 5MB.");
      return;
    }

    setError(null);
    onFileAccepted(file);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    handleFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files[0]);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleInputChange}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex min-h-56 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/60 p-6 text-center transition",
          isDragging && "border-brand bg-rose-100",
          disabled ? "cursor-not-allowed opacity-50" : "hover:bg-rose-50",
        )}
      >
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not an optimizable Next.js asset */}
            <img
              src={previewUrl}
              alt="Selected QR code"
              className="max-h-44 object-contain"
            />
            <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
              Change image
            </span>
          </>
        ) : (
          <>
            <span className="flex size-14 items-center justify-center rounded-2xl border border-rose-100 bg-white">
              <QrCode className="size-7 text-rose-300" />
            </span>
            <span className="font-bold text-ink">Drop your QR image here</span>
            <span className="text-sm text-ink-muted">
              or click to browse — PNG or JPG
            </span>
          </>
        )}
      </button>

      {error && <p className="mt-2 text-sm text-brand">{error}</p>}
    </div>
  );
}
