*Status: Em produção*

# Projeto de Software - LKCell 
Projeto criado para a matéria de Processo de Desenvolvimento de Software (PDS), com o objetivo de implementar o sistema anteriormente analisado, LKCell.

---

## Tecnologias utilizadas

- Node.js
- Express
- SQLite3
- CORS
- dotenv

---

### 🛠️ Configuração do Banco de Dados (Prisma)
Este projeto utiliza o Prisma como ORM (Object-Relational Mapper). Ele facilita a comunicação entre o nosso código Node.js e o banco de dados, transformando tabelas em objetos que podemos manipular com JavaScript.

#### 🚀 Passo a Passo para Colaboradores
Após dar o ```git pull```, siga estas etapas no terminal dentro da pasta backend:

1. Instalar Dependências:
    ```
    npm install
    ```
2. Configurar as Variáveis de Ambiente:
    - Crie um arquivo chamado ```.env``` na raiz da pasta backend.
    - Adicione a sua URL de conexão com o banco (Postgres/MySQL):
3. Gerar o Prisma Client:
    ```
    npx prisma generate
    ```
    - Este comando lê o arquivo schema.prisma e gera as tipagens e funções necessárias dentro da sua pasta node_modules.
4. Sincronizar o Banco de Dados:
Para garantir que o seu banco local tenha todas as tabelas (Cliente, PessoaFisica, etc.) iguais às do projeto, rode:

---

### Utilização 

Clone o repositório:

```bash
git clone https://github.com/seu-usuario/seu-repo.git
```
Acesse o diretório:

```bash
cd nome_do_diretório
```
Instale as dependências:

```bash
npm install
```