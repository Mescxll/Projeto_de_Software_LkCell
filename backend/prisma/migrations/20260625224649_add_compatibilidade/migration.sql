-- CreateEnum
CREATE TYPE "tipo_compatibilidade_enum" AS ENUM ('INCLUSAO', 'EXCLUSAO');

-- AlterTable
ALTER TABLE "produto" ADD COLUMN     "compativel_todas_marcas" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "produto_compatibilidade" (
    "id_compatibilidade" SERIAL NOT NULL,
    "fk_produto_id" INTEGER NOT NULL,
    "fk_marca_id" INTEGER,
    "fk_modelo_id" INTEGER,
    "tipo" "tipo_compatibilidade_enum" NOT NULL,
    "observacao" VARCHAR(200),

    CONSTRAINT "produto_compatibilidade_pkey" PRIMARY KEY ("id_compatibilidade")
);

-- AddForeignKey
ALTER TABLE "produto_compatibilidade" ADD CONSTRAINT "produto_compatibilidade_fk_produto_id_fkey" FOREIGN KEY ("fk_produto_id") REFERENCES "produto"("id_produto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto_compatibilidade" ADD CONSTRAINT "produto_compatibilidade_fk_marca_id_fkey" FOREIGN KEY ("fk_marca_id") REFERENCES "marca"("id_marca") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto_compatibilidade" ADD CONSTRAINT "produto_compatibilidade_fk_modelo_id_fkey" FOREIGN KEY ("fk_modelo_id") REFERENCES "modelo"("id_modelo") ON DELETE SET NULL ON UPDATE CASCADE;

-- Índice parcial para garantir unicidade mesmo com NULLs
-- COALESCE converte NULL em 0 para que a comparação funcione corretamente
CREATE UNIQUE INDEX produto_compatibilidade_unique
ON produto_compatibilidade (
  fk_produto_id,
  tipo,
  COALESCE(fk_marca_id, 0),
  COALESCE(fk_modelo_id, 0)
);