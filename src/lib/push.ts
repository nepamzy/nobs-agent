import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// VAPID keys identify this server to the browser push services (FCM,
// Mozilla's push service, etc). Generate once with:
//   npx web-push generate-vapid-keys
// then set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and
// NEXT_PUBLIC_VAPID_PUBLIC_KEY (same public key, exposed to the client
// so it can call pushManager.subscribe) in your environment.
let configured = false;
function ensureConfigured() {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    console.warn("[push] VAPID keys not set, skipping push send.");
    return false;
  }
  webpush.setVapidDetails(
    `mailto:${process.env.STUDIO_NOTIFICATION_EMAIL || "hello@nobsagent.com"}`,
    publicKey,
    privateKey
  );
  configured = true;
  return true;
}

type PushPayload = { title: string; body: string; url?: string };

async function sendToSubscription(
  sub: { id: string; endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
) {
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload)
    );
  } catch (err: unknown) {
    // 404/410 means the browser unsubscribed or the endpoint expired,
    // clean it up so future sends don't keep failing on it.
    const statusCode = (err as { statusCode?: number })?.statusCode;
    if (statusCode === 404 || statusCode === 410) {
      await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
    } else {
      console.error("[push] send failed", err);
    }
  }
}

// Sends a push to every device a specific user has enabled notifications
// on, used for client-facing pushes (e.g. "payment received").
export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!ensureConfigured()) return;
  try {
    const subs = await prisma.pushSubscription.findMany({ where: { userId } });
    await Promise.all(subs.map((s) => sendToSubscription(s, payload)));
  } catch (err) {
    console.error("[push] sendPushToUser failed", err);
  }
}

// Sends a push to every admin/staff device, this is the "notify me the
// way WhatsApp does" hook for new bookings and inbox messages.
export async function notifyAdminsPush(payload: PushPayload) {
  if (!ensureConfigured()) return;
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "STAFF"] } },
      select: { id: true },
    });
    const subs = await prisma.pushSubscription.findMany({
      where: { userId: { in: admins.map((a) => a.id) } },
    });
    await Promise.all(subs.map((s) => sendToSubscription(s, payload)));
  } catch (err) {
    console.error("[push] notifyAdminsPush failed", err);
  }
}
