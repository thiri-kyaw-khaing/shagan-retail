"use client";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/common/back-office/data-table";
import AuditActionBadge from "@/components/custom/common/back-office/audit-log/audit-action-badge";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatClockTime, formatShortDate } from "@/lib/i18n/format";
import type { AuditLogEntry } from "@/lib/types/model/audit-log";

type AuditLogTableProps = {
  entries: AuditLogEntry[];
  emptyMessage: string;
};

export default function AuditLogTable({
  entries,
  emptyMessage,
}: AuditLogTableProps) {
  const { locale } = useLocale();

  const columns: DataTableColumn<AuditLogEntry>[] = [
    {
      key: "occurredAt",
      header: "Date & Time",
      width: "1.2fr",
      render: (row) => {
        const date = new Date(row.occurredAt);
        return (
          <div className="text-sm text-ink">
            <p>{formatShortDate(date, locale)}</p>
            <p className="text-ink-muted">{formatClockTime(date, locale)}</p>
          </div>
        );
      },
    },
    {
      key: "user",
      header: "User",
      width: "1.4fr",
      render: (row) => (
        <span className="font-semibold text-ink">
          {row.userName} ({row.userRole})
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      width: "10rem",
      render: (row) => <AuditActionBadge action={row.action} />,
    },
    {
      key: "details",
      header: "Details",
      width: "2.5fr",
      render: (row) => row.details,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={entries}
      getRowKey={(row) => row.id}
      emptyMessage={emptyMessage}
      mobileCard={(row) => {
        const date = new Date(row.occurredAt);
        return (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <span className="font-semibold text-ink">
                {row.userName} ({row.userRole})
              </span>
              <AuditActionBadge action={row.action} />
            </div>
            <p className="text-xs text-ink-muted">
              {formatShortDate(date, locale)} · {formatClockTime(date, locale)}
            </p>
            <p className="text-sm text-ink">{row.details}</p>
          </div>
        );
      }}
    />
  );
}
