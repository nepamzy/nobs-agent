import { createHmac, randomUUID } from "node:crypto";
import { after } from "next/server";

// Sends website events (a submitted contact form, a booking request, a new
// client sign-up) to FLOWMINT. Server-side only: the signing secret must
// never reach the browser. Both settings live in the host's private
// environment variables, never in the code:
//   FLOWMINT_WEBHOOK_URL    full address of the FLOWMINT connector, host included
//   FLOWMINT_WEBHOOK_SECRET the signing secret
// If either is missing this does nothing, so the site works the same without
// FLOWMINT. It never throws, never logs the secret or the payload, and never
// waits long, so a FLOWMINT outage can never break or slow a visitor's form.
export async function sendToFlowmint(type: string, data: Record<string, unknown>): Promise<boolean> {
  const url = process.env.FLOWMINT_WEBHOOK_URL;
  const secret = process.env.FLOWMINT_WEBHOOK_SECRET;
  if (!url || !secret) return false;

  try {
    const body = JSON.stringify({ type, data });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-flowmint-timestamp": timestamp,
        "x-flowmint-signature": signature,
        "x-flowmint-event-id": randomUUID(),
      },
      body,
      signal: AbortSignal.timeout(5000),
    });
    // Only a real answer from FLOWMINT is worth a log line (for example a
    // bad signature). Being unreachable, which is expected until FLOWMINT is
    // live, stays completely silent.
    if (!res.ok) console.warn(`[flowmint] ${type} was rejected with status ${res.status}`);
    return res.ok;
  } catch {
    return false;
  }
}

// Fire-and-forget wrapper for server code: sends after the response is on its
// way when there is a request to hang off, otherwise just sends in the
// background. Callers must only pass business details, never passwords,
// password hashes, access or reset tokens, two-factor secrets, API keys or
// card details.
export function notifyFlowmint(type: string, data: Record<string, unknown>): void {
  const task = () => sendToFlowmint(type, data);
  try {
    after(task);
  } catch {
    void task();
  }
}
