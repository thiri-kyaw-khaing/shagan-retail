import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { HTMLInputTypeAttribute } from "react";
import { Control, FieldValues, Path } from "react-hook-form";

type FormsInputPops<T extends FieldValues> = {
  control: Control<T, any, any>;
  path: Path<T>;
  label?: string;
  type?: HTMLInputTypeAttribute;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  readonly?: boolean;
};

export default function FormsInput<T extends FieldValues>({
  control,
  path,
  label,
  type,
  className,
  placeholder,
  inputClassName,
  readonly,
}: FormsInputPops<T>) {
  return (
    <FormField
      control={control as Control<T>}
      name={path}
      render={({ field }) => (
        <FormItem className={cn("w-full", className)}>
          {label && <FormLabel className="text-sm">{label}</FormLabel>}

          <FormControl>
            <Input
              {...field}
              value={field.value ?? ""}
              type={type}
              placeholder={placeholder || `Enter ${label || "input"}`}
              className={cn(
                "w-full",
                inputClassName,
                readonly && "bg-gray-100 cursor-not-allowed",
              )}
              readOnly={readonly}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
