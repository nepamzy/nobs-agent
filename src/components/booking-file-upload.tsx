"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Loader2, Paperclip } from "lucide-react";
import { uploadBookingFile } from "@/app/dashboard/new-project/actions";

export function BookingFileUpload({ bookingId }: { bookingId: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const sigRes = await fetch("/api/cloudinary/sign-client-upload", { method: "POST" });
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

      const formData = new FormData();
      formData.set("bookingId", bookingId);
      formData.set("url", uploadJson.secure_url);
      formData.set("fileName", file.name);
      await uploadBookingFile(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mt-3">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs font-medium transition hover:border-[var(--color-brass)]">
        {uploading ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} />}
        {uploading ? "Uploading" : "Attach a file, photo, or video"}
        <input ref={inputRef} type="file" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}
