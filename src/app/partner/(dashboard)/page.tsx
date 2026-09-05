import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/env";
import { tierProgress } from "@/lib/referral-tier";
import { REFERRAL_PARTNER_CAPACITY, getReferralPartnerCount } from "@/lib/referral-partner-capacity";
import { ReferralLinkCopy } from "@/components/referral-link-copy";
import { PayoutDetailsForm } from "@/components/payout-details-form";
import { CapacityGauge } from "@/components/capacity-gauge";
import { CheckCircle2, FileDown } from "lucide-react";

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  CONVERTED: "Converted",
  DISQUALIFIED: "Disqualified",
};

const statusColors: Record<string, string> = {
  PENDING: "text-[var(--color-slate)]",
  CONVERTED: "text-emerald-400",
  DISQUALIFIED: "text-red-400",
};

function fetchPartnerData(userId: string) {
  return prisma.referralPartner.findUnique({
    where: { userId },
    include: {
      referrals: {
        include: {
          referredUser: {
            select: { id: true, name: true, email: true, bookings: { select: { amountPaid: true } } },
          },
          commissions: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

async function getPartnerData(userId: string) {
  try {
    const partner = await fetchPartnerData(userId);
    return { partner, connected: true };
  } catch {
    return { partner: null, connected: false };
  }
}

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

export default async function PartnerDashboardPage() {
  const session = await auth();
  const { partner, connected } = await getPartnerData(session!.user.id);

  if (!connected) {
    return (
      <div className="glass rounded-2xl p-8 text-sm text-[var(--color-slate)]">
        Not connected to a database right now — try again shortly.
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="glass rounded-2xl p-8 text-sm text-[var(--color-slate)]">
        No partner profile found for this account.
      </div>
    );
  }

  const referralLink = `${getSiteUrl()}/signup?ref=${partner.referralCode}`;
  const progress = tierProgress(partner.paidReferralCount);
  const partnerCount = await getReferralPartnerCount();

  const convertedReferrals = partner.referrals.filter((r) => r.status === "CONVERTED");
  const allCommissions = partner.referrals.flatMap((r) => r.commissions);
  const totalEarned = allCommissions.reduce((sum, c) => sum + c.amount, 0);
  const totalPaidOut = allCommissions.filter((c) => c.paidOut).reduce((sum, c) => sum + c.amount, 0);
  const totalPending = totalEarned - totalPaidOut;

  return (
    <div>
      <div className="mb-6">
        <CapacityGauge
          count={partnerCount}
          capacity={REFERRAL_PARTNER_CAPACITY}
          label="Referral partners on the site"
        />
      </div>

      <div className="glass rounded-2xl p-6">
        <p className="mb-3 text-xs uppercase tracking-wider text-[var(--color-slate)]">
          Your referral link
        </p>
        <ReferralLinkCopy link={referralLink} />
        <p className="mt-3 text-xs text-[var(--color-slate)]">
          Anyone who signs up through this link and becomes a paying client earns you commission —
          {" "}{progress.inBonusTier ? "you're currently in the 20% bonus tier." : `${progress.referralsUntilNextBonus} more paid referral${progress.referralsUntilNextBonus === 1 ? "" : "s"} until your next 20% bonus tier.`}
        </p>
        <a
          href="/api/partner/agreement"
          className="mt-4 inline-flex items-center gap-2 text-xs text-[var(--color-brass)] underline underline-offset-4"
        >
          <FileDown size={13} /> Download your Referral Partner Agreement
        </a>
      </div>

      <div className="glass mt-6 rounded-2xl p-6">
        <p className="mb-3 text-xs uppercase tracking-wider text-[var(--color-slate)]">
          Payout details
        </p>
        {partner.paystackSubaccountCode ? (
          <div className="flex items-center gap-2 text-sm text-[var(--color-slate)]">
            <CheckCircle2 size={16} className="text-emerald-400" />
            Base commission pays out automatically to {partner.accountName} — bonus-tier commission
            is still paid manually.
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-[var(--color-slate)]">
              Add your bank details once, and your base commission pays straight into your account
              automatically from now on — no waiting on a manual transfer.
            </p>
            <PayoutDetailsForm />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-[var(--color-slate)]">Total referrals</p>
          <p className="mt-2 font-[family-name:var(--font-mono)] text-3xl text-[var(--color-brass)]">
            {partner.referrals.length}
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-[var(--color-slate)]">Paid referrals</p>
          <p className="mt-2 font-[family-name:var(--font-mono)] text-3xl text-[var(--color-brass)]">
            {convertedReferrals.length}
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
      </div>

      <div className="glass mt-8 rounded-2xl p-6">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-medium">
          Your referrals
        </h2>

        {partner.referrals.length === 0 ? (
          <p className="text-sm text-[var(--color-slate)]">
            No referrals yet — share your link above to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] text-xs uppercase tracking-wider text-[var(--color-slate)]">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Total paid</th>
                  <th className="pb-3 pr-4 font-medium">Rate</th>
                  <th className="pb-3 pr-4 font-medium">Commission earned</th>
                  <th className="pb-3 font-medium">Payout status</th>
                </tr>
              </thead>
              <tbody>
                {partner.referrals.map((referral) => {
                  const totalPaidByClient = referral.referredUser.bookings.reduce(
                    (sum, b) => sum + b.amountPaid,
                    0
                  );
                  const commissionEarned = referral.commissions.reduce((sum, c) => sum + c.amount, 0);
                  const commissionPaidOut = referral.commissions.every((c) => c.paidOut) && referral.commissions.length > 0;
                  const commissionPartiallyPaid = !commissionPaidOut && referral.commissions.some((c) => c.paidOut);

                  return (
                    <tr key={referral.id} className="border-b border-[var(--color-line)] last:border-0">
                      <td className="py-3 pr-4">{referral.referredUser.name}</td>
                      <td className={`py-3 pr-4 ${statusColors[referral.status]}`}>
                        {statusLabels[referral.status]}
                      </td>
                      <td className="py-3 pr-4 font-[family-name:var(--font-mono)]">
                        {formatNaira(totalPaidByClient)}
                      </td>
                      <td className="py-3 pr-4">
                        {referral.commissionRatePercent ? `${referral.commissionRatePercent}%` : "—"}
                      </td>
                      <td className="py-3 pr-4 font-[family-name:var(--font-mono)] text-[var(--color-brass)]">
                        {formatNaira(commissionEarned)}
                      </td>
                      <td className="py-3 text-xs text-[var(--color-slate)]">
                        {commissionEarned === 0
                          ? "—"
                          : commissionPaidOut
                            ? "Paid out"
                            : commissionPartiallyPaid
                              ? "Partially paid"
                              : "Pending"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
