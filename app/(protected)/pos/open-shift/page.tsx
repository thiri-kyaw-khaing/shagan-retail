"use client";
import NumPad from "@/components/custom/common/numpad";
import FormInput from "@/components/custom/common/forms/form-input";
import CustomButton from "@/components/custom/common/custom-button";
import BackButton from "@/components/custom/common/back-button";
import { Form } from "@/components/ui/form";
import { Monitor } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Logo from "@/components/custom/logo/logo";
import { useTranslation } from "@/lib/i18n/use-translation";

type OpenShiftFormValues = {
  cash: string;
};

function OpenShift() {
  const router = useRouter();
  const { t } = useTranslation();

  const form = useForm<OpenShiftFormValues>({
    defaultValues: { cash: "K 0" },
  });

  const cash = form.watch("cash").replace(/^K\s*/, "");

  const handleCashChange = (value: string) => {
    form.setValue("cash", `K ${value || "0"}`);
  };

  const onSubmit = (data: OpenShiftFormValues) => {
    console.log(data);
    router.push("/pos/sell");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4 py-8">
      <div className="bg-background p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm">
        <BackButton href="/pos/pin" />
        {/* Logo + Branch Info */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 mb-2">
          <Logo icon={<Monitor />} className="h-10 w-10 sm:h-12 sm:w-12" />
          <div className="text-center text-sm ">
            <p className="text-muted-foreground">
              {t("openShift.startingShift")}
            </p>
            <h1 className="text-base sm:text-lg font-semibold">
              Main Street Branch
            </h1>
            <p className="text-muted-foreground">
              {t("openShift.cashierLabel")}: Ma Thida
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
            {/* Numpad for cash input */}
            <NumPad
              value={cash}
              onChange={handleCashChange}
              mode="cash"
              maxPin={4}
            />

            <CustomButton
              label={t("openShift.submit")}
              type="submit"
              disabled={cash === "0"}
              className="mt-4 h-11 w-full bg-brand hover:bg-brand/90 text-base font-semibold sm:text-sm"
            />
          </form>
        </Form>
      </div>
    </div>
  );
}

export default OpenShift;
