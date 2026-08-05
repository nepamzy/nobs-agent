"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Loader2, Paperclip, X, FileText, Image as ImageIcon, Video } from "lucide-react";

function attachmentIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    return <ImageIcon size={13} className="text-[var(--color-brass)]" />;
  }
  if (["mp4", "mov", "webm", "avi"].includes(ext)) {
    return <Video size={13} className="text-[var(--color-brass)]" />;
  }
  return <FileText size={13} className="text-[var(--color-brass)]" />;
}

export function MessageAttachmentInput({
  signEndpoint = "/api/cloudinary/sign-client-upload",
}: {
  signEndpoint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attached, setAttached] = useState<{ url: string; name: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const sigRes = await fetch(signEndpoint, { method: "POST" });
      const sigJson = await sigRes.json();
      if (!sigRes.ok) throw new Error(sigJson.error ?? "Could not prepare the upload.");

      const { signature, timestamp, apiKey, cloudName, folder } = sigJson;

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey);
      uploadData.append("timestamp", String(timestamp));
      uploadData.append("signature", signature);
      uploadData.append("folder", folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: uploadData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error?.message ?? "Upload failed.");

      setAttached({ url: uploadJson.secure_url, name: file.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {attached && (
        <>
          <input type="hidden" name="attachmentUrl" value={attached.url} />
          <input type="hidden" name="attachmentName" value={attached.name} />
        </>
      )}

      <div className="mb-2 flex items-center gap-2">
        {attached ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brass)]/40 bg-[var(--color-brass)]/10 px-3 py-1.5 text-xs">
            {attachmentIcon(attached.name)}
            {attached.name.length > 24 ? `${attached.name.slice(0, 24)}...` : attached.name}
            <button
              type="button"
              onClick={() => setAttached(null)}
              aria-label="Remove attachment"
              className="text-[var(--color-slate)] hover:text-red-400"
            >
              <X size={12} />
            </button>
          </span>
        ) : (
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3 py-1.5 text-xs transition hover:border-[var(--color-brass)]">
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} />}
            {uploading ? "Uploading" : "Attach"}
            <input ref={inputRef} type="file" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
        )}
      </div>
      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
