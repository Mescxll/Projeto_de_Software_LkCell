/*
  Warnings:

  - You are about to drop the column `preco_compra` on the `itenscompra` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "itenscompra" DROP COLUMN "preco_compra",
ADD COLUMN     "preco_custo" DECIMAL(10,2);
