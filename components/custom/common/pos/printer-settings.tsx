"use client";

import OptionTiles from "@/components/custom/common/option-tiles";
import { usePrinter } from "@/components/custom/common/printer-context";
import { DRAWER_KICK_LABELS, type DrawerKick } from "@/lib/printer/drawer";
import type { PaperWidth } from "@/lib/printer/settings";

type OnOff = "on" | "off";
const ON_OFF = [
  { id: "on" as const, label: "On" },
  { id: "off" as const, label: "Off" },
];
const onOff = (value: boolean): OnOff => (value ? "on" : "off");

/** This till's receipt printer preferences; saved on the device. */
export default function PrinterSettings() {
  const { settings, updateSettings, drawerVia } = usePrinter();

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 font-semibold text-slate-700">Paper width</p>
        <OptionTiles<PaperWidth>
          options={[
            { id: "80", label: "80 mm" },
            { id: "58", label: "58 mm" },
          ]}
          value={settings.paper}
          onChange={(paper) => updateSettings({ paper })}
        />
      </div>

      <div>
        <p className="font-semibold text-slate-700">Print receipt automatically</p>
        <p className="mb-2 text-sm text-slate-500">As soon as a sale is recorded. Off: tap Print receipt.</p>
        <OptionTiles<OnOff>
          options={ON_OFF}
          value={onOff(settings.autoPrint)}
          onChange={(value) => updateSettings({ autoPrint: value === "on" })}
        />
      </div>

      <div>
        <p className="font-semibold text-slate-700">Cash drawer</p>
        <p className="mb-2 text-sm text-slate-500">
          Opens through the printer when cash is taken or paid out. Turn off if no drawer is connected.
        </p>
        <OptionTiles<OnOff>
          options={ON_OFF}
          value={onOff(settings.cashDrawer)}
          onChange={(value) => updateSettings({ cashDrawer: value === "on" })}
        />
      </div>

      <div>
        <p className="font-semibold text-slate-700">Drawer kick command</p>
        {drawerVia === "android" ? (
          <p className="text-sm text-slate-500">
            This device opens the drawer through its built-in Android service, so no kick command is needed.
          </p>
        ) : (
          <>
            <p className="mb-2 text-sm text-slate-500">
              Pin 2 suits most drawers. If the drawer doesn&apos;t open, try Pin 5, then DLE DC4.
            </p>
            <OptionTiles<DrawerKick>
              columns={3}
              options={(Object.keys(DRAWER_KICK_LABELS) as DrawerKick[]).map((id) => ({
                id,
                label: DRAWER_KICK_LABELS[id],
              }))}
              value={settings.drawerKick}
              onChange={(drawerKick) => updateSettings({ drawerKick })}
            />
          </>
        )}
      </div>
    </div>
  );
}
