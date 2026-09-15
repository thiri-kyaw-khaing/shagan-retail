import ShiftHeaderBrand from "./shift-header-brand";
import ShiftHeaderNav from "./shift-header-nav";
import ShiftHeaderActions from "./shift-header-actions";

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
    <header className="flex items-center justify-between gap-4 bg-brand px-6 py-3">
      <ShiftHeaderBrand
        storeName={storeName}
        branchName={branchName}
        time={time}
      />

      <div className="flex items-center gap-3">
        <ShiftHeaderNav heldCount={heldCount} />
        <ShiftHeaderActions hasAlert={hasMoreAlert} />
      </div>
    </header>
  );
}
