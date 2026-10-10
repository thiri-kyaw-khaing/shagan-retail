import type { ReactNode } from "react";

import BackOfficeHeaderBrand from "./back-office-header-brand";
import BackOfficeHeaderActions from "./back-office-header-actions";

type BackOfficeHeaderProps = {
  title: string;
  subtitle: string;
  userName: string;
  role: string;
  branchName: string;
  branchSlot?: ReactNode;
  showExitToPortal?: boolean;
  onExitToPortal?: () => void;
  onSignOut?: () => void;
};

export default function BackOfficeHeader({
  title,
  subtitle,
  userName,
  role,
  branchName,
  branchSlot,
  showExitToPortal,
  onExitToPortal,
  onSignOut,
}: BackOfficeHeaderProps) {
  return (
    <header className="flex flex-col gap-3 bg-brand px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <BackOfficeHeaderBrand title={title} subtitle={subtitle} />
      <BackOfficeHeaderActions
        userName={userName}
        role={role}
        branchName={branchName}
        branchSlot={branchSlot}
        showExitToPortal={showExitToPortal}
        onExitToPortal={onExitToPortal}
        onSignOut={onSignOut}
      />
    </header>
  );
}
