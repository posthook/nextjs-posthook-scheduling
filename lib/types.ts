export type TaskStatus =
  | "pending_review"
  | "reminded"
  | "approved"
  | "rejected"
  | "expired";

export type Task = {
  id: string;
  status: TaskStatus;
  contentType: string;
  prompt: string;
  draft: string;
  createdAt: string;
  updatedAt: string;
  remindedAt: string | null;
  resolvedAt: string | null;
  snoozeUntil: string | null;
  reminderEpoch: number;
};

// Each webhook route has its own payload type.
// Adding a new hook type = add a new route + a new payload type here.
export type RemindPayload = { taskId: string; reminderEpoch: number };
export type ExpirePayload = { taskId: string };
