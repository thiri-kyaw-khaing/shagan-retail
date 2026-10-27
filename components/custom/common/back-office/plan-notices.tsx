"use client";

import { Sparkles, TriangleAlert } from "lucide-react";

import NoticeBanner from "@/components/custom/common/notice-banner";
import type { ApiPlanCode } from "@/lib/api/types";
import { formatDate } from "@/lib/i18n/format";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { PlanNotice } from "@/lib/subscription/plan";

type PlanNoticesProps = {
  plan: ApiPlanCode;
  notices: PlanNotice[];
};

/**
 * The Owner's reminders about their tier: a trial or paid plan ending, the
 * grace period, a lapse to Basic, or more branches / devices than the plan
 * allows. Shagan changes the tier; the shop can only ask.
 */
export default function PlanNotices({ plan, notices }: PlanNoticesProps) {
  const { t, locale } = useTranslation();
  if (notices.length === 0) return null;
  const planName = t(`plan.${plan}`);

  const text = (notice: PlanNotice) => {
    switch (notice.kind) {
      case "trial":
        return t("plan.trialNotice").replaceAll("{plan}", planName).replace("{days}", String(notice.daysLeft));
      case "ending":
        return t("plan.endingNotice")
          .replace("{plan}", planName)
          .replace("{date}", formatDate(new Date(notice.endsOn), locale));
      case "grace":
        return t("plan.graceNotice").replace("{plan}", planName).replace("{days}", String(notice.daysLeft));
      case "expired":
        return t("plan.expiredNotice");
      case "overLimit":
        return t(notice.what === "branches" ? "plan.overLimitBranches" : "plan.overLimitDevices")
          .replace("{max}", String(notice.max))
          .replace("{current}", String(notice.current));
    }
  };

  return (
    <div className="flex flex-col gap-2 px-4 pt-4 sm:px-6">
      {notices.map((notice) => {
        const calm = notice.kind === "trial" || notice.kind === "ending";
        return (
          <NoticeBanner
            key={notice.kind}
            tone="amber"
            icon={calm ? Sparkles : TriangleAlert}
            title={text(notice)}
          />
        );
      })}
    </div>
  );
}
