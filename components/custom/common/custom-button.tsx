import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CustomButtonProps = {
  label?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  "aria-label"?: string;
};

export default function CustomButton({
  label,
  onClick,
  icon: Icon,
  className,
  type = "button",
  disabled,
  "aria-label": ariaLabel,
}: CustomButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "flex items-center justify-center text-white transition hover:brightness-110",
        className,
      )}
    >
      <span>{label}</span>
      {Icon && <Icon className="h-5 w-5" />}
    </Button>
  );
}
