import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { togglePartnerSuspended, updateReferralProgramSettingsAction } from "./actions";
import { getReferralProgramSettings } from "@/lib/referral-program-settings";
import { listWaitlistEntries } from "@/lib/referral-partner-waitlist";
import { Ban, CheckCircle2, ArrowUpRight, Clock } from "lucide-react";

async function getPartners() {
  try {
    const partners = await prisma.referralPartner.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        referrals: {
          select: {
            status: true,
            referredUser: { select: { bookings: { select: { id: true }, take: 1 } } },
          },
        },
        _count: { select: { referrals: true } },
      },
    });
    return { partners, connected: true };
  } catch (err) {
    console.error("[admin/partners] getPartners failed", err);
    return { partners: [], connected: false };
  }
}

export default async function AdminPartnersPage() {
  const [{ partners, connected }, settings, waitlist] = await Promise.all([
    getPartners(),
    getReferralProgramSettings(),
    listWaitlistEntries(),
  ]);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Referral Partners
      </h1>
      <p className="mt-2 max-w-lg text-sm text-[var(--color-slate)]">
        Everyone signed up under the referral partner program, and how many of their referrals have
        booked a consultation versus actually converted (paid).
      </p>

      <form
        action={updateReferralProgramSettingsAction}
        className="glass mt-6 flex flex-wrap items-end gap-6 rounded-xl p-5"
      >
        <div>
          <label htmlFor="partnerCapacity" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
            Referral partner slots
          </label>
          <input
            id="partnerCapacity"
            name="partnerCapacity"
            type="number"
            min={0}
            max={100000}
            defaultValue={settings.partnerCapacity}
            className="w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-brass)]"
          />
        </div>

        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="multiLevelReferralsEnabled"
            defaultChecked={settings.multiLevelReferralsEnabled}
            className="h-4 w-4 accent-[var(--color-brass)]"
          />
          <span>
            Approve multi-level referrals
            <span className="block text-xs text-[var(--color-slate)]">
              Off: a partner can only refer clients. On: a partner can also recruit other partners
              (5% override, base tier only).
            </span>
          </span>
        </label>

        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="directPartnerSignupEnabled"
            defaultChecked={settings.directPartnerSignupEnabled}
            className="h-4 w-4 accent-[var(--color-brass)]"
          />
          <span>
            Open direct signup on /partner/signup
            <span className="block text-xs text-[var(--color-slate)]">
              Off: the &quot;Middleman&quot; tile on /careers and any visit without a referral link
              shows a closed message instead of the form. Existing partners&apos; own referral links
              (?ref=...) keep working either way.
            </span>
          </span>
        </label>

        <button
          type="submit"
          className="rounded-full bg-[var(--color-brass)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
        >
          Save
        </button>
      </form>

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
          const booked = partner.referrals.filter((r) => r.referredUser.bookings.length > 0).length;
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
                    {!partner.suspended && partner.consecutiveInactiveMonths > 0 && (
                      <span
                        className="ml-2 rounded-full border border-amber-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-400"
                        title="No paying referral in this many consecutive calendar months — 3 auto-suspends"
                      >
                        {partner.consecutiveInactiveMonths}/3 inactive months
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-slate)]">
                    {partner.user.email} · code <code>{partner.referralCode}</code> ·{" "}
                    {partner._count.referrals} referral{partner._count.referrals === 1 ? "" : "s"},{" "}
                    {booked} booked, {converted} paid
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

      <div className="mt-10">
        <h2 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-medium">
          <Clock size={16} className="text-[var(--color-brass)]" /> Waitlist ({waitlist.length})
        </h2>
        <p className="mt-1 max-w-lg text-sm text-[var(--color-slate)]">
          Everyone who applied while all slots were taken. First in line gets the next spot that
          opens up, automatically — no action needed here.
        </p>

        {waitlist.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-slate)]">Nobody waiting right now.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {waitlist.map((entry) => (
              <div key={entry.id} className="glass flex items-center justify-between gap-3 rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium">
                    #{entry.position} — {entry.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-slate)]">
                    {entry.email} · {entry.phone} · joined {entry.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
