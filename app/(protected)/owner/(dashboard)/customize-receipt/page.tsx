"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Printer } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import CustomizeReceiptTabs, {
  type CustomizeReceiptTab,
} from "@/components/custom/common/back-office/customize-receipt/customize-receipt-tabs";
import ReceiptFieldHeader from "@/components/custom/common/back-office/customize-receipt/receipt-field-header";
import ReceiptPreview from "@/components/custom/common/back-office/customize-receipt/receipt-preview";
import CustomButton from "@/components/custom/common/custom-button";
import FormInput from "@/components/custom/common/forms/form-input";
import FormSelect from "@/components/custom/common/forms/form-select";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { branches } from "@/lib/types/model/branches";
import {
  receiptSettings,
  type ReceiptSettings,
} from "@/lib/types/model/receipt-settings";
import { cn } from "@/lib/utils";

const ADDRESS_MAX = 150;
const THANK_YOU_MAX = 120;

const LABEL_CLASS = "text-xs font-bold tracking-wide text-slate-500 uppercase";
const INPUT_CLASS = "h-11 rounded-xl border-slate-200 bg-slate-50";

type CustomizeReceiptFormValues = {
  branchId: string;
  shopName: string;
  address: string;
  showAddress: boolean;
  phone: string;
  showPhone: boolean;
  thankYouMessage: string;
  showThankYouMessage: boolean;
};

const branchOptions = branches.map((branch) => ({
  value: String(branch.id),
  label: branch.name,
}));

function getSettingsForBranch(branchId: number): ReceiptSettings {
  return (
    receiptSettings.find((settings) => settings.branchId === branchId) ??
    receiptSettings[0]
  );
}

function toFormValues(settings: ReceiptSettings): CustomizeReceiptFormValues {
  return {
    branchId: String(settings.branchId),
    shopName: settings.shopName,
    address: settings.address,
    showAddress: settings.showAddress,
    phone: settings.phone,
    showPhone: settings.showPhone,
    thankYouMessage: settings.thankYouMessage,
    showThankYouMessage: settings.showThankYouMessage,
  };
}

function CustomizeReceiptPage() {
  const [activeTab, setActiveTab] = useState<CustomizeReceiptTab>("receipt");

  const form = useForm<CustomizeReceiptFormValues>({
    defaultValues: toFormValues(getSettingsForBranch(branches[0].id)),
  });

  const branchId = form.watch("branchId");
  const canSave =
    form.watch("shopName").trim().length > 0 &&
    form.watch("address").trim().length > 0;

  useEffect(() => {
    console.log("Customize Receipt - branch changed:", branchId);
    form.reset(toFormValues(getSettingsForBranch(Number(branchId))));
    // Only branch switches should reload the form, not every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  const handleCancel = () => {
    console.log("Customize Receipt - cancel, reverting to last saved values");
    form.reset();
  };

  const handleSave = (values: CustomizeReceiptFormValues) => {
    console.log("Customize Receipt - saved:", values);
    form.reset(values);
  };

  const handlePrintTest = () => {
    console.log("Customize Receipt - print test receipt:", form.getValues());
  };

  const previewSettings: ReceiptSettings = {
    branchId: Number(branchId),
    shopName: form.watch("shopName"),
    address: form.watch("address"),
    showAddress: form.watch("showAddress"),
    phone: form.watch("phone"),
    showPhone: form.watch("showPhone"),
    thankYouMessage: form.watch("thankYouMessage"),
    showThankYouMessage: form.watch("showThankYouMessage"),
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Customize Receipt"
        subtitle="Manage your receipt layout and QR payment code."
        backHref="/owner"
      />

      <CustomizeReceiptTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "qr" ? (
        <p className="mt-6 text-sm text-slate-500">
          QR Payment settings are coming soon.
        </p>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSave)}
            className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px] lg:items-start"
          >
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <FormSelect
                  control={form.control}
                  path="branchId"
                  label="Receipt settings for"
                  options={branchOptions}
                  className={LABEL_CLASS}
                  selectClassName="mt-2 h-11"
                />
              </div>

              <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="font-bold text-ink">Receipt information</h2>

                <FormInput
                  control={form.control}
                  path="shopName"
                  label="Shop Name"
                  className={LABEL_CLASS}
                  inputClassName={INPUT_CLASS}
                />

                <div>
                  <ReceiptFieldHeader
                    label="Address"
                    required
                    charCount={{
                      current: form.watch("address").length,
                      max: ADDRESS_MAX,
                    }}
                    show={form.watch("showAddress")}
                    onShowChange={(show) =>
                      form.setValue("showAddress", show, { shouldDirty: true })
                    }
                  />
                  <Textarea
                    {...form.register("address")}
                    maxLength={ADDRESS_MAX}
                    className="rounded-xl border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <ReceiptFieldHeader
                    label="Phone Number"
                    show={form.watch("showPhone")}
                    onShowChange={(show) =>
                      form.setValue("showPhone", show, { shouldDirty: true })
                    }
                  />
                  <Input
                    {...form.register("phone")}
                    className={cn(INPUT_CLASS)}
                  />
                </div>

                <div>
                  <ReceiptFieldHeader
                    label="Thank-you Message"
                    charCount={{
                      current: form.watch("thankYouMessage").length,
                      max: THANK_YOU_MAX,
                    }}
                    show={form.watch("showThankYouMessage")}
                    onShowChange={(show) =>
                      form.setValue("showThankYouMessage", show, {
                        shouldDirty: true,
                      })
                    }
                  />
                  <Textarea
                    {...form.register("thankYouMessage")}
                    maxLength={THANK_YOU_MAX}
                    className="rounded-xl border-slate-200 bg-slate-50"
                  />
                  <p className="mt-2 text-sm text-slate-400">
                    This message will appear at the bottom of the receipt.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <CustomButton
                  label="Print Test Receipt"
                  icon={Printer}
                  onClick={handlePrintTest}
                  className="h-11 border-2 border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50"
                />

                <div className="flex gap-3">
                  <CustomButton
                    label="Cancel"
                    onClick={handleCancel}
                    className="h-11 border-2 border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50"
                  />
                  <CustomButton
                    label="Save Changes"
                    type="submit"
                    disabled={!canSave}
                    className="h-11 bg-brand font-semibold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-rose-200"
                  />
                </div>
              </div>
            </div>

            <div className="lg:sticky lg:top-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                  Receipt Preview
                </p>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                  Preview only
                </span>
              </div>
              <ReceiptPreview settings={previewSettings} />
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}

export default CustomizeReceiptPage;
