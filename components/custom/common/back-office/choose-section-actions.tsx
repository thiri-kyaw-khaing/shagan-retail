"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleQuestionMark, FileText, PanelsTopLeft } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import HelpCenterDialog from "@/components/custom/common/back-office/help-center-dialog";
import OpenDrawer from "@/components/custom/common/pos/open-drawer";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function ChooseSectionActions() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isOpenDrawerOpen, setIsOpenDrawerOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <CustomButton
          label={t("chooseSection.helpCenter")}
          icon={CircleQuestionMark}
          onClick={() => setIsHelpCenterOpen(true)}
          className="h-10 border-2 border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50"
        />
        <CustomButton
          label={t("chooseSection.customizeReceipt")}
          icon={FileText}
          onClick={() => router.push("/manager/customize-receipt")}
          className="h-10 border-2 border-rose-300 bg-white font-semibold text-rose-700 hover:bg-rose-50"
        />
        <CustomButton
          label={t("chooseSection.openDrawer")}
          icon={PanelsTopLeft}
          onClick={() => setIsOpenDrawerOpen(true)}
          className="h-10 bg-brand font-semibold text-white hover:bg-brand/90"
        />
      </div>

      <HelpCenterDialog
        isOpen={isHelpCenterOpen}
        onClose={() => setIsHelpCenterOpen(false)}
      />

      <OpenDrawer
        isOpen={isOpenDrawerOpen}
        onClose={() => setIsOpenDrawerOpen(false)}
        onConfirm={() => setIsOpenDrawerOpen(false)}
      />
    </>
  );
}
