"use client";

import { useRouter } from "next/navigation";
import { Check, Globe } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import { LOCALE_OPTIONS } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/locale-context";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

function ChangeLanguage() {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-brand text-white">
            <Globe className="size-7" />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-ink">
            {t("changeLang.title")}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {t("changeLang.subtitle")}
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {LOCALE_OPTIONS.map((option) => {
            const active = locale === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setLocale(option.id)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border-2 bg-white p-4 text-left transition",
                  active
                    ? "border-brand"
                    : "border-transparent  hover:border-border-medium",
                )}
              >
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl",
                    active ? "bg-brand text-white" : "bg-brand/10 text-brand",
                  )}
                >
                  <Globe className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink">{option.label}</p>
                  <p className="text-sm text-ink-muted">{option.descriptor}</p>
                </div>

                {active && (
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                    <Check className="size-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <CustomButton
          label={`${t("changeLang.continue")} →`}
          onClick={() => router.push("/login")}
          className="mt-6 h-12 w-full bg-brand font-semibold hover:bg-brand/90"
        />
      </div>
    </div>
  );
}

export default ChangeLanguage;
