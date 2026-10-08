import { toBcp47, type Locale } from "./config";

/**
 * The shop's time zone. Dates are pinned to it rather than the machine's
 * clock so the server render (likely UTC in the cloud) and the browser show
 * the same time, and every till and the Back Office agree on what "8 Oct" is.
 */
export const BUSINESS_TIME_ZONE = "Asia/Yangon";
/**
 * Its fixed UTC offset (Myanmar has no daylight saving), for turning the
 * backend's local "YYYY-MM-DD" / "HH:00" report labels into instants. The org
 * timezone isn't exposed to tenant endpoints, so it's pinned here too.
 */
export const BUSINESS_UTC_OFFSET = "+06:30";

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(toBcp47(locale), {
    dateStyle: "medium",
    timeZone: BUSINESS_TIME_ZONE,
  }).format(date);
}

export function formatTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(toBcp47(locale), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: BUSINESS_TIME_ZONE,
  }).format(date);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(toBcp47(locale)).format(value);
}

export function formatCurrency(amount: number, locale: Locale): string {
  return `K ${formatNumber(amount, locale)}`;
}

export function formatShortDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(toBcp47(locale), {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: BUSINESS_TIME_ZONE,
  }).format(date);
}

export function formatClockTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(toBcp47(locale), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: BUSINESS_TIME_ZONE,
  }).format(date);
}
