-- Receipt and invoice numbers plus unguessable tokens for the QR codes.
-- Existing payments and bookings are numbered oldest first and given a
-- token here, so past payments get working receipts and QR codes too.

-- BookingPayment: receiptNumber
CREATE SEQUENCE "BookingPayment_receiptNumber_seq";
ALTER TABLE "BookingPayment" ADD COLUMN "receiptNumber" INTEGER;
UPDATE "BookingPayment" AS p
SET "receiptNumber" = s.rn
FROM (SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS rn FROM "BookingPayment") AS s
WHERE p."id" = s."id";
SELECT setval('"BookingPayment_receiptNumber_seq"', COALESCE((SELECT MAX("receiptNumber") FROM "BookingPayment"), 0) + 1, false);
ALTER TABLE "BookingPayment" ALTER COLUMN "receiptNumber" SET DEFAULT nextval('"BookingPayment_receiptNumber_seq"');
ALTER TABLE "BookingPayment" ALTER COLUMN "receiptNumber" SET NOT NULL;
ALTER SEQUENCE "BookingPayment_receiptNumber_seq" OWNED BY "BookingPayment"."receiptNumber";

-- BookingPayment: receiptToken (a volatile default is evaluated per row, so every existing row gets its own)
ALTER TABLE "BookingPayment" ADD COLUMN "receiptToken" TEXT NOT NULL DEFAULT (replace((gen_random_uuid())::text, '-'::text, ''::text) || replace((gen_random_uuid())::text, '-'::text, ''::text));

-- Booking: invoiceNumber
CREATE SEQUENCE "Booking_invoiceNumber_seq";
ALTER TABLE "Booking" ADD COLUMN "invoiceNumber" INTEGER;
UPDATE "Booking" AS b
SET "invoiceNumber" = s.rn
FROM (SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS rn FROM "Booking") AS s
WHERE b."id" = s."id";
SELECT setval('"Booking_invoiceNumber_seq"', COALESCE((SELECT MAX("invoiceNumber") FROM "Booking"), 0) + 1, false);
ALTER TABLE "Booking" ALTER COLUMN "invoiceNumber" SET DEFAULT nextval('"Booking_invoiceNumber_seq"');
ALTER TABLE "Booking" ALTER COLUMN "invoiceNumber" SET NOT NULL;
ALTER SEQUENCE "Booking_invoiceNumber_seq" OWNED BY "Booking"."invoiceNumber";

-- Booking: invoiceToken
ALTER TABLE "Booking" ADD COLUMN "invoiceToken" TEXT NOT NULL DEFAULT (replace((gen_random_uuid())::text, '-'::text, ''::text) || replace((gen_random_uuid())::text, '-'::text, ''::text));

-- CreateIndex
CREATE UNIQUE INDEX "BookingPayment_receiptNumber_key" ON "BookingPayment"("receiptNumber");
CREATE UNIQUE INDEX "BookingPayment_receiptToken_key" ON "BookingPayment"("receiptToken");
CREATE UNIQUE INDEX "Booking_invoiceNumber_key" ON "Booking"("invoiceNumber");
CREATE UNIQUE INDEX "Booking_invoiceToken_key" ON "Booking"("invoiceToken");
