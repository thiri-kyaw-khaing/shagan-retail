"use client";

import { useForm, useWatch } from "react-hook-form";

import { Form } from "@/components/ui/form";
import FormError from "@/components/custom/common/forms/form-error";
import FormInput from "@/components/custom/common/forms/form-input";
import CustomButton from "@/components/custom/common/custom-button";
import { useTranslation } from "@/lib/i18n/use-translation";

type CreateCustomerFormValues = { fullName: string; phone: string };

type CreateCustomerFormProps = {
  onSave: (values: { name: string; phone: string }) => void;
  pending?: boolean;
  error?: string | null;
};

/** Name and phone are both required by the backend; the phone must be new to the org. */
export default function CreateCustomerForm({ onSave, pending = false, error }: CreateCustomerFormProps) {
  const { t } = useTranslation();
  const form = useForm<CreateCustomerFormValues>({ defaultValues: { fullName: "", phone: "" } });
  const [fullName, phone] = useWatch({ control: form.control, name: ["fullName", "phone"] });
  const canSubmit = !pending && fullName.trim() !== "" && phone.trim() !== "";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => onSave({ name: data.fullName.trim(), phone: data.phone.trim() }))}
        className="space-y-3"
      >
        <FormInput control={form.control} path="fullName" placeholder={t("customerDialog.fullNamePlaceholder")} />
        <FormInput control={form.control} path="phone" placeholder={t("customerDialog.phonePlaceholder")} />

        <FormError message={error} />

        <CustomButton
          label={pending ? "Saving..." : t("customerDialog.saveAndSelect")}
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-brand font-semibold hover:bg-brand/90"
        />
      </form>
    </Form>
  );
}
