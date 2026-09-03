// Cover images, gallery images, and the founder photo all go through
// ImageUpload/GalleryUpload, which accept either a real Cloudinary upload
// OR a manually pasted URL from anywhere. next/image only optimizes hosts
// listed in next.config.ts's remotePatterns (just res.cloudinary.com), so
// an arbitrary pasted URL would break it entirely. This gate lets us use
// next/image for the common case (an actual upload) while falling back to
// a plain <img> for manually pasted URLs from elsewhere.
export function isCloudinaryUrl(url: string): boolean {
  return url.startsWith("https://res.cloudinary.com/");
}
