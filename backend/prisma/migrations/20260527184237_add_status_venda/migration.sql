-- CreateEnum
CREATE TYPE "status_venda_enum" AS ENUM ('ATIVA', 'EFETUADA', 'CANCELADA');

-- DropForeignKey
ALTER TABLE "venda" DROP CONSTRAINT "fk_venda_2";

-- AlterTable
ALTER TABLE "estoque" ALTER COLUMN "estoque_atual" DROP DEFAULT;

-- AlterTable
ALTER TABLE "venda" ADD COLUMN     "status_venda" "status_venda_enum" NOT NULL DEFAULT 'ATIVA',
ALTER COLUMN "fk_cliente_id_cliente" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "venda" ADD CONSTRAINT "fk_venda_2" FOREIGN KEY ("fk_cliente_id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE SET NULL ON UPDATE NO ACTION;
