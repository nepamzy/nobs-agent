// Shared Paystack API helpers for the referral-partner payout flow (bank
// list, account resolution, subaccount creation). The existing checkout
// verification call (src/app/api/paystack/verify/route.ts) inlines its own
// fetch and is deliberately left untouched — only the new calls this
// feature needs live here.

const PAYSTACK_API = "https://api.paystack.co";

// Every partner's subaccount is created with this exact value, always —
// empirically verified against a real test transaction (not guessed from
// Paystack's docs, which were unreachable/ambiguous on this point): with
// percentage_charge=90, the subaccount receives exactly 10% of the full
// payment amount, untouched by Paystack's own processing fee (which comes
// out of the main account's share instead, since fee-bearing defaults to
// the main account). This is the fixed base referral commission rate.
export const SUBACCOUNT_PERCENTAGE_CHARGE = 90;

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  return key;
}

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PAYSTACK_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const json = await res.json();
  if (!res.ok || json?.status !== true) {
    throw new Error(json?.message ?? "Paystack request failed.");
  }
  return json.data as T;
}

export type PaystackBank = {
  name: string;
  code: string;
  slug: string;
};

export async function listBanks(): Promise<PaystackBank[]> {
  const banks = await paystackFetch<PaystackBank[]>("/bank?currency=NGN&perPage=100");
  return banks
    .map((b) => ({ name: b.name, code: b.code, slug: b.slug }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function resolveAccountNumber(
  accountNumber: string,
  bankCode: string
): Promise<{ accountNumber: string; accountName: string }> {
  const data = await paystackFetch<{ account_number: string; account_name: string }>(
    `/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`
  );
  return { accountNumber: data.account_number, accountName: data.account_name };
}

export async function createSubaccount(params: {
  businessName: string;
  bankCode: string;
  accountNumber: string;
}): Promise<{ subaccountCode: string }> {
  const data = await paystackFetch<{ subaccount_code: string }>("/subaccount", {
    method: "POST",
    body: JSON.stringify({
      business_name: params.businessName,
      settlement_bank: params.bankCode,
      account_number: params.accountNumber,
      percentage_charge: SUBACCOUNT_PERCENTAGE_CHARGE,
    }),
  });
  return { subaccountCode: data.subaccount_code };
}
