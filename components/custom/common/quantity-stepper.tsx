import { Minus, Plus } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import { cn } from "@/lib/utils";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
};

export default function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  size = "md",
}: QuantityStepperProps) {
  const buttonSize = size === "sm" ? "size-8" : "size-11";

  return (
    <div className="flex items-center gap-3">
      <CustomButton
        icon={Minus}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          buttonSize,
          "rounded-lg bg-slate-100 p-0 text-slate-600 shadow-none hover:bg-slate-200 disabled:opacity-40",
        )}
      />

      <span
        className="min-w-6 text-center font-semibold text-slate-900"
        aria-label={`Quantity ${value}`}
      >
        {value}
      </span>

      <CustomButton
        icon={Plus}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(
          buttonSize,
          "rounded-lg bg-slate-100 p-0 text-slate-600 shadow-none hover:bg-slate-200 disabled:opacity-40",
        )}
      />
    </div>
  );
}
