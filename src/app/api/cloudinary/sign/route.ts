import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateCloudinarySignature, getCloudinaryEnv } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const env = getCloudinaryEnv();
  if (!env) {
    return NextResponse.json(
      { error: "Cloudinary isn't configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const folder = typeof body.folder === "string" && body.folder ? body.folder : "nobs-agent";

  const timestamp = Math.round(Date.now() / 1000);
  // Only parameters actually sent with the upload need to be part of the
  // signed string, adding unsigned fields (like resource_type or the file
  // itself) here would make Cloudinary reject the signature as mismatched.
  const signature = generateCloudinarySignature({ timestamp, folder }, env.apiSecret);

  return NextResponse.json({
    signature,
    timestamp,
    apiKey: env.apiKey,
    cloudName: env.cloudName,
    folder,
  });
}
