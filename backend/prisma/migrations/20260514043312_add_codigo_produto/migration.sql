/*
  Warnings:

  - A unique constraint covering the columns `[codigo_produto]` on the table `produto` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "produto" ADD COLUMN     "codigo_produto" VARCHAR(25);

-- CreateIndex
CREATE UNIQUE INDEX "produto_codigo_produto_key" ON "produto"("codigo_produto");
