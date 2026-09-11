import type { Metadata } from "next";
import Image from "next/image";
import { SignupForm } from "@/components/signup-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Create your account",
  robots: { index: false },
  alternates: {
    canonical: "/signup",
  },
};

async function isRefCodeSuspended(ref: string | undefined): Promise<boolean> {
  if (!ref) return false;
  try {
    const partner = await prisma.referralPartner.findUnique({
      where: { referralCode: ref },
      select: { suspended: true },
    });
    return partner?.suspended ?? false;
  } catch {
    return false;
  }
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const linkSuspended = await isRefCodeSuspended(ref);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-24">
      <Image src="/logo-mark.svg" alt="" width={56} height={56} className="mx-auto mb-6" />
      <p className="mb-3 text-center font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        Client Access
      </p>
      <h1 className="mb-8 text-center font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight">
        Create your account
      </h1>
      {linkSuspended ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="font-medium text-red-400">Account Suspended</p>
          <p className="mt-2 text-sm text-[var(--color-slate)]">
            This referral link is no longer active. You can still{" "}
            <a href="/signup" className="text-[var(--color-brass)] underline underline-offset-4">
              create an account
            </a>{" "}
            without it.
          </p>
        </div>
      ) : (
        <SignupForm referralCode={ref} />
      )}
    </div>
  );
}
