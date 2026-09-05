import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { CapacityGauge } from "@/components/capacity-gauge";
import { MIDDLEMAN_CAPACITY, getMiddlemanCount } from "@/lib/middleman";

export const metadata: Metadata = {
  title: "Middleman dashboard",
  robots: { index: false },
};

export default async function MiddlemanDashboardPage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/middleman/dashboard");
  if (session.user.role !== "MIDDLEMAN") redirect("/dashboard");

  const count = await getMiddlemanCount();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-6 py-16 sm:py-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-medium">
            {session.user.name ? session.user.name.split(" ")[0] : "Welcome"}
          </p>
          <p className="text-xs text-[var(--color-slate)]">{session.user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <h1 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-medium">
        Middleman dashboard
      </h1>

      <CapacityGauge count={count} capacity={MIDDLEMAN_CAPACITY} label="Middlemen on the site" />
    </div>
  );
}
