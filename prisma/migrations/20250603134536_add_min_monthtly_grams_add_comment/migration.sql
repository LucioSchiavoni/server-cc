/*
  Warnings:

  - Added the required column `comment` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "minMonthlyGrams" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "comment" TEXT NOT NULL;
