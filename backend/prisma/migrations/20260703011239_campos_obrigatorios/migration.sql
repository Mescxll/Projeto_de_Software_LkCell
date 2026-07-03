/*
  Warnings:

  - Made the column `fk_localizacao_id` on table `estoque` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quantidade` on table `itenscompra` required. This step will fail if there are existing NULL values in that column.
  - Made the column `preco_unitario` on table `itensvenda` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quantidade_vendida` on table `itensvenda` required. This step will fail if there are existing NULL values in that column.
  - Made the column `preco_compra` on table `produto` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "estoque" DROP CONSTRAINT "estoque_fk_localizacao_id_fkey";

-- AlterTable
ALTER TABLE "estoque" ALTER COLUMN "fk_localizacao_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "itenscompra" ALTER COLUMN "quantidade" SET NOT NULL;

-- AlterTable
ALTER TABLE "itensvenda" ALTER COLUMN "preco_unitario" SET NOT NULL,
ALTER COLUMN "quantidade_vendida" SET NOT NULL;

-- AlterTable
ALTER TABLE "produto" ALTER COLUMN "preco_compra" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "estoque" ADD CONSTRAINT "estoque_fk_localizacao_id_fkey" FOREIGN KEY ("fk_localizacao_id") REFERENCES "localizacao"("id_localizacao") ON DELETE RESTRICT ON UPDATE NO ACTION;
