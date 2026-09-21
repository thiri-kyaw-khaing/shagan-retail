import type { ComponentProps } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type LabeledTextareaProps = ComponentProps<typeof Textarea> & {
  label: string;
  labelClassName?: string;
};

export default function LabeledTextarea({
  label,
  labelClassName,
  className,
  ...props
}: LabeledTextareaProps) {
  return (
    <div>
      <h2 className={cn("mb-2 text-sm font-bold text-ink", labelClassName)}>
        {label}
      </h2>
      <Textarea
        className={cn("rounded-xl border-slate-200 bg-slate-50 text-sm", className)}
        {...props}
      />
    </div>
  );
}
