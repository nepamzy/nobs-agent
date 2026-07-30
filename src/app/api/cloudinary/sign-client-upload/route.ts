import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateCloudinarySignature, getCloudinaryEnv } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/rate-limit";

const CLIENT_UPLOADS_FOLDER = "nobs-agent/client-uploads";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { success: withinLimit } = rateLimit(`client-upload:${session.user.id}`, 10, 60_000);
  if (!withinLimit) {
    return NextResponse.json({ error: "Too many uploads, please slow down." }, { status: 429 });
  }

  const env = getCloudinaryEnv();
  if (!env) {
    return NextResponse.json({ error: "Uploads aren't configured yet." }, { status: 500 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  // Hardcoded folder, same pattern as the resume-upload endpoint, a
  // client can never sign an upload anywhere except their own uploads
  // folder, regardless of what they send.
  const signature = generateCloudinarySignature(
    { timestamp, folder: CLIENT_UPLOADS_FOLDER },
    env.apiSecret
  );

  return NextResponse.json({
    signature,
    timestamp,
    apiKey: env.apiKey,
    cloudName: env.cloudName,
    folder: CLIENT_UPLOADS_FOLDER,
  });
}
