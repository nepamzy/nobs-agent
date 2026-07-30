import { NextRequest, NextResponse } from "next/server";
import { generateCloudinarySignature, getCloudinaryEnv } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/rate-limit";

const RESUME_FOLDER = "nobs-agent/resumes";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success: withinLimit } = rateLimit(`resume-upload:${ip}`, 5, 60_000);
  if (!withinLimit) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const env = getCloudinaryEnv();
  if (!env) {
    return NextResponse.json(
      { error: "Uploads aren't configured yet. Email your resume directly instead." },
      { status: 500 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  // Hardcoded folder, not accepted from the request, so this endpoint can
  // never be used to sign an upload anywhere except the resumes folder.
  const signature = generateCloudinarySignature({ timestamp, folder: RESUME_FOLDER }, env.apiSecret);

  return NextResponse.json({
    signature,
    timestamp,
    apiKey: env.apiKey,
    cloudName: env.cloudName,
    folder: RESUME_FOLDER,
  });
}
