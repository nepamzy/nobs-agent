"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2 text-sm text-[var(--color-slate)] transition hover:text-[var(--color-brass)]"
    >
      <LogOut size={15} /> Sign out
    </button>
  );
}
