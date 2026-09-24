import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  rose: "bg-rose-50 text-rose-700",
  amber: "bg-amber-50 text-amber-700",
} as const;

type NoticeBannerProps = {
  tone: keyof typeof TONE_CLASSES;
  title: ReactNode;
  children?: ReactNode;
  icon?: LucideIcon;
};

export default function NoticeBanner({
  tone,
  title,
  children,
  icon: Icon,
}: NoticeBannerProps) {
  return (
    <div className={cn("rounded-xl p-4 text-sm", TONE_CLASSES[tone])}>
      <p className="flex items-center gap-2 font-semibold">
        {Icon && <Icon className="size-4 shrink-0" />}
        {title}
      </p>
      {children && <p className="mt-1">{children}</p>}
    </div>
  );
}
