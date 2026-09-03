"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import { Loader2, ImageIcon, X } from "lucide-react";

export function GalleryUpload({
  defaultValues = [],
  folder = "nobs-agent/gallery",
}: {
  defaultValues?: string[];
  folder?: string;
}) {
  const [urls, setUrls] = useState<string[]>(defaultValues);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploaded: string[] = [];
      for (const file of files) {
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

        uploaded.push(uploadJson.secure_url);
      }
      setUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeAt(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
        Gallery (multiple images)
      </label>

      {urls.map((url) => (
        <input key={url} type="hidden" name="gallery" value={url} />
      ))}

      {urls.length > 0 && (
        <div className="mb-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {urls.map((url, i) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-white/10">
              <Image src={url} alt="" fill sizes="(max-width: 640px) 25vw, 16vw" className="object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 opacity-0 transition group-hover:opacity-100"
                aria-label="Remove"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs font-medium transition hover:border-[var(--color-brass)]">
        {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
        {uploading ? "Uploading" : "Add images"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFile}
          disabled={uploading}
        />
      </label>

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}
