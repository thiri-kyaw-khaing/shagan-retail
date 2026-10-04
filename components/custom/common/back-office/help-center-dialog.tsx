"use client";

import { useState, type ReactNode } from "react";
import { CircleQuestionMark, Shield } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CustomButton from "@/components/custom/common/custom-button";
import OptionTiles from "@/components/custom/common/option-tiles";
import { useTranslation } from "@/lib/i18n/use-translation";

type ProviderPermission = "allowed" | "not_allowed";

type HelpCenterDialogProps = {
  trigger: ReactNode;
};

export default function HelpCenterDialog({ trigger }: HelpCenterDialogProps) {
  const { t } = useTranslation();
  const [permission, setPermission] = useState<ProviderPermission | null>(
    null,
  );

  const statusLabel =
    permission === "allowed"
      ? t("helpCenterDialog.statusAllowed")
      : permission === "not_allowed"
        ? t("helpCenterDialog.statusNotAllowed")
        : t("helpCenterDialog.statusNotSet");

  const handleSelect = (value: ProviderPermission) => {
    console.log("[HelpCenterDialog] permission selected:", value);
    setPermission(value);
  };

  const handleSave = () => {
    if (!permission) return;
    console.log("[HelpCenterDialog] saved permission:", permission);
  };

  return (
    <Dialog
      onOpenChange={(open) =>
        console.log("[HelpCenterDialog] open changed:", open)
      }
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl border-0 bg-white p-6 sm:max-w-md">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-rose-600">
            <CircleQuestionMark
              aria-hidden="true"
              className="size-6 text-white"
            />
          </div>

          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-bold text-slate-800">
              {t("helpCenterDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {t("helpCenterDialog.subtitle")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <p className="text-sm leading-relaxed text-slate-500">
          {t("helpCenterDialog.description")}
        </p>

        <div className="overflow-hidden rounded-xl border border-rose-100">
          <div className="flex items-start justify-between gap-3 bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-600">
                <Shield aria-hidden="true" className="size-5 text-white" />
              </div>

              <div>
                <p className="font-bold text-slate-800">
                  {t("helpCenterDialog.accessTitle")}
                </p>
                <p className="text-sm text-slate-500">
                  {t("helpCenterDialog.accessSubtitle")}
                </p>
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">
              {statusLabel}
            </span>
          </div>

          <div className="space-y-2 bg-white p-4">
            <OptionTiles
              options={[
                { id: "allowed", label: t("helpCenterDialog.allowed") },
                {
                  id: "not_allowed",
                  label: t("helpCenterDialog.notAllowed"),
                },
              ]}
              value={permission}
              onChange={handleSelect}
            />

            <p className="text-sm text-slate-500">
              {t("helpCenterDialog.helperText")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-rose-50 p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white">
            <CircleQuestionMark
              aria-hidden="true"
              className="size-4 text-rose-600"
            />
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {t("helpCenterDialog.contactSupportLabel")}
            </p>
            <p className="font-bold text-slate-800">
              {t("helpCenterDialog.supportEmail")}
            </p>
          </div>
        </div>

        <DialogFooter className="mt-2 grid grid-cols-2 gap-3">
          <DialogClose asChild>
            <CustomButton
              label={t("helpCenterDialog.cancel")}
              className="min-h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-none hover:bg-slate-50"
            />
          </DialogClose>

          <DialogClose asChild>
            <CustomButton
              label={t("helpCenterDialog.savePermission")}
              onClick={handleSave}
              disabled={!permission}
              className="min-h-11 w-full rounded-xl bg-rose-600 px-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
            />
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
