/*
  Warnings:

  - Made the column `preco_custo` on table `itenscompra` required. This step will fail if there are existing NULL values in that column.

*/
-- Preenche os NULLs antes de tornar obrigatório
UPDATE "itenscompra" SET "preco_custo" = 0 WHERE "preco_custo" IS NULL;

-- AlterTable
ALTER TABLE "itenscompra" ALTER COLUMN "preco_custo" SET NOT NULL;
