import { posthook } from "@/lib/posthook";
import { deleteResolvedTasksOlderThan } from "@/lib/store";
import { SignatureVerificationError } from "@posthook/node";

// Cleanup handler for Posthook Sequences.
// Deletes resolved tasks (reminded/done) older than 24 hours. Runs on a daily schedule
// defined in posthook.toml.

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    posthook().signatures.parseDelivery(body, request.headers);

    const deleted = await deleteResolvedTasksOlderThan(24);

    return Response.json({ ok: true, deleted });
  } catch (err) {
    if (err instanceof SignatureVerificationError) {
      return Response.json({ error: err.message }, { status: 401 });
    }
    console.error("[posthook/cleanup] Error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
