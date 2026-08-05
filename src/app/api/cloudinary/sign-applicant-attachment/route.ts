import { NextRequest, NextResponse } from "next/server";
import { generateCloudinarySignature, getCloudinaryEnv } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/rate-limit";

const ATTACHMENT_FOLDER = "nobs-agent/message-attachments";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success: withinLimit } = rateLimit(`applicant-attachment:${ip}`, 10, 60_000);
  if (!withinLimit) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const env = getCloudinaryEnv();
  if (!env) {
    return NextResponse.json({ error: "Uploads aren't configured yet." }, { status: 500 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = generateCloudinarySignature({ timestamp, folder: ATTACHMENT_FOLDER }, env.apiSecret);

  return NextResponse.json({
    signature,
    timestamp,
    apiKey: env.apiKey,
    cloudName: env.cloudName,
    folder: ATTACHMENT_FOLDER,
  });
}
