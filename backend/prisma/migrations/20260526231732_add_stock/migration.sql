/*
  Warnings:

  - You are about to drop the column `estoque_atual` on the `produto` table. All the data in the column will be lost.
  - You are about to drop the column `estoque_ideal` on the `produto` table. All the data in the column will be lost.
  - You are about to drop the column `estoque_minimo` on the `produto` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "tipo_movimento_enum" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE');

-- AlterTable
ALTER TABLE "produto" DROP COLUMN "estoque_atual",
DROP COLUMN "estoque_ideal",
DROP COLUMN "estoque_minimo";

-- CreateTable
CREATE TABLE "estoque" (
    "id_estoque" SERIAL NOT NULL,
    "estoque_minimo" INTEGER,
    "estoque_ideal" INTEGER,
    "estoque_atual" INTEGER NOT NULL DEFAULT 0,
    "tipo_movimento" "tipo_movimento_enum" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "data_hora" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fk_produto_id" INTEGER NOT NULL,
    "fk_venda_id" INTEGER,
    "fk_compra_id" INTEGER,

    CONSTRAINT "estoque_pkey" PRIMARY KEY ("id_estoque")
);

-- AddForeignKey
ALTER TABLE "estoque" ADD CONSTRAINT "estoque_fk_produto_id_fkey" FOREIGN KEY ("fk_produto_id") REFERENCES "produto"("id_produto") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estoque" ADD CONSTRAINT "estoque_fk_venda_id_fkey" FOREIGN KEY ("fk_venda_id") REFERENCES "venda"("id_venda") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estoque" ADD CONSTRAINT "estoque_fk_compra_id_fkey" FOREIGN KEY ("fk_compra_id") REFERENCES "compra"("id_compra") ON DELETE SET NULL ON UPDATE NO ACTION;
