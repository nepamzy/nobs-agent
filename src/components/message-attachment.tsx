import { FileText, Download } from "lucide-react";
import { toDownloadUrl } from "@/lib/cloudinary-download";

function isImage(name: string) {
  return /\.(jpe?g|png|gif|webp)$/i.test(name);
}
function isVideo(name: string) {
  return /\.(mp4|mov|webm|avi)$/i.test(name);
}

export function MessageAttachment({ url, name }: { url: string; name: string }) {
  const downloadUrl = toDownloadUrl(url, name);

  if (isImage(name)) {
    return (
      <div className="mt-2">
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URL, size varies per upload */}
          <img src={url} alt={name} className="max-h-48 rounded-lg border border-white/10 object-cover" />
        </a>
        <a
          href={downloadUrl}
          className="mt-1 inline-flex items-center gap-1 text-[10px] text-[var(--color-slate)] hover:text-[var(--color-brass)]"
        >
          <Download size={11} /> Download
        </a>
      </div>
    );
  }

  if (isVideo(name)) {
    return (
      <div className="mt-2">
        <video controls className="max-h-48 rounded-lg border border-white/10">
          <source src={url} />
        </video>
        <a
          href={downloadUrl}
          className="mt-1 block w-fit text-[10px] text-[var(--color-slate)] hover:text-[var(--color-brass)]"
        >
          <span className="inline-flex items-center gap-1">
            <Download size={11} /> Download
          </span>
        </a>
      </div>
    );
  }

  return (
    <a
      href={downloadUrl}
      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[var(--color-brass)] underline underline-offset-4"
    >
      <FileText size={13} /> {name}
      <Download size={12} />
    </a>
  );
}
