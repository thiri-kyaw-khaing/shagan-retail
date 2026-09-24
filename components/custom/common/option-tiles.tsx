import CustomButton from "@/components/custom/common/custom-button";
import { cn } from "@/lib/utils";

type Option<T extends string> = { id: T; label: string };

type OptionTilesProps<T extends string> = {
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: 1 | 2;
};

export default function OptionTiles<T extends string>({
  options,
  value,
  onChange,
  columns = 2,
}: OptionTilesProps<T>) {
  return (
    <div className={cn("grid gap-3", columns === 1 ? "grid-cols-1" : "grid-cols-2")}>
      {options.map((option) => {
        const active = value === option.id;

        return (
          <CustomButton
            key={option.id}
            label={option.label}
            onClick={() => onChange(option.id)}
            className={cn(
              "min-h-14 rounded-xl border-2 bg-white font-semibold hover:border-slate-400 hover:bg-slate-50",
              columns === 1 && "justify-start px-4 text-left",
              active
                ? "border-rose-800 text-rose-800"
                : "border-slate-200 text-slate-700",
            )}
          />
        );
      })}
    </div>
  );
}
