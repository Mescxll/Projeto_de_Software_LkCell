*Status: Em produção*

# Projeto de Software - LKCell 
Projeto criado para a matéria de Processo de Desenvolvimento de Software (PDS), com o objetivo de implementar o sistema anteriormente analisado, LKCell.

## Tecnologias utilizadas

- Node.js
- Express
- CORS
- dotenv
- Prisma ORM
- Supabase (PostgreSQL)

### Utilização 

Clone o repositório:

```bash
git clone https://github.com/Mescxll/Projeto_de_Software_LkCell.git
```

## Backend
Acesse o diretório:

```bash
cd backend
```
Instale as dependências:

```bash
npm install
```

### Configurando o .env:
Atenção: Use a porta 6543 para pooling (DATABASE_URL) e 5432 para conexão direta (DIRECT_URL).
```
DATABASE_URL="postgresql://postgres:[SUA_SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[SUA_SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```
**Sincronizando o Prisma**
Com o `.env` configurado, gere o cliente para o seu sistema reconhecer as tabelas:

```bash
npx prisma generate
```

Instale o Driver Adapter:

```bash
npm install @prisma/adapter-pg pg
```

Inicie o servidor backend:

```bash
node --watch index.js
```

## Frontend
Abra um novo terminal para o frontend:

```bash
cd frontend
```

Instale as dependências:
```bash
npm install
```

Execute:
```bash
npm run dev
```
