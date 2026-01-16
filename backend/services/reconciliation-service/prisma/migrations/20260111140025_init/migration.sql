-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('BANK', 'GATEWAY', 'APP');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');

-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('INCOMPLETE', 'MATCHED', 'AMOUNT_MISMATCH', 'STATUS_MISMATCH', 'TIMEOUT_MISSING');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "TransactionRaw" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "source" "TransactionSource" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "eventTimestamp" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionRaw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionState" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "receivedSources" TEXT[],
    "state" "ReconciliationStatus" NOT NULL,

    CONSTRAINT "TransactionState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationResult" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "reconciliationStatus" "ReconciliationStatus" NOT NULL,
    "details" TEXT,
    "reconciledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReconciliationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "reconciliationId" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransactionRaw_transactionId_idx" ON "TransactionRaw"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionRaw_transactionId_source_key" ON "TransactionRaw"("transactionId", "source");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionState_transactionId_key" ON "TransactionState"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "ReconciliationResult_transactionId_key" ON "ReconciliationResult"("transactionId");

-- CreateIndex
CREATE INDEX "Alert_transactionId_idx" ON "Alert"("transactionId");

-- AddForeignKey
ALTER TABLE "ReconciliationResult" ADD CONSTRAINT "ReconciliationResult_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "TransactionState"("transactionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_reconciliationId_fkey" FOREIGN KEY ("reconciliationId") REFERENCES "ReconciliationResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
