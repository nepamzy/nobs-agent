-- CreateTable
CREATE TABLE "ReferralPartnerWaitlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "refCode" TEXT,
    "promotedAt" TIMESTAMP(3),
    "promotedPartnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralPartnerWaitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferralPartnerWaitlist_email_key" ON "ReferralPartnerWaitlist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralPartnerWaitlist_promotedPartnerId_key" ON "ReferralPartnerWaitlist"("promotedPartnerId");

-- CreateIndex
CREATE INDEX "ReferralPartnerWaitlist_promotedAt_createdAt_idx" ON "ReferralPartnerWaitlist"("promotedAt", "createdAt");
