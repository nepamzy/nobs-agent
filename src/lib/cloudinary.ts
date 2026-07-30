import crypto from "crypto";

// Cloudinary's signed-upload algorithm: sort every parameter that will be
// sent to the upload API (except file/api_key/resource_type/cloud_name),
// join as key=value&key=value, append the API secret, then SHA-1 hash.
// https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
export function generateCloudinarySignature(
  paramsToSign: Record<string, string | number>,
  apiSecret: string
) {
  const sorted = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(sorted + apiSecret)
    .digest("hex");
}

export function getCloudinaryEnv() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}
