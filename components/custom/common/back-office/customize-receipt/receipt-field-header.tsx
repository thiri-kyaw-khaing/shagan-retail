type ReceiptFieldHeaderProps = {
  label: string;
  required?: boolean;
  charCount?: { current: number; max: number };
  show?: boolean;
  onShowChange?: (show: boolean) => void;
};

export default function ReceiptFieldHeader({
  label,
  required,
  charCount,
  show,
  onShowChange,
}: ReceiptFieldHeaderProps) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        {charCount && (
          <span>
            {charCount.current}/{charCount.max}
          </span>
        )}

        {onShowChange && (
          <label className="flex items-center gap-1.5 font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={show}
              onChange={(event) => onShowChange(event.target.checked)}
              className="size-4 rounded border-slate-300 accent-brand"
            />
            Show
          </label>
        )}
      </div>
    </div>
  );
}
