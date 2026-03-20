import { createTask } from "@/lib/tasks";
import { listTasks } from "@/lib/store";

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
  const { prompt, contentType, draft } = body;

  if (!prompt || !contentType || !draft) {
    return Response.json(
      { error: "prompt, contentType, and draft are required" },
      { status: 400 }
    );
  }

  try {
    const task = await createTask(prompt, contentType, draft);
    return Response.json(task, { status: 201 });
  } catch (err) {
    console.error("[tasks] Create error:", err);
    return Response.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
