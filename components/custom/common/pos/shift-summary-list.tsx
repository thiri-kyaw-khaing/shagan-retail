type SummaryRowProps = {
  label: string;
  value: string;
  detail?: string;
  last?: boolean;
};

function SummaryRow({ label, value, detail, last = false }: SummaryRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-4 ${
        last ? "" : "border-b border-rose-200"
      }`}
    >
      <dt className="text-sm text-slate-500">{label}</dt>

      <dd className="text-right">
        <p className="text-sm font-semibold text-slate-800">{value}</p>

        {detail && <p className="mt-1 text-xs text-slate-400">{detail}</p>}
      </dd>
    </div>
  );
}

export type ShiftSummaryRow = SummaryRowProps;

type ShiftSummaryListProps = {
  rows: ShiftSummaryRow[];
};

export default function ShiftSummaryList({ rows }: ShiftSummaryListProps) {
  return (
    <dl className="overflow-hidden rounded-xl border border-rose-200">
      {rows.map((row) => (
        <SummaryRow key={row.label} {...row} />
      ))}
    </dl>
  );
}
