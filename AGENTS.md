# Posthook Next.js Starter

## What This Is
A minimal Next.js starter showing how to use Posthook for durable per-event
scheduling. API routes + webhook handlers. No frontend UI.

## Architecture
- `lib/posthook.ts` — Posthook client (lazy singleton for build safety)
- `lib/tasks.ts` — Task state machine: create, approve, reject, snooze, handleReminder, handleExpiration
- `lib/store.ts` — Data access layer (getTask, listTasks, saveTask, updateTask)
- `lib/types.ts` — Task, TaskStatus, RemindPayload, ExpirePayload
- `lib/db/schema.ts` — Drizzle schema (tasks table)
- `lib/db/index.ts` — Database connection
- `app/api/tasks/route.ts` — POST (create), GET (list)
- `app/api/tasks/[id]/route.ts` — GET (detail), PATCH (approve/reject/snooze)
- `app/api/webhooks/remind/route.ts` — Posthook reminder callback
- `app/api/webhooks/expire/route.ts` — Posthook expiration callback

## Key Patterns
- Schedule hooks BEFORE committing state (see PATTERNS.md)
- State verification: hooks check task state on delivery, not on action
- Epoch-based snooze: new hook + epoch increment, old hooks self-disarm
- Conditional updates: `WHERE status = ?` prevents race conditions
- Each webhook handler is self-contained

## How to Add a New Hook Type
1. Add a payload type in `lib/types.ts`
2. Create `app/api/webhooks/<name>/route.ts` — copy an existing handler
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
- `EXPIRATION_DELAY` — optional, default `24h`

<!-- BEGIN:nextjs-agent-rules -->
## Next.js Version Note
This project uses Next.js 16 which has breaking changes from earlier versions.
Key changes: `params` is a Promise, `cookies()`/`headers()` are async.
<!-- END:nextjs-agent-rules -->
