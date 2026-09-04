import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { togglePartnerSuspended } from "./actions";
import { Ban, CheckCircle2, ArrowUpRight } from "lucide-react";

async function getPartners() {
  try {
    const partners = await prisma.referralPartner.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        referrals: { select: { status: true } },
        _count: { select: { referrals: true } },
      },
    });
    return { partners, connected: true };
  } catch {
    return { partners: [], connected: false };
  }
}

export default async function AdminPartnersPage() {
  const { partners, connected } = await getPartners();

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Referral Partners
      </h1>
      <p className="mt-2 max-w-lg text-sm text-[var(--color-slate)]">
        Everyone signed up under the referral partner program, and how many of their referrals have
        actually converted.
      </p>

      {!connected && (
        <div className="glass mt-6 rounded-xl p-4 text-sm text-[var(--color-slate)]">
          Not connected to a database yet.
        </div>
      )}

      {connected && partners.length === 0 && (
        <p className="mt-8 text-sm text-[var(--color-slate)]">
          No referral partners have signed up yet.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {partners.map((partner) => {
          const converted = partner.referrals.filter((r) => r.status === "CONVERTED").length;
          return (
            <div key={partner.id} className="glass rounded-xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {partner.user.name}
                    {partner.suspended && (
                      <span className="ml-2 rounded-full border border-red-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-red-400">
                        Suspended
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-slate)]">
                    {partner.user.email} · code <code>{partner.referralCode}</code> ·{" "}
                    {partner._count.referrals} referral{partner._count.referrals === 1 ? "" : "s"},{" "}
                    {converted} paid
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/partners/${partner.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs font-medium transition hover:border-[var(--color-brass)]"
                  >
                    View <ArrowUpRight size={13} />
                  </Link>
                  <form action={togglePartnerSuspended}>
                    <input type="hidden" name="id" value={partner.id} />
                    <input type="hidden" name="suspended" value={String(partner.suspended)} />
                    <button
                      type="submit"
                      title={partner.suspended ? "Unsuspend" : "Suspend"}
                      className="rounded-lg border border-[var(--color-line)] p-2 transition hover:border-[var(--color-brass)]"
                    >
                      {partner.suspended ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
