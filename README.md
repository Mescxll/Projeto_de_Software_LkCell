*Status: Em produção*
*Sprint 1 concluída*
*Sprint 2 concluída*

# Projeto de Software - LKCell 
Projeto criado para a matéria de Processo de Desenvolvimento de Software (PDS), com o objetivo de implementar o sistema anteriormente analisado, LKCell. 

## Tecnologias utilizadas

- Node.js
- PostgreSQL
- Next.js
- React
- Prisma
- CORS
- Tailwind CSS
- Supabase

## Backend
1. Acesse o diretório:

```bash
cd backend
```
2. Instale as dependências:

```bash
npm install
```

3. Gere o cliente para o seu sistema reconhecer as tabelas:

```bash
npx prisma generate
```
> O banco de dados utilizado é o Supabase (PostgreSQL). O arquivo .env já está no projeto, não precisa configurar o acesso ao banco. O arquivo .env foi mantido no proejto para faciliar o acesso ao banco e configuração do projeto

4. Inicie o servidor backend:

```bash
npm run dev
```

## Frontend
1. Abra um novo terminal para o frontend:

```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Execute:
```bash
npm run dev
```
