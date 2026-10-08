"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowLeft, Monitor } from "lucide-react";

import NumPad from "@/components/custom/common/numpad";
import FormError from "@/components/custom/common/forms/form-error";
import FormInput from "@/components/custom/common/forms/form-input";
import CustomButton from "@/components/custom/common/custom-button";
import { Form } from "@/components/ui/form";
import Logo from "@/components/custom/logo/logo";
import { useTranslation } from "@/lib/i18n/use-translation";
import { openShiftAction, signOutStaffAction } from "@/lib/pos/actions";

type OpenShiftFormValues = { cash: string };

type OpenShiftFormProps = { branchName: string; cashierName: string };

export default function OpenShiftForm({ branchName, cashierName }: OpenShiftFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<OpenShiftFormValues>({ defaultValues: { cash: "K 0" } });
  const cash = form.watch("cash").replace(/^K\s*/, "");

  const handleCashChange = (value: string) => {
    setError(null);
    form.setValue("cash", `K ${value || "0"}`);
  };

  const onSubmit = () => {
    startTransition(async () => {
      const result = await openShiftAction(cash);
      if (result.ok) router.push("/pos/sell");
      else if (result.signedOut) router.push("/pos/select-staff");
      else setError(result.error);
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4 py-8">
      <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-md sm:p-8">
        {/* "Not you?" - ends this cashier's sign-in. */}
        <button
          type="button"
          onClick={() => startTransition(() => signOutStaffAction())}
          aria-label="Back to staff sign-in"
          className="flex size-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="mb-2 flex flex-col items-center gap-3 sm:gap-4">
          <Logo icon={<Monitor />} className="h-10 w-10 sm:h-12 sm:w-12" />
          <div className="text-center text-sm">
            <p className="text-muted-foreground">{t("openShift.startingShift")}</p>
            <h1 className="text-base font-semibold sm:text-lg">{branchName}</h1>
            <p className="text-muted-foreground">
              {t("openShift.cashierLabel")}: {cashierName}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormInput
              control={form.control}
              path="cash"
              label={t("openShift.cashAmountLabel")}
              placeholder="K 0"
              readonly
              className="mb-4"
              inputClassName="h-14 sm:h-16 text-right !text-3xl sm:!text-4xl font-bold"
            />
            <NumPad value={cash} onChange={handleCashChange} mode="cash" />

            <FormError message={error} />

            <CustomButton
              label={isPending ? "Opening..." : t("openShift.submit")}
              type="submit"
              disabled={cash === "0" || isPending}
              className="mt-4 h-11 w-full bg-brand text-base font-semibold hover:bg-brand/90 sm:text-sm"
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
