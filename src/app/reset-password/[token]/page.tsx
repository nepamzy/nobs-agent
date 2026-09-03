import type { Metadata } from "next";
import Image from "next/image";
import { ResetPasswordForm } from "@/components/reset-password-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  return {
    title: "Set a new password",
    robots: { index: false },
    alternates: {
      canonical: `/reset-password/${token}`,
    },
  };
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-24">
      <Image src="/logo-mark.svg" alt="" width={48} height={48} className="mx-auto mb-6" />
      <h1 className="mb-8 text-center font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight">
        Set a new password
      </h1>
      <ResetPasswordForm token={token} />
    </div>
  );
}
