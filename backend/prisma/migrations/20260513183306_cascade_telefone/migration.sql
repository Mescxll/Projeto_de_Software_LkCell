-- DropForeignKey
ALTER TABLE "telefone_cliente" DROP CONSTRAINT "fk_telefone_cliente_2";

-- DropForeignKey
ALTER TABLE "telefone_fornecedor" DROP CONSTRAINT "fk_telefone_forncecedor_2";

-- AddForeignKey
ALTER TABLE "telefone_cliente" ADD CONSTRAINT "fk_telefone_cliente_2" FOREIGN KEY ("telefone_cliente_pk") REFERENCES "cliente"("id_cliente") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "telefone_fornecedor" ADD CONSTRAINT "fk_telefone_forncecedor_2" FOREIGN KEY ("telefone_forncecedor_pk") REFERENCES "fornecedor"("id_fornecedor") ON DELETE CASCADE ON UPDATE NO ACTION;
