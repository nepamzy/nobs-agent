-- WhatsApp AI automation tables. The models were added to schema.prisma
-- (commit 9bc63c6) without a migration, so production never got them.
-- Written idempotently (IF NOT EXISTS / guarded constraint) in case the
-- tables were already created by hand with `prisma db push` — a plain
-- CREATE TABLE would then fail `prisma migrate deploy` and block the build.

-- CreateTable
CREATE TABLE IF NOT EXISTS "WhatsAppContact" (
    "id" TEXT NOT NULL,
    "waId" TEXT NOT NULL,
    "profileName" TEXT,
    "needsHuman" BOOLEAN NOT NULL DEFAULT false,
    "handoffReason" TEXT,
    "handoffNotifiedAt" TIMESTAMP(3),
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "WhatsAppMessage" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppMessage_pkey" PRIMARY KEY ("id")
);

-- New column (duplicate-delivery guard); separate so it also lands on a
-- hand-created table that predates it.
ALTER TABLE "WhatsAppMessage" ADD COLUMN IF NOT EXISTS "waMessageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WhatsAppContact_waId_key" ON "WhatsAppContact"("waId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WhatsAppContact_needsHuman_idx" ON "WhatsAppContact"("needsHuman");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WhatsAppMessage_waMessageId_key" ON "WhatsAppMessage"("waMessageId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WhatsAppMessage_contactId_createdAt_idx" ON "WhatsAppMessage"("contactId", "createdAt");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WhatsAppMessage_contactId_fkey') THEN
    ALTER TABLE "WhatsAppMessage" ADD CONSTRAINT "WhatsAppMessage_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "WhatsAppContact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
