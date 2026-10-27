// The organization's tier, as GET /me reports it (WORKFLOWS "Subscription
// tiers"). The backend enforces it; the app only uses it to explain things.
import type { ApiSubscription } from "@/lib/api/types";

/** Features a higher tier adds. None is built yet; each one checks hasFeature when it is. */
export type FeatureCode =
  | "customer_display"
  | "advanced_reports"
  | "report_export"
  | "promotions"
  | "loyalty"
  | "sms_receipts"
  | "api_access";

export function hasFeature(subscription: ApiSubscription | null | undefined, code: FeatureCode): boolean {
  return subscription?.features.includes(code) ?? false;
}

/** How long until the plan ends, ending soon to show. Plain enough to render on the server. */
export type PlanNotice =
  | { kind: "trial"; daysLeft: number }
  | { kind: "ending"; endsOn: string }
  | { kind: "grace"; daysLeft: number }
  | { kind: "expired" }
  | { kind: "overLimit"; what: "branches" | "devices"; max: number; current: number };

const DAY = 24 * 60 * 60 * 1000;
/** Paid plans get a reminder this long before their end date. */
const REMIND_BEFORE_DAYS = 14;
/** Matches the backend's GracePeriod. */
const GRACE_DAYS = 7;

/** `now` defaults to the clock; call it per request (server), not in a cached render. */
export function planNotices(subscription: ApiSubscription | null | undefined, now = Date.now()): PlanNotice[] {
  if (!subscription) return [];
  const notices: PlanNotice[] = [];
  const end = subscription.expires_at ? new Date(subscription.expires_at).getTime() : null;

  if (subscription.expired) notices.push({ kind: "expired" });
  else if (subscription.in_grace && end !== null) {
    notices.push({ kind: "grace", daysLeft: Math.max(0, Math.ceil((end + GRACE_DAYS * DAY - now) / DAY)) });
  } else if (end !== null) {
    const daysLeft = Math.max(0, Math.ceil((end - now) / DAY));
    if (subscription.trial) notices.push({ kind: "trial", daysLeft });
    else if (daysLeft <= REMIND_BEFORE_DAYS) notices.push({ kind: "ending", endsOn: subscription.expires_at! });
  }

  const { limits, usage } = subscription;
  if (limits.branches !== null && usage.branches > limits.branches) {
    notices.push({ kind: "overLimit", what: "branches", max: limits.branches, current: usage.branches });
  } else if (limits.devices !== null && usage.devices > limits.devices) {
    notices.push({ kind: "overLimit", what: "devices", max: limits.devices, current: usage.devices });
  }
  return notices;
}
