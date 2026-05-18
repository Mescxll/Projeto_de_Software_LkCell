/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `fornecedor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cnpj]` on the table `fornecedor` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nome` on table `cliente` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `cnpj` to the `fornecedor` table without a default value. This is not possible if the table is not empty.
  - The required column `uuid` was added to the `fornecedor` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `razao_social` on table `fornecedor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `politica_preco` on table `fornecedor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status_pagamento` on table `venda` required. This step will fail if there are existing NULL values in that column.
  - Made the column `data_hora` on table `venda` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fk_cliente_id_cliente` on table `venda` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fk_funcionario_id_funcionario` on table `venda` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "cliente" ALTER COLUMN "nome" SET NOT NULL;

-- AlterTable
ALTER TABLE "fornecedor" ADD COLUMN     "cnpj" VARCHAR(14) NOT NULL,
ADD COLUMN     "prazo_entrega" INTEGER,
ADD COLUMN     "uuid" UUID NOT NULL,
ALTER COLUMN "razao_social" SET NOT NULL,
ALTER COLUMN "politica_preco" SET NOT NULL;

-- AlterTable
ALTER TABLE "venda" ALTER COLUMN "status_pagamento" SET NOT NULL,
ALTER COLUMN "data_hora" SET NOT NULL,
ALTER COLUMN "fk_cliente_id_cliente" SET NOT NULL,
ALTER COLUMN "fk_funcionario_id_funcionario" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "fornecedor_uuid_key" ON "fornecedor"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedor_cnpj_key" ON "fornecedor"("cnpj");
