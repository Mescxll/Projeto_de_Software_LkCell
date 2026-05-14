/*
  Warnings:

  - Added the required column `fk_categoria_id` to the `produto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preco_venda` to the `produto` table without a default value. This is not possible if the table is not empty.
  - Made the column `descricao` on table `produto` required. This step will fail if there are existing NULL values in that column.
  - Made the column `codigo_produto` on table `produto` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "produto" ADD COLUMN     "estoque_atual" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "estoque_ideal" INTEGER,
ADD COLUMN     "estoque_minimo" INTEGER,
ADD COLUMN     "fk_categoria_id" INTEGER NOT NULL,
ADD COLUMN     "fk_marca_id" INTEGER,
ADD COLUMN     "fk_modelo_id" INTEGER,
ADD COLUMN     "preco_venda" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "descricao" SET NOT NULL,
ALTER COLUMN "codigo_produto" SET NOT NULL;

-- CreateTable
CREATE TABLE "categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "marca" (
    "id_marca" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,

    CONSTRAINT "marca_pkey" PRIMARY KEY ("id_marca")
);

-- CreateTable
CREATE TABLE "modelo" (
    "id_modelo" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,

    CONSTRAINT "modelo_pkey" PRIMARY KEY ("id_modelo")
);

-- CreateIndex
CREATE UNIQUE INDEX "categoria_nome_key" ON "categoria"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "marca_nome_key" ON "marca"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "modelo_nome_key" ON "modelo"("nome");

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_fk_categoria_id_fkey" FOREIGN KEY ("fk_categoria_id") REFERENCES "categoria"("id_categoria") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_fk_marca_id_fkey" FOREIGN KEY ("fk_marca_id") REFERENCES "marca"("id_marca") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_fk_modelo_id_fkey" FOREIGN KEY ("fk_modelo_id") REFERENCES "modelo"("id_modelo") ON DELETE SET NULL ON UPDATE NO ACTION;
