"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Monitor, Store, Trash2 } from "lucide-react";

import ConfirmDialog from "@/components/custom/common/back-office/confirm-dialog";
import PageHeader from "@/components/custom/common/back-office/page-header";
import CustomButton from "@/components/custom/common/custom-button";
import FormError from "@/components/custom/common/forms/form-error";
import NoticeBanner from "@/components/custom/common/notice-banner";
import { Input } from "@/components/ui/input";
import { useAction } from "@/lib/api/use-action";
import { createRoleAction, deleteRoleAction, updateRoleAction } from "@/lib/roles/actions";
import { cn } from "@/lib/utils";

/** The Roles & Access tab of Staff Management. */
const ROLES_TAB = "/owner/staff-management?tab=roles";

export type PermissionOption = { code: string; name: string };

type RoleFormViewProps = {
  /** Omitted when creating a new role. */
  role?: { id: number; name: string; builtIn: boolean; staffCount: number; codes: string[] };
  pos: PermissionOption[];
  backoffice: PermissionOption[];
};

/** The two switches; every other permission sits in a checklist under one of them. */
const POS_SWITCH = "access_pos_portal";
const BACKOFFICE_SWITCH = "access_backoffice";

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition",
        checked ? "bg-brand" : "bg-slate-200",
      )}
    >
      <span
        className={cn(
          "absolute top-1 size-5 rounded-full bg-white shadow transition-all",
          checked ? "left-6" : "left-1",
        )}
      />
    </button>
  );
}

function AccessSection({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
  options,
  codes,
  onToggleCode,
}: {
  icon: typeof Monitor;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (next: boolean) => void;
  options: PermissionOption[];
  codes: Set<string>;
  onToggleCode: (code: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-rose-100 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <p className="text-sm text-ink-muted">{description}</p>
        </div>
        <Switch checked={enabled} onChange={onToggle} label={title} />
      </div>

      <ul className={cn("mt-5 space-y-3", !enabled && "opacity-50")}>
        {options.map((option) => (
          <li key={option.code}>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
              <input
                type="checkbox"
                className="size-5 accent-[var(--color-brand)]"
                checked={codes.has(option.code)}
                disabled={!enabled}
                onChange={() => onToggleCode(option.code)}
              />
              {option.name}
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function RoleFormView({ role, pos, backoffice }: RoleFormViewProps) {
  const router = useRouter();
  const { isPending, error, run, clearError } = useAction();
  const [name, setName] = useState(role?.name ?? "");
  const [codes, setCodes] = useState(() => new Set(role?.codes ?? [POS_SWITCH]));
  const [warnings, setWarnings] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggle = (code: string) =>
    setCodes((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  const setSwitch = (code: string, on: boolean) =>
    setCodes((current) => {
      const next = new Set(current);
      if (on) next.add(code);
      else next.delete(code);
      return next;
    });

  const handleSave = () => {
    if (!name.trim()) return;
    clearError();
    const list = [...codes];
    run(
      () => (role ? updateRoleAction(role.id, name, list) : createRoleAction(name, list)),
      (saved) => {
        if (saved.warnings.length > 0) {
          // Saved, but tell the Owner what won't take effect yet.
          setWarnings(saved.warnings);
          if (!role) router.replace(`/owner/roles/${saved.id}`);
          return;
        }
        router.push(ROLES_TAB);
      },
    );
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title={role ? `Edit role: ${role.name}` : "Create role"}
        subtitle="Turn on POS and/or Back office, then tick what this role may do. Staff get the changes at their next PIN sign-in."
        backHref={ROLES_TAB}
      />

      <div className="mx-auto mt-5 max-w-2xl space-y-4">
        <section className="rounded-2xl border border-rose-100 bg-white p-5 sm:p-6">
          <label htmlFor="role-name" className="text-sm text-ink-muted">
            Name
          </label>
          <Input
            id="role-name"
            value={name}
            maxLength={50}
            placeholder="e.g. Super Staff"
            onChange={(event) => setName(event.target.value)}
            className="mt-2 h-11 text-lg"
          />
        </section>

        <AccessSection
          icon={Monitor}
          title="POS"
          description="Staff with this role can sign in at the till with their PIN."
          enabled={codes.has(POS_SWITCH)}
          onToggle={(on) => setSwitch(POS_SWITCH, on)}
          options={pos}
          codes={codes}
          onToggleCode={toggle}
        />
        <AccessSection
          icon={Store}
          title="Back office"
          description="Staff with this role can open Back Office at the till with their PIN (their own branch only)."
          enabled={codes.has(BACKOFFICE_SWITCH)}
          onToggle={(on) => setSwitch(BACKOFFICE_SWITCH, on)}
          options={backoffice}
          codes={codes}
          onToggleCode={toggle}
        />

        {warnings.length > 0 && (
          <NoticeBanner tone="amber" title="Saved - but some permissions won't take effect yet">
            {warnings.join(" ")}
          </NoticeBanner>
        )}
        <FormError message={error} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          {role && !role.builtIn ? (
            <CustomButton
              label="Delete role"
              icon={Trash2}
              onClick={() => setConfirmDelete(true)}
              className="min-h-11 border-2 border-rose-300 bg-white px-4 text-rose-600 shadow-none hover:bg-rose-50"
            />
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <CustomButton
              label="Cancel"
              onClick={() => router.push(ROLES_TAB)}
              className="min-h-11 border border-slate-200 bg-white px-4 text-slate-600 shadow-none hover:bg-slate-50"
            />
            <CustomButton
              label={isPending ? "Saving..." : "Save"}
              onClick={handleSave}
              disabled={isPending || !name.trim()}
              className="min-h-11 bg-brand px-6 font-semibold text-white hover:bg-brand/90"
            />
          </div>
        </div>
      </div>

      {confirmDelete && role && (
        <ConfirmDialog
          title={`Delete "${role.name}"?`}
          description={
            role.staffCount > 0
              ? `${role.staffCount} staff member(s) still have this role. Give them another role first.`
              : "This role will be removed. This can't be undone."
          }
          confirmLabel="Delete"
          pending={isPending}
          error={error}
          onClose={() => {
            clearError();
            setConfirmDelete(false);
          }}
          onConfirm={() => run(() => deleteRoleAction(role.id), () => router.push(ROLES_TAB))}
        />
      )}
    </main>
  );
}
