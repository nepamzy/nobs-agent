import crypto from "crypto";

// Server-side only. Reads a GA4 property via the Google Analytics Data API,
// authenticated as a service account (Viewer access on the property) —
// no user OAuth flow, no browser involvement. Deliberately hand-rolls the
// JWT-bearer token exchange with Node's built-in crypto instead of pulling
// in `google-auth-library`/`googleapis`, matching this codebase's existing
// pattern of small `fetch`-based provider helpers (paystack.ts, brevo.ts)
// rather than SDKs.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

function base64url(input: Buffer | string) {
  return (typeof input === "string" ? Buffer.from(input) : input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function getCredentials() {
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  const clientEmail = process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL;
  // Service account private keys are multi-line PEM; env files can't hold
  // a literal newline in a simple KEY="value" line, so the value is stored
  // with escaped \n sequences and unescaped here.
  const privateKey = process.env.GOOGLE_ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!propertyId || !clientEmail || !privateKey) return null;
  return { propertyId, clientEmail, privateKey };
}

export function isGoogleAnalyticsConfigured() {
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

type ReportRow = { dimensionValues: { value: string }[]; metricValues: { value: string }[] };
type ReportResponse = { rows?: ReportRow[] };

async function runReport(body: Record<string, unknown>): Promise<ReportResponse> {
  const creds = getCredentials();
  if (!creds) throw new Error("Google Analytics isn't configured on the server yet.");
  const token = await getAccessToken(creds.clientEmail, creds.privateKey);

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${creds.propertyId}:runReport`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`GA4 runReport failed (${res.status}): ${errBody}`);
  }

  return res.json();
}

async function runRealtimeReport(body: Record<string, unknown>): Promise<ReportResponse> {
  const creds = getCredentials();
  if (!creds) throw new Error("Google Analytics isn't configured on the server yet.");
  const token = await getAccessToken(creds.clientEmail, creds.privateKey);

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${creds.propertyId}:runRealtimeReport`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`GA4 runRealtimeReport failed (${res.status}): ${errBody}`);
  }

  return res.json();
}

function num(row: ReportRow | undefined, index: number): number {
  const raw = row?.metricValues[index]?.value;
  return raw ? Number(raw) : 0;
}

export type GA4Summary = {
  activeUsers28d: number;
  newUsers28d: number;
  sessions28d: number;
  engagedSessions28d: number;
  engagementRate28d: number;
  avgEngagementTimeSec: number;
  pageViews28d: number;
  realtimeActiveUsers: number;
  topPages: { path: string; views: number }[];
  channels: { channel: string; sessions: number }[];
  devices: { device: string; users: number }[];
  countries: { country: string; users: number }[];
  dailyTrend: { date: string; activeUsers: number }[];
};

export async function getGA4Summary(): Promise<GA4Summary> {
  const dateRange = [{ startDate: "28daysAgo", endDate: "today" }];

  const [summary, topPages, channels, devices, countries, dailyTrend, realtime] = await Promise.all([
    runReport({
      dateRanges: dateRange,
      metrics: [
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "sessions" },
        { name: "engagedSessions" },
        { name: "engagementRate" },
        { name: "averageSessionDuration" },
        { name: "screenPageViews" },
      ],
    }),
    runReport({
      dateRanges: dateRange,
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    }),
    runReport({
      dateRanges: dateRange,
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
    runReport({
      dateRanges: dateRange,
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    }),
    runReport({
      dateRanges: dateRange,
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    }),
    runReport({
      dateRanges: [{ startDate: "29daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    runRealtimeReport({ metrics: [{ name: "activeUsers" }] }),
  ]);

  const summaryRow = summary.rows?.[0];

  return {
    activeUsers28d: num(summaryRow, 0),
    newUsers28d: num(summaryRow, 1),
    sessions28d: num(summaryRow, 2),
    engagedSessions28d: num(summaryRow, 3),
    engagementRate28d: num(summaryRow, 4) * 100,
    avgEngagementTimeSec: num(summaryRow, 5),
    pageViews28d: num(summaryRow, 6),
    realtimeActiveUsers: num(realtime.rows?.[0], 0),
    topPages: (topPages.rows ?? []).map((r) => ({
      path: r.dimensionValues[0]?.value ?? "",
      views: num(r, 0),
    })),
    channels: (channels.rows ?? []).map((r) => ({
      channel: r.dimensionValues[0]?.value ?? "",
      sessions: num(r, 0),
    })),
    devices: (devices.rows ?? []).map((r) => ({
      device: r.dimensionValues[0]?.value ?? "",
      users: num(r, 0),
    })),
    countries: (countries.rows ?? []).map((r) => ({
      country: r.dimensionValues[0]?.value ?? "",
      users: num(r, 0),
    })),
    dailyTrend: (dailyTrend.rows ?? []).map((r) => ({
      date: r.dimensionValues[0]?.value ?? "",
      activeUsers: num(r, 0),
    })),
  };
}
