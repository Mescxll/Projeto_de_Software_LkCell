/*
  Warnings:

  - A unique constraint covering the columns `[nome,data_aniversario]` on the table `funcionario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nome,fk_marca_id]` on the table `modelo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "funcionario_nome_data_aniversario_key" ON "funcionario"("nome", "data_aniversario");

-- CreateIndex
CREATE UNIQUE INDEX "modelo_nome_fk_marca_id_key" ON "modelo"("nome", "fk_marca_id");
