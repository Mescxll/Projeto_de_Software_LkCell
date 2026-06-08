/*
  Warnings:

  - Made the column `data_hora` on table `compra` required. This step will fail if there are existing NULL values in that column.
  - Made the column `valor_total` on table `compra` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fk_fornecedor_id_fornecedor` on table `compra` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "compra" ALTER COLUMN "data_hora" SET NOT NULL,
ALTER COLUMN "data_hora" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "valor_total" SET NOT NULL,
ALTER COLUMN "fk_fornecedor_id_fornecedor" SET NOT NULL;
