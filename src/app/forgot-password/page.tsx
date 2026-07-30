import type { Metadata } from "next";
import Image from "next/image";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-24">
      <Image src="/logo-mark.svg" alt="" width={48} height={48} className="mx-auto mb-6" />
      <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight">
        Reset your password
      </h1>
      <p className="mb-8 text-center text-sm text-[var(--color-slate)]">
        Enter the email on your account and we&apos;ll send a link to set a new password.
      </p>
      <ForgotPasswordForm />
    </div>
  );
}
