import type { Metadata } from "next";
import Image from "next/image";
import { Clock, CheckCircle2 } from "lucide-react";
import { getWaitlistStatus } from "@/lib/referral-partner-waitlist";

// Live DB lookup, never cached — the whole point is an up-to-date position.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Waitlist status",
  robots: { index: false },
};

export default async function WaitlistStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const status = await getWaitlistStatus(id);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-24">
      <Image src="/logo-mark.svg" alt="" width={56} height={56} className="mx-auto mb-6" />
      <p className="mb-3 text-center font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        Referral Partner Program
      </p>

      {!status ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="font-medium text-red-400">Not found</p>
          <p className="mt-2 text-sm text-[var(--color-slate)]">
            This waitlist link isn&apos;t valid. Check the link you were emailed, or{" "}
            <a href="/partner/signup" className="text-[var(--color-brass)] underline underline-offset-4">
              sign up again
            </a>
            .
          </p>
        </div>
      ) : status.promoted ? (
        <div className="glass flex flex-col items-center gap-3 rounded-2xl p-8 text-center">
          <CheckCircle2 className="text-emerald-400" size={32} />
          <p className="font-[family-name:var(--font-display)] text-xl font-medium">
            You&apos;re in, {status.name.split(" ")[0]}!
          </p>
          <p className="text-sm text-[var(--color-slate)]">
            A spot opened up and your referral partner account is live. Check your email for your
            login details, or sign in directly.
          </p>
          <a
            href="/login"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
          >
            Sign in
          </a>
        </div>
      ) : (
        <div className="glass flex flex-col items-center gap-3 rounded-2xl p-8 text-center">
          <Clock className="text-[var(--color-brass)]" size={32} />
          <p className="font-[family-name:var(--font-display)] text-xl font-medium">
            You&apos;re number {status.position} on the waitlist.
          </p>
          <p className="text-sm text-[var(--color-slate)]">
            {status.totalWaiting} {status.totalWaiting === 1 ? "person is" : "people are"} currently
            waiting. The moment a spot opens up, it goes to whoever&apos;s been waiting longest —
            we&apos;ll email you automatically and your account will be ready, no need to sign up
            again.
          </p>
        </div>
      )}
    </div>
  );
}
