/*
  Warnings:

  - Made the column `nome` on table `funcionario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `data_aniversario` on table `funcionario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "funcionario" ALTER COLUMN "nome" SET NOT NULL,
ALTER COLUMN "data_aniversario" SET NOT NULL;
