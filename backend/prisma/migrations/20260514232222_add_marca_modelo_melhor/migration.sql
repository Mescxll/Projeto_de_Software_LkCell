/*
  Warnings:

  - You are about to drop the column `fk_marca_id` on the `produto` table. All the data in the column will be lost.
  - Added the required column `fk_marca_id` to the `modelo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "produto" DROP CONSTRAINT "produto_fk_marca_id_fkey";

-- DropIndex
DROP INDEX "modelo_nome_key";

-- AlterTable
ALTER TABLE "marca" ALTER COLUMN "nome" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "modelo" ADD COLUMN     "fk_marca_id" INTEGER NOT NULL,
ALTER COLUMN "nome" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "produto" DROP COLUMN "fk_marca_id";

-- AddForeignKey
ALTER TABLE "modelo" ADD CONSTRAINT "modelo_fk_marca_id_fkey" FOREIGN KEY ("fk_marca_id") REFERENCES "marca"("id_marca") ON DELETE RESTRICT ON UPDATE CASCADE;
