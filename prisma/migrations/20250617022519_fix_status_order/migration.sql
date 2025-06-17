/*
  Warnings:

  - The values [CANCELED] on the enum `StatusOrder` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusOrder_new" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "StatusOrder_new" USING ("status"::text::"StatusOrder_new");
ALTER TYPE "StatusOrder" RENAME TO "StatusOrder_old";
ALTER TYPE "StatusOrder_new" RENAME TO "StatusOrder";
DROP TYPE "StatusOrder_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
