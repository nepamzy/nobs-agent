import { NextResponse } from "next/server";
import { getExchangeRates } from "@/lib/exchange-rates";

export async function GET() {
  const { rates, updatedAt, fallback } = await getExchangeRates();
  return NextResponse.json({ base: "USD", rates, updatedAt, ...(fallback ? { fallback } : {}) });
}
