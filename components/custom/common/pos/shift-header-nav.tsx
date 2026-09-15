"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Pause, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/use-translation";

type ShiftHeaderNavProps = {
  heldCount?: number;
};

const NAV_ITEMS = [
  { id: "sell", href: "/pos/sell", labelKey: "nav.sell", icon: ShoppingCart },
  { id: "held", href: "/pos/held", labelKey: "nav.held", icon: Pause },
  {
    id: "salesHistory",
    href: "/pos/sales-history",
    labelKey: "nav.salesHistory",
    icon: History,
  },
] as const;

export default function ShiftHeaderNav({ heldCount = 0 }: ShiftHeaderNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="flex items-center gap-2">
      {NAV_ITEMS.map(({ id, href, labelKey, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        const count = id === "held" ? heldCount : 0;

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition",
              isActive
                ? "bg-white text-brand"
                : "bg-white/15 text-white hover:bg-white/25",
            )}
          >
            <Icon className="h-4 w-4" />
            {t(labelKey)}
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-dark text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
