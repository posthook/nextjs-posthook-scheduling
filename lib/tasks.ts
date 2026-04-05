import { randomUUID } from "node:crypto";
import type { Duration } from "@posthook/node";
import { posthook } from "./posthook";
import { getTask, saveTask, updateTask } from "./store";
import type { Task, RemindPayload } from "./types";

const DEFAULT_DELAY = (process.env.REMINDER_DELAY || "1h") as Duration;

// Schedule a reminder hook, then commit state.
// If scheduling fails, we throw before saving — no broken task in the database.
// If the hook fires but the task was already marked done, it harmlessly no-ops.
export async function createTask(
  description: string,
  delay: Duration = DEFAULT_DELAY
): Promise<Task> {
  const id = randomUUID();

  const hook = await posthook().hooks.schedule<RemindPayload>({
    path: "/api/webhooks/remind",
    postIn: delay,
    data: { taskId: id },
  });

  const now = new Date().toISOString();
  const task: Task = {
    id,
    status: "pending",
    description,
    createdAt: now,
    updatedAt: now,
    remindAt: hook.postAt,
    remindedAt: null,
    doneAt: null,
  };

  await saveTask(task);
  return task;
}

// Mark a task as done. The pending reminder hook will no-op when it fires.
export async function completeTask(id: string): Promise<Task | null> {
  return (
    (await updateTask(id, { status: "done", doneAt: new Date().toISOString() }, ["pending", "reminded"])) ??
    (await getTask(id))
  );
}

// Webhook handler — state verification on delivery.
// Only transitions if the task is still pending. If the user already marked it
// done, this is a no-op. In a real app you'd also send a notification here.
export async function handleReminder(taskId: string): Promise<void> {
  await updateTask(
    taskId,
    { status: "reminded", remindedAt: new Date().toISOString() },
    ["pending"]
  );
}
