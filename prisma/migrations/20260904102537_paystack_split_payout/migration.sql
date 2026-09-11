-- DropIndex
DROP INDEX "ReferralCommission_bookingPaymentId_key";

-- AlterTable
ALTER TABLE "ReferralCommission" ADD COLUMN     "isBonusPortion" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ReferralPartner" ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankCode" TEXT,
ADD COLUMN     "paystackSubaccountCode" TEXT,
ADD COLUMN     "subaccountSetupAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ReferralCommission_bookingPaymentId_idx" ON "ReferralCommission"("bookingPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralPartner_paystackSubaccountCode_key" ON "ReferralPartner"("paystackSubaccountCode");

