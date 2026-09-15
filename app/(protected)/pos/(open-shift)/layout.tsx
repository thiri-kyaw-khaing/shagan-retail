"use client";

import { useEffect, useState } from "react";
import ShiftHeader from "@/components/custom/common/pos/shift-header";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatTime } from "@/lib/i18n/format";

function ShiftLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-dvh bg-page">
      <ShiftHeader
        branchName="Main Street Branch"
        time={formatTime(now, locale)}
      />
      {children}
    </div>
  );
}

export default ShiftLayout;
