"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleQuestionMark, FileText, PanelsTopLeft, Usb } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import FormError from "@/components/custom/common/forms/form-error";
import HelpCenterDialog from "@/components/custom/common/back-office/help-center-dialog";
import OpenDrawer from "@/components/custom/common/pos/open-drawer";
import { usePrinter } from "@/components/custom/common/printer-context";
import { openDrawerFromBackOfficeAction } from "@/lib/backoffice/actions";
import { useTranslation } from "@/lib/i18n/use-translation";

type ChooseSectionActionsProps = {
  /** A manager at a till: their drawer opens are recorded on the till's shift. The Owner's aren't. */
  isManager: boolean;
};

export default function ChooseSectionActions({ isManager }: ChooseSectionActionsProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { printer, drawerVia, pair, openDrawer } = usePrinter();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Offer pairing when this device's printer (the drawer's only path without the Android bridge) isn't up.
  const needsPairing =
    drawerVia === "usb" && (printer.status === "disconnected" || printer.status === "error");

  const handleOpenDrawer = () => {
    setNotice(null);
    setError(null);
    startTransition(async () => {
      // Recorded first (when it can be): a refused open never pops the drawer.
      const result = await openDrawerFromBackOfficeAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const sendError = await openDrawer({ manual: true });
      if (sendError) setError(sendError);
      else setNotice(result.data.logged ? "Drawer opened. Recorded on this till's shift." : "Drawer opened.");
    });
  };

  return (
    <div className="space-y-2">
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
        {needsPairing && (
          <CustomButton
            label="Connect printer"
            icon={Usb}
            onClick={() => void pair()}
            className="h-10 border-2 border-rose-300 bg-white font-semibold text-rose-700 hover:bg-rose-50"
          />
        )}
        <OpenDrawer
          onConfirm={handleOpenDrawer}
          description={
            isManager
              ? undefined
              : "Open the cash drawer on this device without a sale? Owner opens aren't recorded on a shift."
          }
          trigger={
            <CustomButton
              label={isPending ? "Opening…" : t("chooseSection.openDrawer")}
              icon={PanelsTopLeft}
              disabled={isPending}
              className="h-10 bg-brand font-semibold text-white hover:bg-brand/90"
            />
          }
        />
      </div>
      <FormError message={error} />
      {notice && <p className="text-sm text-slate-500">{notice}</p>}
    </div>
  );
}
