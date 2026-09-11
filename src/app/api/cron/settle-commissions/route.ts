import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { buildCommissionEarnedHtml, buildOverrideCommissionEarnedHtml } from "@/lib/partner-email";

// Vercel Cron calls this on a schedule (see vercel.json) with
// `Authorization: Bearer ${CRON_SECRET}` automatically attached once
// CRON_SECRET is set in the project's env vars — this route rejects
// anything else, since it flips payout state and sends emails.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// Every commission row whose autoSettlesAt has passed and isn't paid out
// yet: Paystack has had time to actually settle it to the recipient's
// bank account by now, so this is where "you earned a commission" first
// gets said out loud — never earlier, see src/lib/referral-commission.ts.
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const due = await prisma.referralCommission.findMany({
    where: { paidOut: false, autoSettlesAt: { lte: new Date() } },
    include: {
      referral: { include: { partner: { include: { user: true } }, referredUser: true } },
      recipientPartner: { include: { user: true } },
    },
  });

  let settled = 0;
  const errors: string[] = [];

  for (const commission of due) {
    try {
      await prisma.referralCommission.update({
        where: { id: commission.id },
        data: { paidOut: true, paidOutAt: new Date() },
      });
      settled++;

      // The override row's own recipient is the recruiter (recipientPartner);
      // every other row's recipient is the referral's own partner — same
      // rule the dashboard aggregation uses.
      const recipient = commission.recipientPartner ?? commission.referral.partner;
      const clientName = commission.referral.referredUser.name;

      if (commission.isOverridePortion) {
        await prisma.notification.create({
          data: {
            userId: recipient.userId,
            title: "You earned an override commission",
            body: `You earned ₦${(commission.amount / 100).toLocaleString("en-NG")} from ${commission.referral.partner.user.name}'s referral.`,
            link: "/partner",
          },
        });
        if (recipient.user.emailNotifications && process.env.BREVO_API_KEY) {
          await sendBrevoEmail({
            to: [{ email: recipient.user.email, name: recipient.user.name }],
            subject: "You earned an override commission",
            htmlContent: buildOverrideCommissionEarnedHtml({
              partnerName: recipient.user.name,
              recruitName: commission.referral.partner.user.name,
              clientName,
              amount: commission.amount,
            }),
          }).catch((err) => errors.push(`email ${commission.id}: ${err}`));
        }
        continue;
      }

      if (commission.isBonusPortion) {
        // The bonus portion is never auto-settled (see referral-commission.ts)
        // so it never has autoSettlesAt set, and never reaches this loop on
        // its own — it's only ever combined into the base row's email below.
        continue;
      }

      // Base portion: combine with its sibling bonus row (if any) into one
      // total, matching the same combined figure the immediate (no-subaccount)
      // path has always sent.
      const bonusSibling = await prisma.referralCommission.findFirst({
        where: {
          referralId: commission.referralId,
          bookingPaymentId: commission.bookingPaymentId,
          isBonusPortion: true,
        },
      });
      const totalAmount = commission.amount + (bonusSibling?.amount ?? 0);

      await prisma.notification.create({
        data: {
          userId: recipient.userId,
          title: "You earned a referral commission",
          body: `You earned ₦${(totalAmount / 100).toLocaleString("en-NG")} in commission — sent straight to your account.`,
          link: "/partner",
        },
      });

      if (recipient.user.emailNotifications && process.env.BREVO_API_KEY) {
        await sendBrevoEmail({
          to: [{ email: recipient.user.email, name: recipient.user.name }],
          subject: "You earned a referral commission",
          htmlContent: buildCommissionEarnedHtml({
            partnerName: recipient.user.name,
            clientName,
            amount: totalAmount,
            ratePercent: commission.referral.commissionRatePercent ?? 10,
            autoPaidOut: true,
          }),
        }).catch((err) => errors.push(`email ${commission.id}: ${err}`));
      }
    } catch (err) {
      errors.push(`commission ${commission.id}: ${err}`);
    }
  }

  return NextResponse.json({ ok: true, checked: due.length, settled, errors });
}
