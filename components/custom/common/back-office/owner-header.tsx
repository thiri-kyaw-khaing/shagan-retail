"use client";

import { useTransition } from "react";

import BackOfficeHeader from "@/components/custom/common/back-office/back-office-header";
import FilterSelect from "@/components/custom/common/back-office/filter-select";
import { selectBranchAction } from "@/lib/branch/actions";
import { useTranslation } from "@/lib/i18n/use-translation";

type OwnerHeaderProps = {
  userName: string;
  branches: { id: number; name: string }[];
  /** null = all branches. */
  selectedBranchId: number | null;
};

/** Back Office header for the Owner: org-wide, with a branch filter for every screen. */
export default function OwnerHeader({ userName, branches, selectedBranchId }: OwnerHeaderProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const options = [
    { value: "all", label: t("backOffice.allBranches") },
    ...branches.map((branch) => ({ value: String(branch.id), label: branch.name })),
  ];

  return (
    <BackOfficeHeader
      title={t("portal.title")}
      subtitle={t("backOffice.subtitle")}
      userName={userName}
      role={t("backOffice.ownerRole")}
      branchName={t("backOffice.allBranches")}
      branchSlot={
        <FilterSelect
          aria-label={t("backOffice.branchFilter")}
          value={selectedBranchId === null ? "all" : String(selectedBranchId)}
          // The Server Function sets the cookie and re-renders the route with the new scope.
          onChange={(value) =>
            startTransition(() => selectBranchAction(value === "all" ? null : Number(value)))
          }
          options={options}
          className={isPending ? "w-48 opacity-70" : "w-48"}
        />
      }
    />
  );
}
