"use client";

import type { LucideIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomButton from "@/components/custom/common/custom-button";

type PlaceholderDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  icon: LucideIcon;
  title: string;
  description: string;
};

export default function PlaceholderDialog({
  isOpen,
  onClose,
  icon: Icon,
  title,
  description,
}: PlaceholderDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl border-0 bg-white p-6 sm:max-w-md">
        <div className="flex size-14 items-center justify-center rounded-xl bg-rose-50">
          <Icon aria-hidden="true" className="size-7 text-rose-600" />
        </div>

        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl font-bold text-slate-800">
            {title}
          </DialogTitle>

          <DialogDescription className="text-base leading-relaxed text-slate-500">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2">
          <CustomButton
            label="Close"
            onClick={onClose}
            className="min-h-11 w-full rounded-xl bg-rose-600 px-3 text-sm font-semibold text-white hover:bg-rose-700"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
