export type Locale = "en" | "mm" | "zh";

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_OPTIONS: { id: Locale; label: string }[] = [
  { id: "en", label: "English" },
  { id: "mm", label: "မြန်မာ" },
  { id: "zh", label: "中文" },
];

const BCP47: Record<Locale, string> = {
  en: "en-US",
  mm: "my",
  zh: "zh-CN",
};

export function toBcp47(locale: Locale): string {
  return BCP47[locale];
}

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "mm" || value === "zh";
}
