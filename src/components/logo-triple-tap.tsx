"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/login-form";
import { X } from "lucide-react";

export function LogoTripleTap({ brand }: { brand: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleTap(e: React.MouseEvent) {
    e.preventDefault();
    tapCount.current += 1;

    if (tapTimer.current) clearTimeout(tapTimer.current);

    if (tapCount.current >= 3) {
      tapCount.current = 0;
      setOpen(true);
      return;
    }

    // No third tap arrived in time, treat it as a normal click to home.
    tapTimer.current = setTimeout(() => {
      if (tapCount.current > 0) {
        router.push("/");
      }
      tapCount.current = 0;
    }, 400);
  }

  return (
    <>
      <Link
        href="/"
        onClick={handleTap}
        className="flex items-center"
        aria-label={brand}
      >
        <Image src="/logo-full.svg" alt={brand} width={180} height={51} priority className="h-9 w-auto" />
      </Link>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="relative w-full max-w-sm">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute -top-10 right-0 text-[var(--color-slate)] hover:text-[var(--color-paper)]"
            >
              <X size={22} />
            </button>
            <p className="mb-4 text-center font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
              Studio access
            </p>
            <LoginForm callbackUrl="/admin" />
          </div>
        </div>
      )}
    </>
  );
}
