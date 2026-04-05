import { posthook } from "@/lib/posthook";
import { handleReminder } from "@/lib/tasks";
import { SignatureVerificationError } from "@posthook/node";
import type { RemindPayload } from "@/lib/types";

// Posthook delivers here when a reminder is due.
// If the task was already marked done, handleReminder is a no-op.

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const delivery = posthook().signatures.parseDelivery<RemindPayload>(
      body,
      request.headers
    );

    await handleReminder(delivery.data.taskId);

    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof SignatureVerificationError) {
      return Response.json({ error: err.message }, { status: 401 });
    }
    console.error("[posthook/remind] Error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
