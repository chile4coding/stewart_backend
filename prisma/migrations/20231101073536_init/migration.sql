-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "short_desc" TEXT;

-- AlterTable
ALTER TABLE "Size" ALTER COLUMN "sleaves" SET DATA TYPE TEXT;
