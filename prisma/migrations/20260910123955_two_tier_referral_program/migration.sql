-- AlterTable
ALTER TABLE "ReferralCommission" ADD COLUMN     "autoSettlesAt" TIMESTAMP(3),
ADD COLUMN     "isOverridePortion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recipientPartnerId" TEXT;

-- AlterTable
ALTER TABLE "ReferralPartner" ADD COLUMN     "paystackSplitCode" TEXT,
ADD COLUMN     "recruitedByPartnerId" TEXT;

-- CreateTable
CREATE TABLE "ReferralProgramSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "partnerCapacity" INTEGER NOT NULL DEFAULT 100,
    "multiLevelReferralsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "ReferralProgramSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReferralCommission_recipientPartnerId_idx" ON "ReferralCommission"("recipientPartnerId");

-- CreateIndex
CREATE INDEX "ReferralCommission_paidOut_autoSettlesAt_idx" ON "ReferralCommission"("paidOut", "autoSettlesAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralPartner_paystackSplitCode_key" ON "ReferralPartner"("paystackSplitCode");

-- CreateIndex
CREATE INDEX "ReferralPartner_recruitedByPartnerId_idx" ON "ReferralPartner"("recruitedByPartnerId");

-- AddForeignKey
ALTER TABLE "ReferralPartner" ADD CONSTRAINT "ReferralPartner_recruitedByPartnerId_fkey" FOREIGN KEY ("recruitedByPartnerId") REFERENCES "ReferralPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCommission" ADD CONSTRAINT "ReferralCommission_recipientPartnerId_fkey" FOREIGN KEY ("recipientPartnerId") REFERENCES "ReferralPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

