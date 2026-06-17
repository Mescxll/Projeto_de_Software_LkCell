-- DropForeignKey
ALTER TABLE "itensvenda" DROP CONSTRAINT "itensvenda_fk_localizacao_id_fkey";

-- AddForeignKey
ALTER TABLE "itensvenda" ADD CONSTRAINT "itensvenda_fk_localizacao_id_fkey" FOREIGN KEY ("fk_localizacao_id") REFERENCES "localizacao"("id_localizacao") ON DELETE RESTRICT ON UPDATE CASCADE;
