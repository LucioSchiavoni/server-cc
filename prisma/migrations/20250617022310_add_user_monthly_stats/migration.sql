-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "maxMonthlyGrams" DOUBLE PRECISION DEFAULT 0;

-- CreateTable
CREATE TABLE "UserMonthlyStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalGrams" INTEGER NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMonthlyStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserMonthlyStats_year_month_idx" ON "UserMonthlyStats"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "UserMonthlyStats_userId_year_month_key" ON "UserMonthlyStats"("userId", "year", "month");

-- AddForeignKey
ALTER TABLE "UserMonthlyStats" ADD CONSTRAINT "UserMonthlyStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
