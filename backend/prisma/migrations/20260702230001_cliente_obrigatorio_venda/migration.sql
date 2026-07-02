/*
  Warnings:

  - Made the column `fk_cliente_id_cliente` on table `venda` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "venda" DROP CONSTRAINT "fk_venda_2";

-- AlterTable
ALTER TABLE "venda" ALTER COLUMN "fk_cliente_id_cliente" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "venda" ADD CONSTRAINT "fk_venda_2" FOREIGN KEY ("fk_cliente_id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE NO ACTION;
