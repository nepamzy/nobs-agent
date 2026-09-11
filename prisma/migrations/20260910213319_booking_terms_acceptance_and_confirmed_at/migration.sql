-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "termsAcceptedIp" TEXT,
ADD COLUMN     "confirmedAt" TIMESTAMP(3);
