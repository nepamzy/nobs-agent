"use client";

import { useState, type ChangeEvent } from "react";
import { Loader2, ImageIcon, X } from "lucide-react";

export function ImageUpload({
  name,
  label,
  defaultValue,
  folder = "nobs-agent/covers",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  folder?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const sigRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      const sigJson = await sigRes.json();
      if (!sigRes.ok) throw new Error(sigJson.error ?? "Could not get an upload signature.");

      const { signature, timestamp, apiKey, cloudName, folder: signedFolder } = sigJson;

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey);
      uploadData.append("timestamp", String(timestamp));
      uploadData.append("signature", signature);
      uploadData.append("folder", signedFolder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: uploadData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error?.message ?? "Upload failed.");

      setUrl(uploadJson.secure_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">{label}</label>

      <input type="hidden" name={name} value={url} />

      <div className="flex items-start gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URL, not a local static asset
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={20} className="text-[var(--color-slate)]" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs font-medium transition hover:border-[var(--color-brass)]">
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
            {uploading ? "Uploading…" : "Upload image"}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>

          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="ml-2 inline-flex items-center gap-1 text-xs text-[var(--color-slate)] hover:text-red-400"
            >
              <X size={12} /> Remove
            </button>
          )}

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Or paste an image URL directly"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none transition focus:border-[var(--color-brass)]"
          />

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
