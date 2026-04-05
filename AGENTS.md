# Posthook Next.js Scheduling Starter

## What This Is
A Next.js starter showing how to use Posthook for durable per-event scheduling.
Includes a dashboard UI with live countdown timers, a reminder webhook handler,
and a cleanup sequence defined in posthook.toml.

## Architecture
- `app/page.tsx` — Dashboard UI (server component, force-dynamic)
- `app/create-form.tsx` — Task creation form (client component)
- `app/mark-done-button.tsx` — Complete task action (client component)
- `app/api/tasks/route.ts` — POST (create), GET (list)
- `app/api/tasks/[id]/route.ts` — GET (detail), PATCH (complete)
- `app/api/webhooks/remind/route.ts` — Posthook reminder callback
- `app/api/webhooks/cleanup/route.ts` — Posthook sequence: daily cleanup
- `lib/posthook.ts` — Posthook client (lazy singleton for build safety)
- `lib/tasks.ts` — Task logic: createTask, completeTask, handleReminder
- `lib/store.ts` — Data access layer (getTask, listTasks, saveTask, updateTask, deleteResolvedTasksOlderThan)
- `lib/types.ts` — Task, TaskStatus, RemindPayload
- `lib/db/schema.ts` — Drizzle schema (tasks table)
- `lib/db/index.ts` — Database connection
- `components/` — UI components (poller, countdown, status-badge, local-time)
- `posthook.toml` — Sequences config (daily cleanup, config-as-code)

## Key Patterns
- Schedule hooks BEFORE committing state (see PATTERNS.md)
- State verification: hooks check task state on delivery, not on action
- Conditional updates: `WHERE status IN (?)` prevents race conditions
- Each webhook handler is self-contained
- Poller pauses on hidden tabs (visibilitychange)

## How to Add a New Hook Type
1. Add a payload type in `lib/types.ts`
2. Create `app/api/webhooks/<name>/route.ts` — copy the remind handler
3. Add the scheduling call in `lib/tasks.ts`
4. State verification logic goes in the handler

## Do Not Change
- Signature verification pattern in webhook handlers (security-critical)
- The `runtime = 'nodejs'` export on webhook routes (SDK requires Node.js, not Edge)

## Local Development
```bash
docker compose up -d db
npm run db:push
npm run dev
npx posthook listen --forward http://localhost:3000
```

## Environment Variables
- `POSTHOOK_API_KEY` — required, starts with `phk_`
- `POSTHOOK_SIGNING_KEY` — required, starts with `phs_`
- `DATABASE_URL` — required, Postgres connection string
- `REMINDER_DELAY` — optional, default `1h`

<!-- BEGIN:nextjs-agent-rules -->
## Next.js Version Note
This project uses Next.js 16 which has breaking changes from earlier versions.
Key changes: `params` is a Promise, `cookies()`/`headers()` are async.
<!-- END:nextjs-agent-rules -->
