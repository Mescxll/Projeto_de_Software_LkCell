-- AlterTable
ALTER TABLE "estoque" ADD COLUMN     "fk_localizacao_id" INTEGER;

-- CreateTable
CREATE TABLE "localizacao" (
    "id_localizacao" SERIAL NOT NULL,
    "localizacao" VARCHAR(100) NOT NULL,

    CONSTRAINT "localizacao_pkey" PRIMARY KEY ("id_localizacao")
);

-- AddForeignKey
ALTER TABLE "estoque" ADD CONSTRAINT "estoque_fk_localizacao_id_fkey" FOREIGN KEY ("fk_localizacao_id") REFERENCES "localizacao"("id_localizacao") ON DELETE SET NULL ON UPDATE NO ACTION;
