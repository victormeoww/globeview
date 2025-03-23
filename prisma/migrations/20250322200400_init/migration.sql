-- CreateTable
CREATE TABLE "IntelligenceUpdate" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" JSONB NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceIcon" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "icon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "webhookId" INTEGER,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "IntelligenceUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastTrigger" TIMESTAMP(3),

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_IntelligenceUpdateToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_IntelligenceUpdateToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "IntelligenceUpdate_category_idx" ON "IntelligenceUpdate"("category");

-- CreateIndex
CREATE INDEX "IntelligenceUpdate_sourceType_idx" ON "IntelligenceUpdate"("sourceType");

-- CreateIndex
CREATE INDEX "IntelligenceUpdate_timestamp_idx" ON "IntelligenceUpdate"("timestamp");

-- CreateIndex
CREATE INDEX "IntelligenceUpdate_webhookId_idx" ON "IntelligenceUpdate"("webhookId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "_IntelligenceUpdateToTag_B_index" ON "_IntelligenceUpdateToTag"("B");

-- AddForeignKey
ALTER TABLE "IntelligenceUpdate" ADD CONSTRAINT "IntelligenceUpdate_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IntelligenceUpdateToTag" ADD CONSTRAINT "_IntelligenceUpdateToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "IntelligenceUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IntelligenceUpdateToTag" ADD CONSTRAINT "_IntelligenceUpdateToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
