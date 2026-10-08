"use client";

import { useEffect, useState, type ReactNode } from "react";

import { PosProvider, type TillInfo } from "@/components/custom/common/pos/pos-context";
import ShiftHeader from "@/components/custom/common/pos/shift-header";
import { formatTime } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";

/** The till's chrome during an open shift: live clock, header, and the till state. */
export default function ShiftShell({ till, children }: { till: TillInfo; children: ReactNode }) {
  const { locale } = useLocale();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <PosProvider till={till}>
      <div className="min-h-dvh bg-page">
        <ShiftHeader branchName={till.branchName} time={formatTime(now, locale)} />
        {children}
      </div>
    </PosProvider>
  );
}
