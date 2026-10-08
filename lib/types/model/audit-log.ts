export type AuditLogId = number;

/**
 * The events the backend actually records (entity/action pairs written by
 * shagan_pos). Anything new it starts logging shows up as "other" until it
 * gets its own label here.
 */
export type AuditActionType =
  | "staff_updated"
  | "discount_applied"
  | "sale_voided"
  | "sale_returned"
  | "sale_exchanged"
  | "other";

export type AuditLogEntry = {
  id: AuditLogId;
  occurredAt: string;
  userName: string;
  userRole: string;
  action: AuditActionType;
  details: string;
};
