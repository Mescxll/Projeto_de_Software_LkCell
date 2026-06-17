-- Adiciona coluna fk_localizacao_id em itenscompra
ALTER TABLE "itenscompra" ADD COLUMN "fk_localizacao_id" INTEGER;

-- Preenche registros existentes com a primeira localização disponível
UPDATE "itenscompra" SET "fk_localizacao_id" = (SELECT id_localizacao FROM localizacao ORDER BY id_localizacao LIMIT 1) WHERE "fk_localizacao_id" IS NULL;

-- Torna obrigatório
ALTER TABLE "itenscompra" ALTER COLUMN "fk_localizacao_id" SET NOT NULL;

-- Recria PK de itenscompra
ALTER TABLE "itenscompra" DROP CONSTRAINT "itenscompra_pkey";
ALTER TABLE "itenscompra" ADD PRIMARY KEY ("fk_produto_id_produto", "fk_compra_id_compra", "fk_localizacao_id");

-- FK de itenscompra para localizacao
ALTER TABLE "itenscompra" ADD CONSTRAINT "itenscompra_fk_localizacao_id_fkey" FOREIGN KEY ("fk_localizacao_id") REFERENCES "localizacao"("id_localizacao") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- Adiciona coluna fk_localizacao_id em itensvenda
ALTER TABLE "itensvenda" ADD COLUMN "fk_localizacao_id" INTEGER;

-- Preenche registros existentes com a primeira localização disponível
UPDATE "itensvenda" SET "fk_localizacao_id" = (SELECT id_localizacao FROM localizacao ORDER BY id_localizacao LIMIT 1) WHERE "fk_localizacao_id" IS NULL;

-- Torna obrigatório
ALTER TABLE "itensvenda" ALTER COLUMN "fk_localizacao_id" SET NOT NULL;

-- Recria PK de itensvenda
ALTER TABLE "itensvenda" DROP CONSTRAINT "itensvenda_pkey";
ALTER TABLE "itensvenda" ADD PRIMARY KEY ("fk_produto_id_produto", "fk_venda_id_venda", "fk_localizacao_id");

-- FK de itensvenda para localizacao
ALTER TABLE "itensvenda" ADD CONSTRAINT "itensvenda_fk_localizacao_id_fkey" FOREIGN KEY ("fk_localizacao_id") REFERENCES "localizacao"("id_localizacao") ON DELETE RESTRICT ON UPDATE NO ACTION;