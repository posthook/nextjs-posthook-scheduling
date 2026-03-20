import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "./db";
import { tasks } from "./db/schema";
import type { Task, TaskStatus } from "./types";

export async function getTask(id: string): Promise<Task | null> {
  const result = await db.select().from(tasks).where(eq(tasks.id, id));
  return (result[0] as Task) ?? null;
}

export async function listTasks(): Promise<Task[]> {
  const result = await db
    .select()
    .from(tasks)
    .orderBy(desc(tasks.createdAt));
  return result as Task[];
}

export async function saveTask(task: Task): Promise<void> {
  const { id, ...fields } = task;
  await db.insert(tasks).values(task).onConflictDoUpdate({
    target: tasks.id,
    set: fields,
  });
}

// Conditional update: only applies if the task is in one of the expected statuses.
// Returns the updated task, or null if no rows matched (another action won the race).
export async function updateTask(
  id: string,
  updates: Partial<Task>,
  expectedStatuses?: TaskStatus[]
): Promise<Task | null> {
  const where = expectedStatuses
    ? and(eq(tasks.id, id), inArray(tasks.status, expectedStatuses))!
    : eq(tasks.id, id);

  const result = await db
    .update(tasks)
    .set({ ...updates, updatedAt: new Date().toISOString() })
    .where(where)
    .returning();

  return (result[0] as Task) ?? null;
}
