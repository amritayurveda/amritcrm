/** Order status lifecycle used by the order-status selector and workflow. */
export const ORDER_STATUSES = [
  "New","Confirm Pending","Confirm","Confirmed","In Transit","Delivered","Callback","Pending",
  "GPO","GPO Pending","GPO Portal","GPO Done","GPO Delivered","Confirm cancel","Cancel pending",
  "Final cancel","Cancel","Cancelled","Dealer Cancel","Future Delivery","UNA","NDR","Lost","RTO","Double Cancel",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const PAYMENT_STATUSES = ["Pending","Completed"] as const;

// Terminal/closed statuses for work-queue logic (Action Required / Overdue / Tomorrow).
// Shared by /api/orders and /api/orders/buckets so the queue list and its count never drift.
// NOTE: "Not Interested" is intentionally kept here for legacy data, even though it is not in ORDER_STATUSES.
export const TERMINAL_STATUSES: string[] = ["Delivered","GPO Delivered","Cancel","Cancelled","Confirm cancel","Cancel pending","Final cancel","Dealer Cancel","Lost","RTO","Double Cancel","Not Interested"];

// Status -> workflow bucket mapping. Single source of truth shared by:
//   /api/orders/buckets (counts), /api/agent-stats (per-agent), and orders/page.tsx (UI tabs).
export const REVENUE_STATUSES: string[] = ["Confirmed","In Transit","Dispatched","Packed","GPO Done","GPO Delivered","Delivered"];

export const BUCKET_MAP: Record<string, string[]> = {
  New: ["New"],
  Calling: ["Calling"],
  Callback: ["Callback"],
  Pending: ["Pending", "Confirm Pending", "GPO Pending", "Pending COD Confirmation"],
  Confirmed: ["Confirm", "Confirmed"],
  Shipped: ["In Transit", "Dispatched", "Packed", "GPO", "GPO Portal"],
  "GPO Done": ["GPO Done"],
  Delivered: ["Delivered", "GPO Delivered"],
  Cancelled: ["Cancel", "Cancelled", "Confirm cancel", "Cancel pending", "Final cancel", "Dealer Cancel", "Lost", "RTO", "Double Cancel", "Not Interested"],
};
