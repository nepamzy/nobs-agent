"use client";

import { useState } from "react";
import { PayButton } from "@/components/pay-button";
import { FlutterwaveButton } from "@/components/flutterwave-button";

export function PaymentProviderSelect({
  bookingId,
  email,
  name,
  minimumKobo,
  remainingKobo,
  paystackSubaccountCode,
}: {
  bookingId: string;
  email: string;
  name: string;
  minimumKobo: number;
  remainingKobo: number;
  // Only applies on the Paystack path — see src/lib/paystack.ts. Flutterwave
  // split payments aren't wired up (deliberately out of scope for now).
  paystackSubaccountCode?: string | null;
}) {
  const [provider, setProvider] = useState<"paystack" | "flutterwave">("paystack");

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setProvider("paystack")}
          className={`rounded-full px-4 py-2 text-xs font-medium transition ${
            provider === "paystack"
              ? "bg-[var(--color-brass)] text-[var(--color-ink)]"
              : "border border-[var(--color-line)] text-[var(--color-slate)]"
          }`}
        >
          Paystack
        </button>
        <button
          type="button"
          onClick={() => setProvider("flutterwave")}
          className={`rounded-full px-4 py-2 text-xs font-medium transition ${
            provider === "flutterwave"
              ? "bg-[var(--color-brass)] text-[var(--color-ink)]"
              : "border border-[var(--color-line)] text-[var(--color-slate)]"
          }`}
        >
          Flutterwave
        </button>
      </div>

      {provider === "paystack" ? (
        <PayButton
          bookingId={bookingId}
          email={email}
          minimumKobo={minimumKobo}
          remainingKobo={remainingKobo}
          paystackSubaccountCode={paystackSubaccountCode}
        />
      ) : (
        <FlutterwaveButton
          bookingId={bookingId}
          email={email}
          name={name}
          minimumKobo={minimumKobo}
          remainingKobo={remainingKobo}
        />
      )}
    </div>
  );
}
