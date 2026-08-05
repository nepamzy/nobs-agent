import { FileText } from "lucide-react";

function isImage(name: string) {
  return /\.(jpe?g|png|gif|webp)$/i.test(name);
}
function isVideo(name: string) {
  return /\.(mp4|mov|webm|avi)$/i.test(name);
}

export function MessageAttachment({ url, name }: { url: string; name: string }) {
  if (isImage(name)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 block">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URL, size varies per upload */}
        <img src={url} alt={name} className="max-h-48 rounded-lg border border-white/10 object-cover" />
      </a>
    );
  }

  if (isVideo(name)) {
    return (
      <video controls className="mt-2 max-h-48 rounded-lg border border-white/10">
        <source src={url} />
      </video>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[var(--color-brass)] underline underline-offset-4"
    >
      <FileText size={13} /> {name}
    </a>
  );
}
