import { toBcp47, type Locale } from "./config";

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(toBcp47(locale), {
    dateStyle: "medium",
  }).format(date);
}

export function formatTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(toBcp47(locale), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(toBcp47(locale)).format(value);
}

export function formatCurrency(amount: number, locale: Locale): string {
  return `K ${formatNumber(amount, locale)}`;
}
