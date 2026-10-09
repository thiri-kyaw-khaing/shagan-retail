"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import NumPad, { PinDots } from "@/components/custom/common/numpad";
import { DeviceStatusCard } from "@/components/custom/common/device-status-card";
import { StockAlertsCard, type StockAlert } from "@/components/custom/common/stock-alerts-card";
import CustomButton from "@/components/custom/common/custom-button";
import BackButton from "@/components/custom/common/back-button";
import AvatarInitials from "@/components/custom/common/avatar-initials";
import FilterSelect from "@/components/custom/common/back-office/filter-select";
import FormError from "@/components/custom/common/forms/form-error";
import LabeledTextarea from "@/components/custom/common/labeled-textarea";
import NoticeBanner from "@/components/custom/common/notice-banner";
import ManagerApprovalStep from "@/components/custom/common/pos/manager-approval-step";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/use-translation";
import { forceCloseShiftAction, signInStaffAction } from "@/lib/pos/actions";

type StaffPinPadProps = {
  staff: { id: number; name: string };
  /** Active staff at this branch who may force-close a shift (`access_backoffice`). */
  managers: { id: number; name: string }[];
  alerts: StockAlert[];
};

type BlockedShift = { id: number; staffName: string };

export default function StaffPinPad({ staff, managers, alerts }: StaffPinPadProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Another cashier's shift is still open on this till; `forceClosing` swaps
  // the PIN pad for the manager's force-close step.
  const [blocked, setBlocked] = useState<BlockedShift | null>(null);
  const [forceClosing, setForceClosing] = useState(false);
  const [managerId, setManagerId] = useState(managers[0] ? String(managers[0].id) : "");
  const [managerPin, setManagerPin] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const [reason, setReason] = useState("");

  const handlePinChange = (nextPin: string) => {
    setError(null);
    setNotice(null);
    setPin(nextPin.slice(0, 6));
  };

  const handleContinue = () => {
    if (pin.length !== 6) return;
    startTransition(async () => {
      const result = await signInStaffAction(staff.id, pin);
      if (result.ok) {
        router.push(result.data.next);
      } else {
        setError(result.error);
        setBlocked(result.blockedShift ?? null);
        setPin("");
      }
    });
  };

  const backToPin = () => {
    setForceClosing(false);
    setManagerPin("");
    setError(null);
  };

  const handleForceClose = () => {
    if (!blocked || managerPin.length !== 6) return;
    const cash = closingCash.trim();
    // The backend takes at most 2 decimal places and rejects negatives.
    if (!/^\d+(\.\d{1,2})?$/.test(cash)) {
      setError("Enter the cash counted in the drawer.");
      return;
    }
    if (!reason.trim()) {
      setError("A reason is required to force-close a shift.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await forceCloseShiftAction(blocked.id, Number(managerId), managerPin, cash, reason);
      setManagerPin("");
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // The cashier's own PIN wasn't kept while the manager stepped in, so
      // they enter it again now that the till is free.
      setBlocked(null);
      setForceClosing(false);
      setClosingCash("");
      setReason("");
      setNotice(`${blocked.staffName}'s shift is closed. Enter your PIN to continue.`);
    });
  };

  return (
    <main className="min-h-screen overflow-y-auto bg-rose-50 px-4 py-8 md:px-8">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        {forceClosing && blocked ? (
          <section>
            <ManagerApprovalStep
              title="Force-close shift"
              subtitle={`${blocked.staffName}'s shift is still open on this till. A manager counts the drawer, gives a reason and enters their PIN.`}
              pin={managerPin}
              onPinChange={(nextPin) => {
                setError(null);
                setManagerPin(nextPin.slice(0, 6));
              }}
              onSubmit={handleForceClose}
              pending={isPending}
              error={error}
            >
              {managers.length > 0 ? (
                <div className="space-y-3">
                  <FilterSelect
                    aria-label="Manager"
                    value={managerId}
                    onChange={setManagerId}
                    options={managers.map((m) => ({ value: String(m.id), label: m.name }))}
                  />
                  <Input
                    aria-label="Cash counted in the drawer"
                    inputMode="decimal"
                    placeholder="Cash counted in the drawer (K)"
                    value={closingCash}
                    onChange={(event) => {
                      setError(null);
                      setClosingCash(event.target.value);
                    }}
                    className="h-11 bg-white"
                  />
                  <LabeledTextarea
                    label={t("closeShift.reasonLabel")}
                    labelClassName="font-semibold text-amber-700"
                    required
                    value={reason}
                    onChange={(event) => {
                      setError(null);
                      setReason(event.target.value);
                    }}
                    placeholder={t("closeShift.reasonPlaceholder")}
                    rows={2}
                    className="resize-y border-amber-300 bg-amber-50 text-base placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-400"
                  />
                </div>
              ) : (
                <FormError message="Nobody at this branch can force-close a shift." />
              )}
            </ManagerApprovalStep>
            <CustomButton
              label="Back to PIN"
              onClick={backToPin}
              className="mx-auto mt-4 flex border border-slate-200 bg-white text-slate-600 shadow-none hover:bg-slate-50"
            />
          </section>
        ) : (
          <section className="relative rounded-2xl bg-white p-6 shadow-md sm:p-10 lg:min-h-[700px]">
            <BackButton href="/pos/select-staff" className="absolute left-6 top-6" />

            <div className="mx-auto flex max-w-2xl flex-col items-center pt-8 sm:pt-10">
              <AvatarInitials name={staff.name} className="size-28 text-4xl sm:size-32" />
              <p className="mt-4 text-lg font-semibold text-ink">{staff.name}</p>

              <h1 className="mt-4 text-center text-2xl font-medium text-slate-600">
                {t("pin.title")}
              </h1>

              <div className="mt-8">
                <PinDots total={6} current={pin.length} />
              </div>
              <div className="mt-6 w-full max-w-md space-y-3">
                <FormError message={error} />
                {notice && <NoticeBanner tone="amber" title={notice} />}
                {blocked && (
                  <CustomButton
                    label={`Force-close ${blocked.staffName}'s shift`}
                    onClick={() => {
                      setError(null);
                      setForceClosing(true);
                    }}
                    className="mx-auto flex border border-slate-200 bg-white text-slate-600 shadow-none hover:bg-slate-50"
                  />
                )}
              </div>
              <div className="mt-4 w-full">
                <NumPad
                  value={pin}
                  onChange={handlePinChange}
                  mode="pin"
                  maxPin={6}
                  large
                  disabled={isPending}
                />
              </div>
            </div>
            <CustomButton
              label={isPending ? "Checking..." : t("pin.continue")}
              icon={ArrowRight}
              onClick={handleContinue}
              disabled={pin.length !== 6 || isPending}
              className="mt-6 min-h-12 w-full rounded-xl bg-rose-600 text-base font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            />
          </section>
        )}

        <aside className="grid grid-cols-1 gap-5">
          <StockAlertsCard alerts={alerts} />
          <DeviceStatusCard />
        </aside>
      </div>
    </main>
  );
}
