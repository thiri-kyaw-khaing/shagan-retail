import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

type CustomButtonProps = {
  label?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

export default function CustomButton({
  label,
  onClick,
  icon: Icon,
  className = "",
  type = "button",
  disabled,
}: CustomButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center text-white transition hover:opacity-90 ${className}`}
    >
      <h1>{label}</h1>
      {Icon && <Icon className="h-5 w-5" />}
    </Button>
  );
}
