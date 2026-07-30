import type { Metadata } from "next";
import Image from "next/image";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = {
  title: "Create your account",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-24">
      <Image src="/logo-mark.svg" alt="" width={56} height={56} className="mx-auto mb-6" />
      <p className="mb-3 text-center font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        Client Access
      </p>
      <h1 className="mb-8 text-center font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight">
        Create your account
      </h1>
      <SignupForm />
    </div>
  );
}
