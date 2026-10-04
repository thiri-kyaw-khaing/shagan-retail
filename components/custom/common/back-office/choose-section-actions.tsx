"use client";

import { useRouter } from "next/navigation";
import { CircleQuestionMark, FileText, PanelsTopLeft } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import HelpCenterDialog from "@/components/custom/common/back-office/help-center-dialog";
import OpenDrawer from "@/components/custom/common/pos/open-drawer";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function ChooseSectionActions() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <HelpCenterDialog
        trigger={
          <CustomButton
            label={t("chooseSection.helpCenter")}
            icon={CircleQuestionMark}
            className="h-10 border-2 border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50"
          />
        }
      />
      <CustomButton
        label={t("chooseSection.customizeReceipt")}
        icon={FileText}
        onClick={() => router.push("/owner/customize-receipt")}
        className="h-10 border-2 border-rose-300 bg-white font-semibold text-rose-700 hover:bg-rose-50"
      />
      <OpenDrawer
        trigger={
          <CustomButton
            label={t("chooseSection.openDrawer")}
            icon={PanelsTopLeft}
            className="h-10 bg-brand font-semibold text-white hover:bg-brand/90"
          />
        }
      />
    </div>
  );
}
