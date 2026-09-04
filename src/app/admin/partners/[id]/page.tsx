import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { tierProgress } from "@/lib/referral-tier";
import { disqualifyReferral, reinstateReferral, markCommissionPaidOut } from "../actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Ban, RotateCcw, CheckCircle2 } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "text-[var(--color-slate)]",
  CONVERTED: "text-emerald-400",
  DISQUALIFIED: "text-red-400",
};

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

async function getPartner(id: string) {
  return prisma.referralPartner.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      referrals: {
        include: {
          referredUser: {
            select: { name: true, email: true, bookings: { select: { amountPaid: true } } },
          },
          commissions: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function AdminPartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let partner;
  try {
    partner = await getPartner(id);
  } catch {
    partner = null;
  }

  if (!partner) notFound();

  const progress = tierProgress(partner.paidReferralCount);
  const allCommissions = partner.referrals.flatMap((r) => r.commissions);
  const totalEarned = allCommissions.reduce((sum, c) => sum + c.amount, 0);
  const totalPending = allCommissions.filter((c) => !c.paidOut).reduce((sum, c) => sum + c.amount, 0);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        {partner.user.name}
      </h1>
      <p className="mt-1 text-sm text-[var(--color-slate)]">
        {partner.user.email} · {partner.user.phone} · code <code>{partner.referralCode}</code>
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-[var(--color-slate)]">Paid referrals</p>
          <p className="mt-2 font-[family-name:var(--font-mono)] text-3xl text-[var(--color-brass)]">
            {partner.paidReferralCount}
          </p>
          <p className="mt-1 text-xs text-[var(--color-slate)]">
            {progress.inBonusTier ? "Currently in 20% bonus tier" : `${progress.referralsUntilNextBonus} until next bonus tier`}
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-[var(--color-slate)]">Total earned</p>
          <p className="mt-2 break-words font-[family-name:var(--font-mono)] text-3xl text-[var(--color-brass)]">
            {formatNaira(totalEarned)}
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-[var(--color-slate)]">Pending payout</p>
          <p className="mt-2 break-words font-[family-name:var(--font-mono)] text-3xl text-[var(--color-brass)]">
            {formatNaira(totalPending)}
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-[var(--color-slate)]">Bank details</p>
          <p className="mt-2 whitespace-pre-line text-sm text-[var(--color-slate)]">
            {partner.bankDetails || "Not provided"}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {partner.referrals.length === 0 && (
          <p className="text-sm text-[var(--color-slate)]">No referrals yet.</p>
        )}

        {partner.referrals.map((referral) => {
          const totalPaidByClient = referral.referredUser.bookings.reduce(
            (sum, b) => sum + b.amountPaid,
            0
          );
          return (
            <div key={referral.id} className="glass rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {referral.referredUser.name}{" "}
                    <span className={`text-xs ${statusColors[referral.status]}`}>
                      ({referral.status.toLowerCase()})
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-slate)]">
                    {referral.referredUser.email} · paid {formatNaira(totalPaidByClient)}
                    {referral.commissionRatePercent ? ` · ${referral.commissionRatePercent}% rate` : ""}
                  </p>
                  {referral.status === "DISQUALIFIED" && referral.disqualifiedReason && (
                    <p className="mt-1 text-xs text-red-400">Reason: {referral.disqualifiedReason}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {referral.status !== "DISQUALIFIED" ? (
                    <form action={disqualifyReferral} className="flex items-center gap-2">
                      <input type="hidden" name="referralId" value={referral.id} />
                      <input
                        type="text"
                        name="reason"
                        placeholder="Reason to disqualify"
                        className="w-40 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs outline-none focus:border-[var(--color-brass)]"
                      />
                      <ConfirmSubmit
                        message={`Disqualify this referral? ${referral.referredUser.name} will no longer earn commission for ${partner.user.name}.`}
                        title="Disqualify"
                        className="rounded-lg border border-[var(--color-line)] p-2 transition hover:border-red-500/50 hover:text-red-400"
                      >
                        <Ban size={14} />
                      </ConfirmSubmit>
                    </form>
                  ) : (
                    <form action={reinstateReferral}>
                      <input type="hidden" name="referralId" value={referral.id} />
                      <button
                        type="submit"
                        title="Reinstate"
                        className="rounded-lg border border-[var(--color-line)] p-2 transition hover:border-[var(--color-brass)]"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {referral.commissions.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-[var(--color-line)] pt-3">
                  {referral.commissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-slate)]">
                        {new Date(commission.createdAt).toLocaleDateString()} —{" "}
                        <span className="font-[family-name:var(--font-mono)] text-[var(--color-brass)]">
                          {formatNaira(commission.amount)}
                        </span>{" "}
                        <span className="text-[10px] uppercase tracking-wider text-[var(--color-slate)]">
                          ({commission.isBonusPortion ? "bonus" : "base"})
                        </span>
                      </span>
                      {commission.paidOut ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 size={12} /> Paid out
                        </span>
                      ) : (
                        <form action={markCommissionPaidOut}>
                          <input type="hidden" name="commissionId" value={commission.id} />
                          <input type="hidden" name="partnerId" value={partner.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-[var(--color-line)] px-2.5 py-1 transition hover:border-[var(--color-brass)]"
                          >
                            Mark paid out
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
