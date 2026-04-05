# Posthook Patterns

Copy-pasteable patterns for building time-based features with Posthook and Next.js.

## Pattern: Schedule hooks before committing state

Always schedule hooks before writing to the database. If scheduling fails, no broken
task exists. If the database write fails after scheduling, the orphaned hooks fire,
find no matching state, and harmlessly no-op.

```typescript
// 1. Schedule hook first
const hook = await posthook().hooks.schedule<RemindPayload>({
  path: "/api/webhooks/remind",
  postIn: delay,
  data: { taskId: id },
});

// 2. Commit state after hook is scheduled
await saveTask({ id, status: "pending", remindAt: hook.postAt, ... });
```

**Used in**: `lib/tasks.ts` — `createTask()`

## Pattern: State verification on delivery

Every webhook handler checks task state before acting. If the task is already done,
return 200 and do nothing. This eliminates the need to cancel hooks — hooks self-disarm
by checking state.

```typescript
export async function handleReminder(taskId: string) {
  // Only transitions if still pending. If the user already marked it done,
  // this is a no-op — the conditional update matches zero rows.
  await updateTask(taskId, { status: "reminded", remindedAt: new Date().toISOString() }, ["pending"]);
}
```

**Used in**: `lib/tasks.ts` — `handleReminder()`

## Pattern: Conditional database updates

Use `WHERE status IN (?)` to prevent race conditions. If a user marks a task done at the
same moment a reminder fires, only one wins — the other gets zero rows affected and
no-ops gracefully.

```typescript
export async function updateTask(id: string, updates: Partial<Task>, expectedStatuses?: TaskStatus[]) {
  const where = expectedStatuses
    ? and(eq(tasks.id, id), inArray(tasks.status, expectedStatuses))
    : eq(tasks.id, id);

  const result = await db.update(tasks).set(updates).where(where).returning();
  return result[0] ?? null; // null = condition didn't match, another action won
}
```

**Used in**: `lib/store.ts` — `updateTask()`

## Pattern: Per-route webhook handlers

Each hook type gets its own route under `/api/webhooks/`. This maps to separate
endpoints in the Posthook dashboard, making it easy to monitor delivery per hook type.
Adding a new hook type = create a new route file.

```
app/api/webhooks/
  remind/route.ts     # Reminder callbacks
  cleanup/route.ts    # Sequence: daily cleanup
  escalate/route.ts   # (example) Add your own
```

Each handler verifies the signature inline — no shared middleware, each file is
self-contained:

```typescript
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const delivery = posthook().signatures.parseDelivery<RemindPayload>(body, request.headers);
  await handleReminder(delivery.data.taskId);
  return Response.json({ ok: true });
}
```

**Used in**: `app/api/webhooks/remind/route.ts`

## Pattern: Handler as extension point

The reminder handler in this starter just updates status. In a real app, you'd add
your notification logic here — email, Slack, push notification, or an external API call:

```typescript
export async function handleReminder(taskId: string) {
  const updated = await updateTask(taskId, { status: "reminded", remindedAt: now }, ["pending"]);
  if (!updated) return; // already done, no-op

  // Add your notification logic here:
  // await sendEmail(updated.description);
  // await slack.post({ text: `Reminder: ${updated.description}` });
}
```

## Pattern: Recurring cleanup with Sequences

Use [Posthook Sequences](https://docs.posthook.io/essentials/sequences) to run cleanup
on a schedule. Define it in `posthook.toml` alongside your code:

```toml
[[sequences]]
name = "daily-cleanup"
start_at = "2026-01-01T03:00:00Z"

[sequences.schedule]
frequency = "daily"
timezone = "UTC"
time = { hour = 3, minute = 0 }

[sequences.steps.cleanup]
path = "/api/webhooks/cleanup"
```

Set up with `npx posthook init` (connects your project, keeps the sequence), then `npx posthook apply` to deploy it. The cleanup handler deletes resolved tasks (reminded/done) older than 24 hours.

**Used in**: `posthook.toml`, `app/api/webhooks/cleanup/route.ts`

## Pattern: Cancel for cleanup (optional)

State verification makes cancellation unnecessary for correctness. But at high volume,
you may want to cancel hooks when a task is completed to reduce unnecessary deliveries:

```typescript
await posthook().hooks.delete(hookId);
```

This is an optimization, not a requirement. The starter doesn't use it.

**Reference**: [Posthook docs](https://docs.posthook.io)
