"use client";

import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/custom/common/forms/form-input";
import CustomButton from "@/components/custom/common/custom-button";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { Customer } from "@/lib/types/model/customers";

type CreateCustomerFormValues = {
  fullName: string;
  phone: string;
};

type CreateCustomerFormProps = {
  onSave: (customer: Customer) => void;
};

export default function CreateCustomerForm({
  onSave,
}: CreateCustomerFormProps) {
  const { t } = useTranslation();
  const form = useForm<CreateCustomerFormValues>({
    defaultValues: { fullName: "", phone: "" },
  });

  const handleSubmit = (data: CreateCustomerFormValues) => {
    if (!data.fullName.trim()) return;

    onSave({
      id: Date.now(),
      name: data.fullName.trim(),
      phone: data.phone.trim(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <FormInput
          control={form.control}
          path="fullName"
          placeholder={t("customerDialog.fullNamePlaceholder")}
        />

        <FormInput
          control={form.control}
          path="phone"
          placeholder={t("customerDialog.phonePlaceholder")}
        />

        <CustomButton
          label={t("customerDialog.saveAndSelect")}
          type="submit"
          className="w-full bg-brand font-semibold hover:bg-brand/90"
        />
      </form>
    </Form>
  );
}
