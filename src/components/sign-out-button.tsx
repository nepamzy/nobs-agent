"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  async function handleSignOut() {
    // redirect: false, then a real window.location change, not next-auth's
    // own redirect, this guarantees a genuine full page load afterward.
    // A soft client-side navigation can occasionally show a cached
    // authenticated page for a flash before catching up to the cleared
    // session, this route can't do that, the browser asks the server for
    // everything fresh.
    await signOut({ redirect: false });
    window.location.href = "/";
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 text-sm text-[var(--color-slate)] transition hover:text-[var(--color-brass)]"
    >
      <LogOut size={15} /> Sign out
    </button>
  );
}
