import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Control, FieldValues, Path } from "react-hook-form";

type FormSelectOption = { value: string; label: string };

type FormSelectProps<T extends FieldValues> = {
  control: Control<T>;
  path: Path<T>;
  label?: string;
  options: FormSelectOption[];
  className?: string;
  selectClassName?: string;
};

export default function FormSelect<T extends FieldValues>({
  control,
  path,
  label,
  options,
  className,
  selectClassName,
}: FormSelectProps<T>) {
  return (
    <FormField
      control={control as Control<T>}
      name={path}
      render={({ field }) => (
        <FormItem className={cn("w-full", className)}>
          {label && <FormLabel className="text-sm">{label}</FormLabel>}

          <FormControl>
            <select
              {...field}
              className={cn(
                "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm",
                selectClassName,
              )}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
