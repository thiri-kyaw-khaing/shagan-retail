import { Store, MapPin, Clock } from "lucide-react";

type ShiftHeaderBrandProps = {
  storeName: string;
  branchName: string;
  time: string;
};

export default function ShiftHeaderBrand({
  storeName,
  branchName,
  time,
}: ShiftHeaderBrandProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-white">
      <div className="flex shrink-0 items-center gap-2">
        <Store className="h-5 w-5" />
        <span className="text-sm font-extrabold tracking-wide uppercase">
          {storeName}
        </span>
      </div>

      <span className="hidden h-4 w-px bg-white/30 sm:block" />

      <div className="flex min-w-0 items-center gap-1.5 text-sm font-semibold">
        <MapPin className="h-4 w-4 shrink-0" />
        <span className="truncate">{branchName}</span>
      </div>

      <span className="hidden h-4 w-px bg-white/30 sm:block" />

      <div className="hidden items-center gap-1.5 text-sm text-white/90 sm:flex">
        <Clock className="h-4 w-4" />
        {time}
      </div>
    </div>
  );
}
