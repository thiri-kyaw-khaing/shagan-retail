"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import CustomButton from "@/components/custom/common/custom-button";
import StaffCard from "@/components/custom/common/pos/staff-card";
import { staffs } from "@/lib/types/model/staffs";

function SelectStaffPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-page px-4 py-10">
      <Card size="sm" className="w-full max-w-xl p-6 sm:p-10">
        <div className="text-center">
          <CustomButton
            icon={ChevronLeft}
            onClick={() => router.back()}
            className="bg-transparent p-2 text-ink hover:bg-transparent hover:opacity-70"
          />

          <h1 className="mt-6 text-2xl font-bold text-ink sm:text-3xl">
            Select your name to continue
          </h1>
          <p className="mt-2 text-ink-muted">
            Tap your name to proceed to PIN entry
          </p>
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
