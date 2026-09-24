"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string | number;
  emptyMessage: string;
  mobileCard?: (row: T) => ReactNode;
};

export default function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyMessage,
  mobileCard,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-rose-200 bg-white p-8 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-rose-200 bg-white">
      <div
        className="hidden items-center gap-4 border-b border-rose-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid"
        style={{
          gridTemplateColumns: columns.map(() => "minmax(0, 1fr)").join(" "),
        }}
      >
        {columns.map((column) => (
          <span key={column.key} className={column.className}>
            {column.header}
          </span>
        ))}
      </div>

      {data.map((row) => (
        <div key={getRowKey(row)}>
          <div
            className="hidden items-center gap-4 border-b border-slate-100 px-4 py-4 last:border-b-0 md:grid"
            style={{
              gridTemplateColumns: columns
                .map(() => "minmax(0, 1fr)")
                .join(" "),
            }}
          >
            {columns.map((column) => (
              <div key={column.key} className={cn("min-w-0", column.className)}>
                {column.render ? column.render(row) : null}
              </div>
            ))}
          </div>

          <div className="border-b border-slate-100 p-4 last:border-b-0 md:hidden">
            {mobileCard ? (
              mobileCard(row)
            ) : (
              <dl className="space-y-3">
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <dt className="text-slate-500">{column.header}</dt>
                    <dd className="text-right font-medium text-slate-800">
                      {column.render ? column.render(row) : null}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
