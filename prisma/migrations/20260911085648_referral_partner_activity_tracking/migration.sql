-- AlterTable
ALTER TABLE "ReferralPartner" ADD COLUMN     "consecutiveInactiveMonths" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastActivityCheckedMonth" TEXT;
