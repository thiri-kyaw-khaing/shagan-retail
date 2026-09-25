"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight } from "lucide-react";

import FormInput from "@/components/custom/common/forms/form-input";
import FormSelect from "@/components/custom/common/forms/form-select";
import CustomButton from "@/components/custom/common/custom-button";
import OptionTiles from "@/components/custom/common/option-tiles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { roles } from "@/lib/types/model/roles";
import { branches } from "@/lib/types/model/branches";
import type { DrawerAccess } from "@/lib/types/model/staffs";
import { cn } from "@/lib/utils";

export type StaffFormValues = {
  name: string;
  phone: string;
  role: string;
  branch: string;
  drawerAccess: DrawerAccess;
};

type StaffFormDialogProps = {
  mode: "add" | "edit";
  isOpen: boolean;
  values: StaffFormValues;
  onClose: () => void;
  onSave: (values: StaffFormValues) => void;
};

const ROLE_OPTIONS = roles.map((role) => ({ value: role.name, label: role.name }));
const BRANCH_OPTIONS = branches.map((branch) => ({
  value: branch.name,
  label: branch.name,
}));

export default function StaffFormDialog({
  mode,
  isOpen,
  values,
  onClose,
  onSave,
}: StaffFormDialogProps) {
  const form = useForm<StaffFormValues>({ defaultValues: values });
  const canSubmit = mode === "edit" || form.watch("name").trim().length > 0;

  useEffect(() => {
    if (isOpen) form.reset(values);
  }, [form, isOpen, values]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl border-0 bg-white p-6 sm:max-w-2xl sm:p-10">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold text-slate-800">
            {mode === "add" ? "Add staff member" : "Edit staff member"}
          </DialogTitle>
          <DialogDescription className="text-base text-slate-500">
            {mode === "add"
              ? "Add a new staff member to your team."
              : "Update this staff member's information."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-5">
            <FormInput
              control={form.control}
              path="name"
              label="Full name"
              placeholder="e.g. Ma Hnin"
              className="text-sm font-semibold uppercase tracking-wide text-slate-500"
              inputClassName="mt-2 h-12 border-rose-200 text-base font-normal normal-case tracking-normal text-ink"
            />
            <FormInput
              control={form.control}
              path="phone"
              label="Phone number"
              placeholder="e.g. 09-421-000-000"
              className="text-sm font-semibold uppercase tracking-wide text-slate-500"
              inputClassName="mt-2 h-12 border-rose-200 text-base font-normal normal-case tracking-normal text-ink"
            />
            <FormSelect
              control={form.control}
              path="role"
              label="Role"
              options={ROLE_OPTIONS}
              className="text-sm font-semibold uppercase tracking-wide text-slate-500"
              selectClassName="mt-2 h-12 border-rose-200 text-base font-normal normal-case tracking-normal text-ink"
            />
            <FormSelect
              control={form.control}
              path="branch"
              label="Branch"
              options={BRANCH_OPTIONS}
              className="text-sm font-semibold uppercase tracking-wide text-slate-500"
              selectClassName="mt-2 h-12 border-rose-200 text-base font-normal normal-case tracking-normal text-ink"
            />

            {mode === "edit" && (
              <FormField
                control={form.control}
                name="drawerAccess"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Open drawer permission
                    </FormLabel>
                    <OptionTiles
                      options={[
                        { id: "allowed", label: "✓ Allowed" },
                        { id: "not_allowed", label: "🔒 Not Allowed" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <p className="text-sm text-slate-500">
                      {field.value === "allowed"
                        ? "This employee is allowed to open the cash drawer during a shift."
                        : "This employee is not allowed to open the cash drawer without a sale."}
                    </p>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="mt-2 sm:flex-row">
              <CustomButton
                label="Cancel"
                onClick={onClose}
                className="min-h-12 border border-slate-200 bg-white px-5 text-slate-600 shadow-none hover:bg-slate-50"
              />
              <CustomButton
                label={mode === "add" ? "Continue to PIN" : "Save changes"}
                icon={mode === "add" ? ArrowRight : undefined}
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "min-h-12 px-5 font-semibold text-white",
                  canSubmit ? "bg-brand hover:bg-brand/90" : "bg-rose-200",
                )}
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
