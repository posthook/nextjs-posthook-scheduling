import { randomUUID } from "node:crypto";
import type { Duration } from "@posthook/node";
import { posthook } from "./posthook";
import { getTask, saveTask, updateTask } from "./store";
import type { Task, RemindPayload, ExpirePayload } from "./types";

const REMINDER_DELAY = (process.env.REMINDER_DELAY || "1h") as Duration;
const EXPIRATION_DELAY = (process.env.EXPIRATION_DELAY || "24h") as Duration;

// POSTHOOK: Schedule reminder and expiration hooks on task creation
//
// Important: schedule hooks BEFORE committing state.
// If scheduling fails, we throw before saving — no broken task in the database.
// If hooks schedule but the state write fails, the orphaned hooks fire,
// find no task, and harmlessly no-op (state verification handles this).
export async function createTask(
  prompt: string,
  contentType: string,
  draft: string
): Promise<Task> {
  const id = randomUUID();

  // 1. Schedule hooks first
  await Promise.all([
    posthook().hooks.schedule<RemindPayload>({
      path: "/api/webhooks/remind",
      postIn: REMINDER_DELAY,
      data: { taskId: id, reminderEpoch: 0 },
    }),
    posthook().hooks.schedule<ExpirePayload>({
      path: "/api/webhooks/expire",
      postIn: EXPIRATION_DELAY,
      data: { taskId: id },
    }),
  ]);

  // 2. Commit state after hooks are scheduled
  const now = new Date().toISOString();
  const task: Task = {
    id,
    status: "pending_review",
    contentType,
    prompt,
    draft,
    createdAt: now,
    updatedAt: now,
    remindedAt: null,
    resolvedAt: null,
    snoozeUntil: null,
    reminderEpoch: 0,
  };

  await saveTask(task);
  return task;
}

// Human actions — only write to the store, never call Posthook.
export async function approveTask(id: string): Promise<Task | null> {
  return (
    (await updateTask(id, { status: "approved", resolvedAt: new Date().toISOString() }, ["pending_review", "reminded"])) ??
    (await getTask(id))
  );
}

export async function rejectTask(id: string): Promise<Task | null> {
  return (
    (await updateTask(id, { status: "rejected", resolvedAt: new Date().toISOString() }, ["pending_review", "reminded"])) ??
    (await getTask(id))
  );
}

// POSTHOOK: Snooze = schedule new reminder, then conditionally update state
export async function snoozeTask(
  id: string,
  delay: Duration = "1h"
): Promise<Task | null> {
  const task = await getTask(id);
  if (!task || task.status === "approved" || task.status === "rejected" || task.status === "expired") {
    return task;
  }

  const nextEpoch = task.reminderEpoch + 1;

  // 1. Schedule new reminder — old one will self-disarm via epoch check
  await posthook().hooks.schedule<RemindPayload>({
    path: "/api/webhooks/remind",
    postIn: delay,
    data: { taskId: id, reminderEpoch: nextEpoch },
  });

  // 2. Conditional update — only if task is still snoozable
  const snoozeUntil = new Date(Date.now() + parseDuration(delay)).toISOString();
  return (
    (await updateTask(id, { status: "pending_review", snoozeUntil, reminderEpoch: nextEpoch, remindedAt: null }, ["pending_review", "reminded"])) ??
    (await getTask(id))
  );
}

// POSTHOOK: Webhook handlers — state verification on delivery
export async function handleReminder(taskId: string, reminderEpoch: number): Promise<void> {
  const task = await getTask(taskId);
  if (!task || task.status !== "pending_review") return;
  if (reminderEpoch !== task.reminderEpoch) return;

  await updateTask(taskId, { status: "reminded", remindedAt: new Date().toISOString() }, ["pending_review"]);
}

export async function handleExpiration(taskId: string): Promise<void> {
  await updateTask(
    taskId,
    { status: "expired", resolvedAt: new Date().toISOString() },
    ["pending_review", "reminded"]
  );
}

function parseDuration(delay: string): number {
  const match = delay.match(/^(\d+)(s|m|h|d)$/);
  if (!match) throw new Error(`Invalid duration: ${delay}`);
  const [, value, unit] = match;
  const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return Number(value) * multipliers[unit];
}
