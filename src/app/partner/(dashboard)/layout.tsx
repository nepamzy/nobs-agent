import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already gates /partner to REFERRER, this is defense in
  // depth matching the same pattern used in src/app/admin/layout.tsx.
  const session = await auth();
  if (!session || session.user.role !== "REFERRER") {
    redirect("/login?callbackUrl=/partner");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-medium">
            {session.user.name ? session.user.name.split(" ")[0] : "Partner"}
          </p>
          <p className="text-xs text-[var(--color-slate)]">{session.user.email}</p>
        </div>
        <SignOutButton />
      </div>
      {children}
    </div>
  );
}
