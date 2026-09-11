"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listBanks, resolveAccountNumber, createSubaccount } from "@/lib/paystack";
import { sendBrevoEmail } from "@/lib/brevo";

async function requirePartner() {
  const session = await auth();
  if (!session || session.user.role !== "REFERRER") {
    throw new Error("Not authorized.");
  }
  const partner = await prisma.referralPartner.findUnique({ where: { userId: session.user.id } });
  if (!partner) throw new Error("No partner profile found for this account.");
  return { session, partner };
}

export async function getBankList() {
  await requirePartner();
  return listBanks();
}

const resolveSchema = z.object({
  accountNumber: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit account number."),
  bankCode: z.string().trim().min(1, "Select a bank."),
});

export type ResolveResult =
  | { ok: true; accountName: string }
  | { ok: false; error: string };

export async function resolveBankAccount(formData: FormData): Promise<ResolveResult> {
  await requirePartner();

  const parsed = resolveSchema.safeParse({
    accountNumber: formData.get("accountNumber"),
    bankCode: formData.get("bankCode"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const resolved = await resolveAccountNumber(parsed.data.accountNumber, parsed.data.bankCode);
    return { ok: true, accountName: resolved.accountName };
  } catch (err) {
    console.error("[partner payout] resolve failed", err);
    return { ok: false, error: "Could not verify that account. Double-check the number and bank." };
  }
}

const saveSchema = z.object({
  accountNumber: z.string().trim().regex(/^\d{10}$/),
  bankCode: z.string().trim().min(1),
  accountName: z.string().trim().min(1),
});

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function savePayoutDetails(formData: FormData): Promise<SaveResult> {
  const { session, partner } = await requirePartner();

  const parsed = saveSchema.safeParse({
    accountNumber: formData.get("accountNumber"),
    bankCode: formData.get("bankCode"),
    accountName: formData.get("accountName"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Missing or invalid payout details." };
  }

  try {
    const subaccount = await createSubaccount({
      businessName: parsed.data.accountName,
      bankCode: parsed.data.bankCode,
      accountNumber: parsed.data.accountNumber,
    });

    await prisma.referralPartner.update({
      where: { id: partner.id },
      data: {
        bankCode: parsed.data.bankCode,
        accountNumber: parsed.data.accountNumber,
        accountName: parsed.data.accountName,
        paystackSubaccountCode: subaccount.subaccountCode,
        subaccountSetupAt: new Date(),
      },
    });

    revalidatePath("/partner");

    // Confirm the payout is live — to the partner in-app, and to admin by
    // email (matches how every other admin-facing alert in this codebase
    // works, e.g. new bookings/inquiries), so nobody has to check Paystack
    // directly to know a subaccount just went live.
    await prisma.notification.create({
      data: {
        userId: partner.userId,
        title: "Payout account verified",
        body: `Your account ${parsed.data.accountName} is now set up — your base 10% commission will be sent to it automatically on every payment.`,
        link: "/partner",
      },
    });

    if (process.env.BREVO_API_KEY) {
      await sendBrevoEmail({
        to: [{ email: process.env.STUDIO_NOTIFICATION_EMAIL || "hello@nobsagent.com" }],
        subject: `Referral partner payout verified: ${session.user.name ?? session.user.email}`,
        htmlContent: `<p>${session.user.name ?? session.user.email} (${session.user.email}) just verified their payout account.</p>
<p>Bank account: ${parsed.data.accountName} · ${parsed.data.accountNumber}</p>
<p>Paystack subaccount: ${subaccount.subaccountCode}</p>
<p>Their base 10% commission will now be auto-split to this account on every referred payment. The bonus-tier 10% still needs manual payout as before.</p>`,
      }).catch((err) => console.error("[partner payout] admin email failed", err));
    }

    return { ok: true };
  } catch (err) {
    console.error("[partner payout] save failed", err);
    return { ok: false, error: "Could not set up automatic payouts. Please try again." };
  }
}
