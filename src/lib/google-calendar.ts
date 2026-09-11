import crypto from "crypto";

// Server-side only. Writes booking consultations onto a real Google
// Calendar, authenticated as a service account (must be shared on that
// calendar with "Make changes to events" access) — no user OAuth flow.
// Same hand-rolled JWT-bearer token exchange as
// src/lib/google-analytics-data.ts, matching this codebase's existing
// pattern of small `fetch`-based provider helpers rather than pulling in
// `googleapis`. A separate service account identity from the GA one by
// default (own env vars), though nothing stops pointing both at the same
// GCP service account if its GA and Calendar scopes are both enabled.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/calendar.events";

function base64url(input: Buffer | string) {
  return (typeof input === "string" ? Buffer.from(input) : input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function getCredentials() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const clientEmail = process.env.GOOGLE_CALENDAR_CLIENT_EMAIL;
  // Service account private keys are multi-line PEM; env files can't hold
  // a literal newline in a simple KEY="value" line, so the value is stored
  // with escaped \n sequences and unescaped here.
  const privateKey = process.env.GOOGLE_CALENDAR_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!calendarId || !clientEmail || !privateKey) return null;
  return { calendarId, clientEmail, privateKey };
}

export function isGoogleCalendarConfigured(): boolean {
  return getCredentials() !== null;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );
  const signingInput = `${header}.${claims}`;
  const signature = base64url(crypto.createSign("RSA-SHA256").update(signingInput).sign(privateKey));
  const jwt = `${signingInput}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

export type BookingCalendarEventInput = {
  fullName: string;
  email: string;
  serviceInterest: string;
  meetingType: string; // "video" | "phone" | "in-person"
  scheduledFor: Date;
  notes?: string | null;
};

// A booking has no stored end time — a consultation call is assumed to be
// 30 minutes, purely for the calendar block; it has no bearing on
// anything else in the app.
const EVENT_DURATION_MINUTES = 30;

function buildEventBody(booking: BookingCalendarEventInput) {
  const start = booking.scheduledFor;
  const end = new Date(start.getTime() + EVENT_DURATION_MINUTES * 60 * 1000);
  const meetingLabel =
    booking.meetingType === "video" ? "Video call" : booking.meetingType === "phone" ? "Phone call" : "In person";

  return {
    summary: `${booking.serviceInterest} — ${booking.fullName}`,
    description: [
      `Client: ${booking.fullName} <${booking.email}>`,
      `Meeting type: ${meetingLabel}`,
      booking.notes ? `Notes: ${booking.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    // Google's own reminder system — this is the "alarm" — a popup 1 hour
    // before on top of whatever default reminders the calendar itself has.
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: 60 }],
    },
  };
}

// Best-effort: every call site catches and logs rather than letting this
// fail the booking itself — a client's request succeeding must never
// depend on the studio's calendar integration being configured or Google
// being reachable. Returns the created event's id (to store on the
// Booking row) or null if the integration isn't configured.
export async function createBookingCalendarEvent(booking: BookingCalendarEventInput): Promise<string | null> {
  const creds = getCredentials();
  if (!creds) return null;

  const token = await getAccessToken(creds.clientEmail, creds.privateKey);
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(creds.calendarId)}/events`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(buildEventBody(booking)),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Calendar event create failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { id: string };
  return json.id;
}

// Called when a booking's date/time or details change (e.g. rescheduled)
// — updates the SAME event in place rather than leaving the old one
// behind. No-op (returns false) if the integration isn't configured or
// this booking never got an event in the first place.
export async function updateBookingCalendarEvent(
  eventId: string,
  booking: BookingCalendarEventInput
): Promise<boolean> {
  const creds = getCredentials();
  if (!creds) return false;

  const token = await getAccessToken(creds.clientEmail, creds.privateKey);
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(creds.calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(buildEventBody(booking)),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Calendar event update failed (${res.status}): ${body}`);
  }
  return true;
}

// Called when a booking is cancelled — removes the calendar entry instead
// of leaving a stale event with no indication it was called off. A 404
// (already gone, or never existed) is treated as success, not an error.
export async function deleteBookingCalendarEvent(eventId: string): Promise<void> {
  const creds = getCredentials();
  if (!creds) return;

  const token = await getAccessToken(creds.clientEmail, creds.privateKey);
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(creds.calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const body = await res.text();
    throw new Error(`Google Calendar event delete failed (${res.status}): ${body}`);
  }
}
