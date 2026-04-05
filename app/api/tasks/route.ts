import { createTask } from "@/lib/tasks";
import { listTasks } from "@/lib/store";
import type { Duration } from "@posthook/node";

export async function GET() {
  const tasks = await listTasks();
  return Response.json(tasks);
}

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { description, delay } = body;

  if (!description) {
    return Response.json({ error: "description is required" }, { status: 400 });
  }

  try {
    const task = await createTask(description, delay as Duration | undefined);
    return Response.json(task, { status: 201 });
  } catch (err) {
    console.error("[tasks] Create error:", err);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
