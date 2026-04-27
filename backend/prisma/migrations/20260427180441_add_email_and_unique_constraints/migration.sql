/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `cliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telefone_cliente]` on the table `telefone_cliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telefone_fornecedor]` on the table `telefone_fornecedor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "cliente" ADD COLUMN     "email" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "cliente_email_key" ON "cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "telefone_cliente_telefone_cliente_key" ON "telefone_cliente"("telefone_cliente");

-- CreateIndex
CREATE UNIQUE INDEX "telefone_fornecedor_telefone_fornecedor_key" ON "telefone_fornecedor"("telefone_fornecedor");
