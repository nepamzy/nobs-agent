"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteBooking } from "../actions";

export function DeleteBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this booking permanently? This also removes its payment history. This can't be undone."
    );
    if (!confirmed) return;

    setLoading(true);
    const formData = new FormData();
    formData.set("id", bookingId);
    try {
      await deleteBooking(formData);
      router.push("/admin/bookings");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete booking.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      {loading ? "Deleting…" : "Delete booking"}
    </button>
  );
}
