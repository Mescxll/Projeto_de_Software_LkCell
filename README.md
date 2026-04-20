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
Para o banco de dados funcionar, é necessário conectar o projeto ao Supabase.

Crie um arquivo chamado  `.env` na raiz da pasta backend.

Adicione a sua Connection String do Supabase (utilizando a porta direta VIP 5432 exigida pelo Prisma 7):

```
DATABASE_URL="postgresql://postgres:[SUA_SENHA_AQUI]@aws-0-us-east-1.pooler.supabase.
```

Com o `.env` configurado, atualize o banco de dados na nuvem e gere o Prisma Client executando:

```
npx prisma db pull
npx prisma generate
npx prisma migrate dev --name init
```

Instale o Driver Adapter:

```
npm install @prisma/adapter-pg pg

```

Inicie o servidor backend:

```
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
