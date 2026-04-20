-- CreateEnum
CREATE TYPE "status_pagamento_enum" AS ENUM ('PAGO', 'EM_ABERTO');

-- CreateEnum
CREATE TYPE "tipo_cliente_enum" AS ENUM ('FISICO', 'JURIDICO');

-- CreateTable
CREATE TABLE "cliente" (
    "id_cliente" SERIAL NOT NULL,
    "nome" VARCHAR(100),
    "tipo_cliente" "tipo_cliente_enum",
    "cidade" VARCHAR(50),
    "uf" CHAR(2),
    "numero" INTEGER,
    "cep" VARCHAR(10),
    "bairro" VARCHAR(50),
    "logradouro" VARCHAR(100),

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "compra" (
    "id_compra" SERIAL NOT NULL,
    "data_hora" TIMESTAMP(6),
    "valor_total" DECIMAL(10,2),
    "prazo_entrega" DATE,
    "fk_fornecedor_id_fornecedor" INTEGER,

    CONSTRAINT "compra_pkey" PRIMARY KEY ("id_compra")
);

-- CreateTable
CREATE TABLE "fornecedor" (
    "id_fornecedor" SERIAL NOT NULL,
    "razao_social" VARCHAR(100),
    "email" VARCHAR(50),
    "politica_preco" DECIMAL(10,2),

    CONSTRAINT "fornecedor_pkey" PRIMARY KEY ("id_fornecedor")
);

-- CreateTable
CREATE TABLE "funcionario" (
    "id_funcionario" SERIAL NOT NULL,
    "nome" VARCHAR(100),
    "data_aniversario" DATE,

    CONSTRAINT "funcionario_pkey" PRIMARY KEY ("id_funcionario")
);

-- CreateTable
CREATE TABLE "itenscompra" (
    "fk_produto_id_produto" INTEGER NOT NULL,
    "fk_compra_id_compra" INTEGER NOT NULL,
    "quantidade" INTEGER,
    "preco_compra" DECIMAL(10,2),

    CONSTRAINT "itenscompra_pkey" PRIMARY KEY ("fk_produto_id_produto","fk_compra_id_compra")
);

-- CreateTable
CREATE TABLE "itensvenda" (
    "fk_produto_id_produto" INTEGER NOT NULL,
    "fk_venda_id_venda" INTEGER NOT NULL,
    "preco_unitario" DECIMAL(10,2),
    "quantidade_vendida" INTEGER,

    CONSTRAINT "itensvenda_pkey" PRIMARY KEY ("fk_produto_id_produto","fk_venda_id_venda")
);

-- CreateTable
CREATE TABLE "pessoafisica" (
    "cpf" VARCHAR(11) NOT NULL,
    "fk_cliente_id_cliente" INTEGER NOT NULL,

    CONSTRAINT "pessoafisica_pkey" PRIMARY KEY ("cpf")
);

-- CreateTable
CREATE TABLE "pessoajuridica" (
    "cnpj" VARCHAR(14) NOT NULL,
    "razao_social" VARCHAR(100),
    "nome_fantasia" VARCHAR(50),
    "fk_cliente_id_cliente" INTEGER NOT NULL,

    CONSTRAINT "pessoajuridica_pkey" PRIMARY KEY ("cnpj")
);

-- CreateTable
CREATE TABLE "produto" (
    "id_produto" SERIAL NOT NULL,
    "nome" VARCHAR(50),
    "descricao" VARCHAR(100),
    "preco_custo" DECIMAL(10,2),
    "preco_compra" DECIMAL(10,2),
    "margem_lucro" DECIMAL(10,2),

    CONSTRAINT "produto_pkey" PRIMARY KEY ("id_produto")
);

-- CreateTable
CREATE TABLE "telefone_cliente" (
    "telefone_cliente" VARCHAR(14) NOT NULL,
    "telefone_cliente_pk" INTEGER NOT NULL,

    CONSTRAINT "telefone_cliente_pkey" PRIMARY KEY ("telefone_cliente_pk","telefone_cliente")
);

-- CreateTable
CREATE TABLE "telefone_fornecedor" (
    "telefone_fornecedor" VARCHAR(14) NOT NULL,
    "telefone_forncecedor_pk" INTEGER NOT NULL,

    CONSTRAINT "telefone_fornecedor_pkey" PRIMARY KEY ("telefone_forncecedor_pk","telefone_fornecedor")
);

-- CreateTable
CREATE TABLE "venda" (
    "id_venda" SERIAL NOT NULL,
    "valor_total" DECIMAL(10,2),
    "status_pagamento" "status_pagamento_enum",
    "data_vencimento" DATE,
    "data_hora" TIMESTAMP(6),
    "fk_cliente_id_cliente" INTEGER,
    "fk_funcionario_id_funcionario" INTEGER,

    CONSTRAINT "venda_pkey" PRIMARY KEY ("id_venda")
);

-- CreateIndex
CREATE UNIQUE INDEX "pessoafisica_fk_cliente_id_cliente_key" ON "pessoafisica"("fk_cliente_id_cliente");

-- CreateIndex
CREATE UNIQUE INDEX "pessoajuridica_fk_cliente_id_cliente_key" ON "pessoajuridica"("fk_cliente_id_cliente");

-- AddForeignKey
ALTER TABLE "compra" ADD CONSTRAINT "fk_compra_2" FOREIGN KEY ("fk_fornecedor_id_fornecedor") REFERENCES "fornecedor"("id_fornecedor") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itenscompra" ADD CONSTRAINT "fk_itenscompra_1" FOREIGN KEY ("fk_produto_id_produto") REFERENCES "produto"("id_produto") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itenscompra" ADD CONSTRAINT "fk_itenscompra_2" FOREIGN KEY ("fk_compra_id_compra") REFERENCES "compra"("id_compra") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itensvenda" ADD CONSTRAINT "fk_itensvenda_1" FOREIGN KEY ("fk_produto_id_produto") REFERENCES "produto"("id_produto") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itensvenda" ADD CONSTRAINT "fk_itensvenda_2" FOREIGN KEY ("fk_venda_id_venda") REFERENCES "venda"("id_venda") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pessoafisica" ADD CONSTRAINT "fk_pessoafisica_2" FOREIGN KEY ("fk_cliente_id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pessoajuridica" ADD CONSTRAINT "fk_pessoajuridica_2" FOREIGN KEY ("fk_cliente_id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "telefone_cliente" ADD CONSTRAINT "fk_telefone_cliente_2" FOREIGN KEY ("telefone_cliente_pk") REFERENCES "cliente"("id_cliente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "telefone_fornecedor" ADD CONSTRAINT "fk_telefone_forncecedor_2" FOREIGN KEY ("telefone_forncecedor_pk") REFERENCES "fornecedor"("id_fornecedor") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "venda" ADD CONSTRAINT "fk_venda_2" FOREIGN KEY ("fk_cliente_id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "venda" ADD CONSTRAINT "fk_venda_3" FOREIGN KEY ("fk_funcionario_id_funcionario") REFERENCES "funcionario"("id_funcionario") ON DELETE CASCADE ON UPDATE NO ACTION;
