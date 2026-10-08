import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import CustomButton from "@/components/custom/common/custom-button";
import FormError from "@/components/custom/common/forms/form-error";
import NumPad, { PinDots } from "@/components/custom/common/numpad";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

const PIN_LENGTH = 6;

type ManagerApprovalStepProps = {
  title: string;
  subtitle: string;
  pin: string;
  onPinChange: (pin: string) => void;
  onSubmit: () => void;
  /** Shown above the PIN, e.g. the approver picker. */
  children?: ReactNode;
  pending?: boolean;
  error?: string | null;
};

export default function ManagerApprovalStep({
  title,
  subtitle,
  pin,
  onPinChange,
  onSubmit,
  children,
  pending = false,
  error,
}: ManagerApprovalStepProps) {
  const { t } = useTranslation();
  const canSubmit = pin.length === PIN_LENGTH && !pending;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 pt-8 text-center bg-white rounded-2xl p-6 shadow-md sm:px-10 sm:pt-10 ">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-brand text-white">
        <Lock className="size-7" />
      </div>

      <h1 className="mt-4 text-xl font-bold text-ink">{title}</h1>
      <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>

      {children && <div className="mt-4 w-full text-left">{children}</div>}

      <div className="mt-6">
        <PinDots total={PIN_LENGTH} current={pin.length} />
      </div>

      <div className="mt-4 w-full">
        <FormError message={error} />
      </div>

      <div className="mt-8 w-full ">
        <NumPad
          value={pin}
          onChange={onPinChange}
          mode="pin"
          maxPin={PIN_LENGTH}
        />
      </div>

      <div className="mt-6 w-full">
        <CustomButton
          label={pending ? "Checking..." : `${t("return.continue")} →`}
          onClick={onSubmit}
          disabled={!canSubmit}
          className={cn(
            "h-12 w-full py-3 font-semibold",
            canSubmit
              ? "bg-brand text-white hover:bg-brand/90"
              : "bg-rose-200 text-white/80",
          )}
        />
      </div>
    </div>
  );
}
