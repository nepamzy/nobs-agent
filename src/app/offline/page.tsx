import type { Metadata } from "next";
import Image from "next/image";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false },
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 py-24 text-center">
      <Image src="/logo-mark.svg" alt="" width={56} height={56} className="mb-6" />
      <WifiOff size={28} className="mb-4 text-[var(--color-brass)]" />
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        You&apos;re offline
      </h1>
      <p className="mt-2 text-sm text-[var(--color-slate)]">
        This page needs a connection. Once you&apos;re back online, reload and it&apos;ll
        pick up right where you left off.
      </p>
    </div>
  );
}
