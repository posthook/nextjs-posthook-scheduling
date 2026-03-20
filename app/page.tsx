export default function Home() {
  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: "0 1rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Posthook Next.js Starter</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Schedule delayed tasks with Posthook. Use the API endpoints below.
      </p>
      <pre style={{ background: "#f5f5f5", padding: "1rem", borderRadius: 8, fontSize: "0.85rem", lineHeight: 1.6 }}>
{`POST /api/tasks          Create a task
GET  /api/tasks          List all tasks
GET  /api/tasks/:id      Get a task
PATCH /api/tasks/:id     Approve, reject, or snooze

Webhook handlers:
POST /api/webhooks/remind
POST /api/webhooks/expire`}
      </pre>
      <p style={{ color: "#999", fontSize: "0.8rem", marginTop: "1rem" }}>
        See <a href="https://github.com/posthook/nextjs-starter" style={{ color: "#333" }}>README</a> for setup and curl examples.
      </p>
    </div>
  );
}
