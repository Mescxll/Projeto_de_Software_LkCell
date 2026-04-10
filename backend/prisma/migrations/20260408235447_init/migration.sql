-- CreateTable
CREATE TABLE "Cliente" (
    "id_cliente" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipo_cliente" TEXT NOT NULL,
    "logadouro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "bairro" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Telefone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    CONSTRAINT "Telefone_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PessoaFisica" (
    "cpf" TEXT NOT NULL PRIMARY KEY,
    "clienteId" INTEGER NOT NULL,
    CONSTRAINT "PessoaFisica_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PessoaJuridica" (
    "cnpj" TEXT NOT NULL PRIMARY KEY,
    "razao_social" TEXT NOT NULL,
    "nome_fantasia" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    CONSTRAINT "PessoaJuridica_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PessoaFisica_clienteId_key" ON "PessoaFisica"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "PessoaJuridica_clienteId_key" ON "PessoaJuridica"("clienteId");
