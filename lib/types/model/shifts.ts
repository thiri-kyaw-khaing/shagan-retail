export type ShiftId = number;

export type Shift = {
  id: ShiftId;
  branchId: number;
  staffId: number;
  /** Local date-time, e.g. "2026-09-17T09:00:00". */
  openedAt: string;
  /** Null while the shift is still open. */
  closedAt: string | null;
};

// TODO: Typed mock data — the open-shift / close-shift pages don't persist
// anything yet. Real shift records must come from the backend.
export const shifts: Shift[] = [
  {
    id: 1001,
    branchId: 1,
    staffId: 3,
    openedAt: "2026-09-17T09:00:00",
    closedAt: "2026-09-17T17:00:00",
  },
];
