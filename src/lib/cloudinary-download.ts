// The plain HTML `download` attribute is silently ignored by browsers for
// cross-origin URLs like Cloudinary's CDN, security restriction, not a
// bug. Cloudinary's own fl_attachment flag is the real way to force a
// download with the correct filename and headers, inserted right after
// the /upload/ segment of the URL.
export function toDownloadUrl(url: string, fileName: string): string {
  const encodedName = encodeURIComponent(fileName.replace(/\.[^.]+$/, ""));
  return url.replace("/upload/", `/upload/fl_attachment:${encodedName}/`);
}
