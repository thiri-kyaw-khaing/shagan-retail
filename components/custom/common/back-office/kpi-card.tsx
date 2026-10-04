import { cn } from "@/lib/utils";

const VALUE_TONES = {
  default: "text-ink",
  warning: "text-amber-600",
  accent: "text-rose-800",
} as const;

type KpiCardProps = {
  label: string;
  value: string;
  caption: string;
  tone?: keyof typeof VALUE_TONES;
  mono?: boolean;
};

export default function KpiCard({
  label,
  value,
  caption,
  tone = "default",
  mono,
}: KpiCardProps) {
  return (
    <div className="min-w-0 rounded-2xl border border-rose-100 bg-white p-4 sm:p-5">
      <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p
        title={value}
        className={cn(
          "mt-3 truncate text-2xl font-bold sm:text-4xl",
          VALUE_TONES[tone],
          mono && "font-mono",
        )}
      >
        {value}
      </p>
      <p className="mt-1 truncate text-sm text-slate-500" title={caption}>
        {caption}
      </p>
    </div>
  );
}
