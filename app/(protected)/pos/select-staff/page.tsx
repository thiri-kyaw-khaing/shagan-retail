"use client";

import { Card } from "@/components/ui/card";
import BackButton from "@/components/custom/common/back-button";
import StaffCard from "@/components/custom/common/pos/staff-card";
import { staffs } from "@/lib/types/model/staffs";
import { useTranslation } from "@/lib/i18n/use-translation";

function SelectStaffPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-page px-4 py-10">
      <Card size="sm" className="w-full max-w-xl p-6 sm:p-10">
        <div className="text-center">
          <BackButton href="/portal" />

          <h1 className="mt-6 text-2xl font-bold text-ink sm:text-3xl">
            {t("selectStaff.title")}
          </h1>
          <p className="mt-2 text-ink-muted">{t("selectStaff.subtitle")}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {staffs.map((staff) => (
            <StaffCard key={staff.id} staff={staff} />
          ))}
        </div>
      </Card>
    </div>
  );
}

export default SelectStaffPage;
