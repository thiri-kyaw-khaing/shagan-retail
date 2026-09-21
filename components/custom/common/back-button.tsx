"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import CustomButton from "./custom-button";

type BackButtonProps = {
  href?: string;
  className?: string;
  onClick?: () => void;
};

export default function BackButton({
  href,
  className,
  onClick,
}: BackButtonProps) {
  const router = useRouter();

  return (
    <CustomButton
      icon={ChevronLeft}
      onClick={onClick ?? (() => href && router.push(href))}
      className={cn(
        "bg-transparent p-2 text-ink hover:bg-transparent hover:opacity-70",
        className,
      )}
    />
  );
}
