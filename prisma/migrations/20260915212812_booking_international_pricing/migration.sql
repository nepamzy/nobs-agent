-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "internationalAgreedAmount" INTEGER,
ADD COLUMN     "internationalAmountPaid" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "internationalDepositAmount" INTEGER;
