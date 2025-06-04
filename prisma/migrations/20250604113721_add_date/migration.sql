/*
  Warnings:

  - Added the required column `dateOrder` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hourOrder` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "dateOrder" TEXT NOT NULL,
ADD COLUMN     "hourOrder" TEXT NOT NULL;
