-- CreateTable
CREATE TABLE "AssistantQuestion" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "answered" BOOLEAN NOT NULL DEFAULT true,
    "turn" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssistantQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssistantQuestion_createdAt_idx" ON "AssistantQuestion"("createdAt");
