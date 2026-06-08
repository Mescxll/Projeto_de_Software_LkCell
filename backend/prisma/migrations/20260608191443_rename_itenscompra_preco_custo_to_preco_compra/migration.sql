/*
  Warnings:

  - You are about to drop the column `preco_custo` on the `itenscompra` table. All the data in the column will be lost.
  - Added the required column `preco_compra` to the `itenscompra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "itenscompra" DROP COLUMN "preco_custo",
ADD COLUMN     "preco_compra" DECIMAL(10,2) NOT NULL;
