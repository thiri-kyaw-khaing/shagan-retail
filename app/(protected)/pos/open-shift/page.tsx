import { redirect } from "next/navigation";

import OpenShiftForm from "@/components/custom/common/pos/open-shift-form";
import { requireTill } from "@/lib/pos/till-context";

export default async function OpenShiftPage() {
  const till = await requireTill();
  // Already open (e.g. signed back in mid-shift): carry on selling.
  if (till.shift) redirect("/pos/sell");

  return <OpenShiftForm branchName={till.branch.name} cashierName={till.staff.name} />;
}
