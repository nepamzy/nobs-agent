import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PaymentProviderSelect } from "@/components/payment-provider-select";
import { PaymentReturnHandler } from "@/components/payment-return-handler";
import { MIN_INSTALLMENT_KOBO } from "@/lib/payment-constants";
import { getExchangeRates, convertAmount } from "@/lib/exchange-rates";
import { formatMajorAmount } from "@/lib/booking-currencies";
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

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ verify?: string }>;
}) {
  const { id } = await params;
  const { verify } = await searchParams;

  let booking;
  try {
    booking = await prisma.booking.findUnique({ where: { id } });
  } catch {
    booking = null;
  }

  if (!booking || !booking.agreedAmount || !booking.depositAmount) notFound();

  const remaining = booking.agreedAmount - booking.amountPaid;
  const percentPaid = Math.round((booking.amountPaid / booking.agreedAmount) * 100);
  const fullyPaid = remaining <= 0;
  const isFirstPayment = booking.amountPaid === 0;
  const minimumForThisPayment = isFirstPayment
    ? booking.depositAmount
    : Math.min(MIN_INSTALLMENT_KOBO, remaining);

  // Everything above stays real NGN kobo, the studio's actual books never
  // change currency (see the comment on Booking.currency in schema.prisma).
  // For a non-NGN booking, these are ONLY converted here for display and
  // for what gets charged through Flutterwave — src/api/flutterwave/verify
  // converts what actually comes back into an NGN-kobo equivalent before
  // crediting amountPaid, so the numbers above stay the source of truth.
  const currency = booking.currency;
  const isForeign = currency !== "NGN";
  let display = {
    total: formatNaira(booking.agreedAmount),
    paid: formatNaira(booking.amountPaid),
    remaining: fullyPaid ? formatNaira(0) : formatNaira(remaining),
    deposit: formatNaira(booking.depositAmount),
  };
  let minimumMajor: number | undefined;
  let remainingMajor: number | undefined;

  if (isForeign) {
    const { rates } = await getExchangeRates();
    const toForeign = (kobo: number) => convertAmount(kobo / 100, "NGN", currency, rates);
    display = {
      total: formatMajorAmount(toForeign(booking.agreedAmount), currency),
      paid: formatMajorAmount(toForeign(booking.amountPaid), currency),
      remaining: fullyPaid ? formatMajorAmount(0, currency) : formatMajorAmount(toForeign(remaining), currency),
      deposit: formatMajorAmount(toForeign(booking.depositAmount), currency),
    };
    minimumMajor = toForeign(minimumForThisPayment);
    remainingMajor = toForeign(remaining);
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-24">
      {verify && <PaymentReturnHandler bookingId={booking.id} reference={verify} />}

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
          <span>{display.total}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-slate)]">Paid so far</span>
          <span className="font-[family-name:var(--font-mono)] text-[var(--color-brass)]">
            {display.paid} ({percentPaid}%)
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-slate)]">Remaining balance</span>
          <span className="font-[family-name:var(--font-mono)] text-lg">{display.remaining}</span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[var(--color-brass)] transition-all"
            style={{ width: `${Math.min(100, percentPaid)}%` }}
          />
        </div>

        {isFirstPayment && (
          <p className="text-xs text-[var(--color-slate)]">
            The first payment must be at least {display.deposit} ({booking.depositPercentage}% minimum) before work begins.
          </p>
        )}
        {isForeign && (
          <p className="text-xs text-[var(--color-slate)]">
            Prices shown in {currency} are converted from the agreed cost at today&apos;s rate, and may shift slightly by the time you pay.
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
            currency={currency}
            minimumKobo={minimumForThisPayment}
            remainingKobo={remaining}
            minimumMajor={minimumMajor}
            remainingMajor={remainingMajor}
          />
        )}
      </div>

      <p className="mt-6 text-xs text-[var(--color-slate)]">
        {isForeign
          ? "Secure checkout by Flutterwave, choose your payment method on the next screen. A receipt is emailed after every payment, showing what's paid and what remains."
          : "Secure checkout by Paystack, choose your payment method on the next screen. A receipt is emailed after every payment, showing what's paid and what remains."}
      </p>
    </div>
  );
}
