import ReportsView from "@/components/custom/common/back-office/reports/reports-view";
import { getBranchSelection } from "@/lib/branch/selected-branch";
import { loadReportData, parseReportQuery } from "@/lib/reports/report-data";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ selected }, params] = await Promise.all([getBranchSelection(), searchParams]);
  const query = parseReportQuery(params);
  const data = await loadReportData(query, selected?.id ?? null);

  return <ReportsView query={query} data={data} />;
}
