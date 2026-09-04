import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PaymentProviderSelect } from "@/components/payment-provider-select";
import { CheckCircle2, CreditCard, Landmark, Smartphone } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Project Payment",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `/pay/${id}`,
    },
  };
}

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

// A subsequent (post-deposit) payment still needs a sane floor so a client
// can't send a 1-kobo "payment", ₦1,000 or whatever's left, whichever is
// smaller.
const MIN_INSTALLMENT_KOBO = 100_000;

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let booking;
  try {
    booking = await prisma.booking.findUnique({ where: { id } });
  } catch {
    booking = null;
  }

  if (!booking || !booking.agreedAmount || !booking.depositAmount) notFound();

  // If this client was referred and their referrer has automatic payouts
  // set up, their base commission auto-splits via Paystack's subaccount —
  // see src/lib/paystack.ts for why this is always a fixed 10%, and
  // src/lib/referral-commission.ts for how the bonus-tier extra (if any)
  // still gets tracked for manual payout regardless.
  let paystackSubaccountCode: string | null = null;
  if (booking.userId) {
    try {
      const referral = await prisma.referral.findUnique({
        where: { referredUserId: booking.userId },
        include: { partner: true },
      });
      if (referral && referral.status !== "DISQUALIFIED" && !referral.partner.suspended) {
        paystackSubaccountCode = referral.partner.paystackSubaccountCode;
      }
    } catch {
      // Non-fatal — checkout proceeds without a split rather than blocking payment.
    }
  }

  const remaining = booking.agreedAmount - booking.amountPaid;
  const percentPaid = Math.round((booking.amountPaid / booking.agreedAmount) * 100);
  const fullyPaid = remaining <= 0;
  const isFirstPayment = booking.amountPaid === 0;
  const minimumForThisPayment = isFirstPayment
    ? booking.depositAmount
    : Math.min(MIN_INSTALLMENT_KOBO, remaining);

  return (
    <div className="mx-auto max-w-lg px-6 py-24">
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        Project payment
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight">
        {booking.serviceInterest}
      </h1>
      <p className="mt-2 text-sm text-[var(--color-slate)]">For {booking.fullName}</p>

      <div className="glass mt-8 space-y-3 rounded-2xl p-7">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-slate)]">Total project cost</span>
          <span>{formatNaira(booking.agreedAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-slate)]">Paid so far</span>
          <span className="font-[family-name:var(--font-mono)] text-[var(--color-brass)]">
            {formatNaira(booking.amountPaid)} ({percentPaid}%)
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-slate)]">Remaining balance</span>
          <span className="font-[family-name:var(--font-mono)] text-lg">
            {fullyPaid ? "₦0" : formatNaira(remaining)}
          </span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[var(--color-brass)] transition-all"
            style={{ width: `${Math.min(100, percentPaid)}%` }}
          />
        </div>

        {isFirstPayment && (
          <p className="text-xs text-[var(--color-slate)]">
            The first payment must be at least {formatNaira(booking.depositAmount)} ({booking.depositPercentage}% minimum) before work begins.
          </p>
        )}
      </div>

      <div className="mt-8">
        {!fullyPaid && (
          <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-[var(--color-slate)]">
            <span className="flex items-center gap-1.5">
              <CreditCard size={14} /> Debit/credit card
            </span>
            <span className="flex items-center gap-1.5">
              <Landmark size={14} /> Bank transfer
            </span>
            <span className="flex items-center gap-1.5">
              <Smartphone size={14} /> USSD
            </span>
          </div>
        )}

        {fullyPaid ? (
          <p className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            <CheckCircle2 size={16} /> Paid in full, thank you.
          </p>
        ) : (
          <PaymentProviderSelect
            bookingId={booking.id}
            email={booking.email}
            name={booking.fullName}
            minimumKobo={minimumForThisPayment}
            remainingKobo={remaining}
            paystackSubaccountCode={paystackSubaccountCode}
          />
        )}
      </div>

      <p className="mt-6 text-xs text-[var(--color-slate)]">
        Secure checkout by Paystack, choose your payment method on the next screen. A
        receipt is emailed after every payment, showing what&apos;s paid and what remains.
      </p>
    </div>
  );
}
