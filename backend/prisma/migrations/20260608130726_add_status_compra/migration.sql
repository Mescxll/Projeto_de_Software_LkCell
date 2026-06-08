-- CreateEnum
CREATE TYPE "status_compra_enum" AS ENUM ('EFETUADA', 'CANCELADA');

-- AlterTable
ALTER TABLE "compra" ADD COLUMN     "status_compra" "status_compra_enum" NOT NULL DEFAULT 'EFETUADA',
ALTER COLUMN "valor_total" DROP NOT NULL;
