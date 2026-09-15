import { NextResponse, type NextRequest } from "next/server";

// Edge runtime so this reads Vercel's `x-vercel-ip-country` header directly
// at the edge, without ever touching a page render — keeping every other
// route statically generated. CurrencyProvider fetches this client-side,
// the same pattern it already uses for /api/exchange-rates.
export const runtime = "edge";

export async function GET(req: NextRequest) {
  const country = req.headers.get("x-vercel-ip-country");
  return NextResponse.json({ country: country ?? null });
}
