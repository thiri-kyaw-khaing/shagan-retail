"use client";

import { PanelsTopLeft } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import CustomButton from "../custom-button";
import { useTranslation } from "@/lib/i18n/use-translation";

type OpenDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function OpenDrawer({
  isOpen,
  onClose,
  onConfirm,
}: OpenDrawerProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl border-0 bg-white p-6 sm:max-w-md">
        <div className="flex size-14 items-center justify-center rounded-xl bg-rose-50">
          <PanelsTopLeft aria-hidden="true" className="size-7 text-rose-600" />
        </div>

        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl font-bold text-slate-800">
            {t("openDrawer.title")}
          </DialogTitle>

          <DialogDescription className="text-base leading-relaxed text-slate-500">
            {t("openDrawer.description")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CustomButton
            label={t("openDrawer.cancel")}
            onClick={onClose}
            className="min-h-11 w-full rounded-xl border border-rose-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-none hover:bg-rose-50"
          />

          <CustomButton
            label={t("openDrawer.confirm")}
            onClick={onConfirm}
            className="min-h-11 w-full rounded-xl bg-rose-600 px-3 text-sm font-semibold text-white hover:bg-rose-700"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
