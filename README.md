# Posthook + Next.js Reminders

Schedule webhooks that fire at the right time — no cron, no queues, no workflow engines. Built with [Posthook](https://posthook.io?utm_source=nextjs-posthook-scheduling&utm_medium=readme&utm_campaign=vercel) for durable per-event scheduling.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fposthook%2Fnextjs-posthook-scheduling&env=POSTHOOK_API_KEY,POSTHOOK_SIGNING_KEY&envDescription=Get%20your%20API%20key%20and%20signing%20key%20from%20posthook.io&envLink=https%3A%2F%2Fposthook.io%2Fapp%2Fsignup%3Futm_source%3Dnextjs-posthook-scheduling%26utm_medium%3Ddeploy-button%26utm_campaign%3Dvercel&stores=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22neon%22%2C%22productSlug%22%3A%22neon%22%2C%22protocol%22%3A%22storage%22%7D%5D&project-name=posthook-scheduling&repository-name=posthook-scheduling)

![Screenshot](screenshot.png)

## How It Works

1. **Create a task** — schedules a reminder webhook via Posthook
2. **Countdown ticks** — the dashboard shows when the hook will fire
3. **Hook fires** — Posthook delivers the webhook, task status changes to "reminded"
4. **Mark done early** — the pending hook no-ops on delivery (state verification pattern)

In a real app, the webhook handler would also send a notification, trigger a workflow, or call an external API.

## Deploy to Production

1. Click the **Deploy with Vercel** button above (provisions a Neon Postgres database)
2. Add your `POSTHOOK_API_KEY` and `POSTHOOK_SIGNING_KEY` from [posthook.io](https://posthook.io/app/signup?utm_source=nextjs-posthook-scheduling&utm_medium=readme&utm_campaign=vercel)
3. Set your deployment domain in your Posthook project settings (e.g., `my-app.vercel.app`)
4. Set up the cleanup sequence:
   ```bash
   npx posthook init       # connects your project, keeps the sequence config
   npx posthook apply      # deploys the sequence to Posthook
   ```

## Local Development

```bash
git clone https://github.com/posthook/nextjs-posthook-scheduling.git
cd nextjs-posthook-scheduling
npm install
docker compose up -d db
cp .env.example .env.local    # add your Posthook API key + signing key
npm run db:push
npm run dev
```

In another terminal, forward Posthook deliveries to your local server:

```bash
npx posthook listen --forward http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000), create a task with a 30s delay, and watch it fire.

## Posthook Patterns

See [PATTERNS.md](PATTERNS.md) for detailed explanations and copy-pasteable code:

- **Schedule hooks before committing state** — if scheduling fails, no broken task
- **State verification on delivery** — mark done before the hook fires, it no-ops
- **Handler as extension point** — add your notification/email/API call logic

## Recurring Cleanup with Sequences

This starter includes a daily cleanup sequence defined in `posthook.toml` using [Posthook Sequences](https://docs.posthook.io/essentials/sequences). It deletes resolved tasks older than 24 hours. See the [Deploy to Production](#deploy-to-production) section for setup.

## Project Structure

```
app/
  page.tsx                    # Dashboard UI
  create-form.tsx             # Task creation form
  mark-done-button.tsx        # Complete task action
  api/
    tasks/route.ts            # POST (create), GET (list)
    tasks/[id]/route.ts       # GET (detail), PATCH (complete)
    webhooks/
      remind/route.ts         # Posthook reminder callback
      cleanup/route.ts        # Posthook sequence: daily cleanup
lib/
  posthook.ts                 # Posthook client (lazy singleton)
  tasks.ts                    # Task logic + Posthook scheduling
  store.ts                    # Data access layer (Drizzle)
  types.ts                    # TypeScript types
  db/schema.ts                # Drizzle schema
  db/index.ts                 # Database connection
posthook.toml                 # Sequences config (config-as-code)
```

## Customize

- Change `REMINDER_DELAY` env var to set the default delay (e.g., `30s`, `5m`, `1h`, `1d`)
- Add new webhook handlers for different hook types
- Add notification logic (email, Slack, push) inside the remind handler
- See [PATTERNS.md](PATTERNS.md) for advanced patterns
- For production, replace the `postbuild` script with a proper migration workflow (`drizzle-kit push` can drop columns)

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string |
| `POSTHOOK_API_KEY` | Yes | Posthook API key |
| `POSTHOOK_SIGNING_KEY` | Yes | Posthook signing key |
| `REMINDER_DELAY` | No | Default reminder delay (default: `1h`) |

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [Posthook](https://posthook.io?utm_source=nextjs-posthook-scheduling&utm_medium=readme&utm_campaign=vercel) for durable per-event scheduling
- [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL
- [Tailwind CSS](https://tailwindcss.com)

## License

MIT
