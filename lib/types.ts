export type TaskStatus = "pending" | "reminded" | "done";

export type Task = {
  id: string;
  status: TaskStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
  remindAt: string | null;
  remindedAt: string | null;
  doneAt: string | null;
};

export type RemindPayload = { taskId: string };
