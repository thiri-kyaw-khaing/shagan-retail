import ShiftHeaderBrand from "./shift-header-brand";
import ShiftHeaderNav from "./shift-header-nav";
import ShiftHeaderActions from "./shift-header-actions";
import { heldSales } from "@/lib/types/model/heldsale";

type ShiftHeaderProps = {
  storeName?: string;
  branchName: string;
  time: string;
  heldCount?: number;
  hasMoreAlert?: boolean;
};

export default function ShiftHeader({
  storeName = "Shagan Retail",
  branchName,
  time,
  heldCount = 0,
  hasMoreAlert = false,
}: ShiftHeaderProps) {
  return (
    <header className="flex flex-col gap-3 bg-brand px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-6">
      <ShiftHeaderBrand
        storeName={storeName}
        branchName={branchName}
        time={time}
      />

      <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-3">
        <ShiftHeaderNav heldCount={heldSales.length} />
        <ShiftHeaderActions hasAlert={hasMoreAlert} />
      </div>
    </header>
  );
}
