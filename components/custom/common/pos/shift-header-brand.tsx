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
    <div className="flex items-center gap-3 text-white">
      <div className="flex items-center gap-2">
        <Store className="h-5 w-5" />
        <span className="text-sm font-extrabold tracking-wide uppercase">
          {storeName}
        </span>
      </div>

      <span className="h-4 w-px bg-white/30" />

      <div className="flex items-center gap-1.5 text-sm font-semibold">
        <MapPin className="h-4 w-4" />
        {branchName}
      </div>

      <span className="h-4 w-px bg-white/30" />

      <div className="flex items-center gap-1.5 text-sm text-white/90">
        <Clock className="h-4 w-4" />
        {time}
      </div>
    </div>
  );
}
