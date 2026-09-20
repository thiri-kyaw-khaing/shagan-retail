"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import SyncStatus from "@/components/custom/common/pos/sync-status";
import { DeviceStatusCard } from "@/components/custom/common/device-status-card";
import CustomButton from "@/components/custom/common/custom-button";
import { useTranslation } from "@/lib/i18n/use-translation";

type SettingsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SettingsDialog({
  isOpen,
  onClose,
}: SettingsDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex max-h-[90dvh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-2xl">
        {/* Header */}
        <DialogHeader className="shrink-0 border-b border-rose-200 px-6 py-6 text-left sm:px-8">
          <DialogTitle className="text-2xl font-bold text-slate-800">
            {t("settingsDialog.title")}
          </DialogTitle>

          <DialogDescription className="mt-2 text-base text-slate-500">
            {t("settingsDialog.description")}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-7 sm:px-8">
          <SyncStatus />

          <section className="border-t border-rose-200 pt-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                {t("settingsDialog.deviceHealthTitle")}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {t("settingsDialog.deviceHealthSubtitle")}
              </p>
            </div>

            <DeviceStatusCard />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
