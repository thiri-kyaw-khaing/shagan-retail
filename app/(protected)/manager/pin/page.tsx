import ManagerPinView from "@/components/custom/common/back-office/manager-pin-view";
import { approversFor } from "@/lib/pos/after-sale";

// The till's Back Office card lands here (WORKFLOWS §4): a manager of this
// branch unlocks the Owner's screens, scoped to the branch, with their PIN.
export default async function ManagerPinPage() {
  return <ManagerPinView managers={await approversFor("access_backoffice")} />;
}
