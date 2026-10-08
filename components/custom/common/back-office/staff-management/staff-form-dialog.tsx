"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import FormError from "@/components/custom/common/forms/form-error";
import FormInput from "@/components/custom/common/forms/form-input";
import FormSelect from "@/components/custom/common/forms/form-select";
import CustomButton from "@/components/custom/common/custom-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import type { StaffStatus } from "@/lib/types/model/staffs";
import { cn } from "@/lib/utils";

/** Ids are strings for the selects. `pin` is blank on edit unless it's being changed. */
export type StaffFormValues = {
  name: string;
  phone: string;
  roleId: string;
  branchId: string;
  pin: string;
  status: StaffStatus;
};

type Option = { value: string; label: string };

type StaffFormDialogProps = {
  mode: "add" | "edit";
  isOpen: boolean;
  values: StaffFormValues;
  roleOptions: Option[];
  branchOptions: Option[];
  onClose: () => void;
  onSave: (values: StaffFormValues) => void;
  pending?: boolean;
  error?: string | null;
};

// The backend stores any string; offer only the three it understands.
const STATUS_OPTIONS: Option[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const LABEL_CLASS = "text-sm font-semibold uppercase tracking-wide text-slate-500";
const INPUT_CLASS =
  "mt-2 h-12 border-rose-200 text-base font-normal normal-case tracking-normal text-ink";

const isPin = (value: string) => /^\d{6}$/.test(value);

export default function StaffFormDialog({
  mode,
  isOpen,
  values,
  roleOptions,
  branchOptions,
  onClose,
  onSave,
  pending = false,
  error,
}: StaffFormDialogProps) {
  const form = useForm<StaffFormValues>({ defaultValues: values });
  const [name, phone, pin] = form.watch(["name", "phone", "pin"]);
  // A PIN is required on create; on edit, blank keeps the current one.
  const pinOk = mode === "add" ? isPin(pin) : pin === "" || isPin(pin);
  const canSubmit = !pending && name.trim() !== "" && phone.trim() !== "" && pinOk;

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
              ? "Add a new staff member. They sign in at the till with their PIN."
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
              className={LABEL_CLASS}
              inputClassName={INPUT_CLASS}
            />
            <FormInput
              control={form.control}
              path="phone"
              label="Phone number"
              placeholder="e.g. 09-421-000-000"
              className={LABEL_CLASS}
              inputClassName={INPUT_CLASS}
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormSelect
                control={form.control}
                path="roleId"
                label="Role"
                options={roleOptions}
                className={LABEL_CLASS}
                selectClassName={INPUT_CLASS}
              />
              <FormSelect
                control={form.control}
                path="branchId"
                label="Branch"
                options={branchOptions}
                className={LABEL_CLASS}
                selectClassName={INPUT_CLASS}
              />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <FormInput
                  control={form.control}
                  path="pin"
                  type="password"
                  label={mode === "add" ? "6-digit PIN" : "New PIN (optional)"}
                  placeholder={mode === "add" ? "••••••" : "Leave blank to keep"}
                  className={LABEL_CLASS}
                  inputClassName={INPUT_CLASS}
                />
                {pin !== "" && !isPin(pin) && (
                  <p className="mt-1 text-xs text-brand">The PIN must be exactly 6 digits.</p>
                )}
              </div>
              {mode === "edit" && (
                <FormSelect
                  control={form.control}
                  path="status"
                  label="Status"
                  options={STATUS_OPTIONS}
                  className={LABEL_CLASS}
                  selectClassName={INPUT_CLASS}
                />
              )}
            </div>

            <FormError message={error} />

            <DialogFooter className="mt-2 sm:flex-row">
              <CustomButton
                label="Cancel"
                onClick={onClose}
                className="min-h-12 border border-slate-200 bg-white px-5 text-slate-600 shadow-none hover:bg-slate-50"
              />
              <CustomButton
                label={pending ? "Saving..." : mode === "add" ? "Add staff" : "Save changes"}
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
