// components/custom/pos/numpad.tsx
"use client";

import { Delete } from "lucide-react";
import CustomButton from "@/components/custom/common/custom-button";
import { cn } from "@/lib/utils";

type NumPadMode = "pin" | "cash" | "pos";

type NumPadProps = {
  value: string;
  onChange: (v: string) => void;
  mode?: NumPadMode;
  disabled?: boolean;
  large?: boolean;
  maxPin?: number;
};

export default function NumPad({
  value,
  onChange,
  mode = "cash",
  disabled = false,
  large = false,
  maxPin,
}: NumPadProps) {
  const press = (k: string) => {
    if (disabled) return;
    if (k === "⌫") return onChange(value.slice(0, -1));
    if (k === "CLR") return onChange("");
    if (mode === "pin" && value.length >= (maxPin ?? 6)) return;
    if (k === "00")
      return onChange(
        value && value !== "0" ? value + "00" : value ? value : "0",
      );
    if (k === ".")
      return onChange(!value.includes(".") ? (value || "0") + "." : value);
    if (k === "+/-")
      return onChange(
        value.startsWith("-") ? value.slice(1) : value ? "-" + value : value,
      );
    if (value === "0") return onChange(k);
    if (value.replace(/[-.]/g, "").length < 10) onChange(value + k);
  };

  const keyHeight = large
    ? "min-h-[68px]"
    : mode === "pin"
      ? "min-h-[60px]"
      : "min-h-[56px]";
  const keyText = large || mode !== "pos" ? "text-2xl" : "text-xl";

  const Key = ({
    label,
    k,
    wide,
    icon,
    muted,
  }: {
    label?: string;
    k: string;
    wide?: boolean;
    icon?: typeof Delete;
    muted?: boolean;
  }) => (
    <CustomButton
      label={label}
      icon={icon}
      onClick={() => press(k)}
      disabled={disabled}
      className={cn(
        "border font-semibold shadow-sm active:scale-95",
        muted
          ? "border-border-light bg-muted text-ink-muted hover:bg-muted"
          : "border-border-light bg-surface text-ink hover:bg-rose-50 active:bg-rose-50",
        keyHeight,
        keyText,
        wide && "col-span-2",
      )}
    />
  );

  if (mode === "pin") {
    return (
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <Key key={d} label={d} k={d} />
        ))}
        <Key label="CLR" k="CLR" muted />
        <Key label="0" k="0" />
        <Key k="⌫" icon={Delete} muted />
      </div>
    );
  }

  if (mode === "pos") {
    return (
      <div className="grid grid-cols-4 gap-1.5">
        {["7", "8", "9"].map((d) => (
          <Key key={d} label={d} k={d} />
        ))}
        <Key k="⌫" icon={Delete} muted />
        {["4", "5", "6"].map((d) => (
          <Key key={d} label={d} k={d} />
        ))}
        <Key label="+/-" k="+/-" muted />
        {["1", "2", "3"].map((d) => (
          <Key key={d} label={d} k={d} />
        ))}
        <Key label="." k="." muted />
        <Key label="0" k="0" wide />
        <Key label="00" k="00" />
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-3", large ? "gap-3" : "gap-2")}>
      {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((d) => (
        <Key key={d} label={d} k={d} />
      ))}
      <Key k="⌫" icon={Delete} muted />
      <Key label="0" k="0" />
      <Key label="00" k="00" />
    </div>
  );
}

/** PIN progress dots — the four circles above the keypad on the PIN screen. */
export function PinDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < current;
        return (
          <div
            key={i}
            className={cn(
              "h-4 w-4 rounded-full transition-transform",
              filled
                ? "scale-110 bg-brand"
                : "border-2 border-border-medium bg-transparent",
            )}
          />
        );
      })}
    </div>
  );
}
