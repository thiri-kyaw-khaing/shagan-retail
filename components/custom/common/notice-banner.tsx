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
};

export default function NoticeBanner({
  tone,
  title,
  children,
}: NoticeBannerProps) {
  return (
    <div className={cn("rounded-xl p-4 text-sm", TONE_CLASSES[tone])}>
      <p className="font-semibold">{title}</p>
      {children && <p>{children}</p>}
    </div>
  );
}
