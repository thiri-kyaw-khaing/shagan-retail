"use client";

import { Check } from "lucide-react";
import { LOCALE_OPTIONS } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/locale-context";

export default function LanguageMenu({ onSelect }: { onSelect: () => void }) {
  const { locale, setLocale } = useLocale();

  return (
    <div className="absolute top-full right-0 z-20 mt-2 w-48 rounded-2xl bg-white p-2 text-ink shadow-xl">
      {LOCALE_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => {
            setLocale(option.id);
            onSelect();
          }}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left font-medium hover:bg-muted"
        >
          {option.label}
          {locale === option.id && <Check className="h-4 w-4 text-brand" />}
        </button>
      ))}
    </div>
  );
}
