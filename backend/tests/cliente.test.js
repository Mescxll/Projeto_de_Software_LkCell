const request = require('supertest');
const app = require('../index');

describe('Testes Integrados de Clientes', () => {
    // Listagem de clientes - Cliente
    it('Deve retornar a lista de clientes com status 200', async () => {
        const response = await request(app).get('/api/clientes');

        expect(response.status).toBe(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    // Buscar um cliente que não existe - Cliente
    it('Deve retornar 404 ao buscar um documento inexistente', async () => {
        const docInexistente = '00000000000';
        const response = await request(app).get(`/api/clientes/${docInexistente}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('erro');
    });

    // Inserção dubplicada - Cliente
    it('Deve retornar 409 ao tentar cadastrar um CPF que já existe', async () => {
        const clienteDuplicado = {
            nome: "Fulano Repetido",
            tipo_cliente: "FISICA",
            cpf: "90909090909",
            telefone: "71988887777",
            email: "duplicado@teste.com"
        };

        const response = await request(app)
            .post('/api/clientes')
            .send(clienteDuplicado);

        expect(response.status).toBe(409);
        expect(response.body.erro).toBe("Atenção: O Email, Telefone ou Documento que você tentou usar já está cadastrado no sistema.");
    });

       // Validação de Data - Funcionário
    it('Deve retornar 400 se a data de nascimento do funcionário for inválida', async () => {
        const funcionarioInvalido = {
            nome: "João Silva",
            cpf: "00011122233",
            data_nascimento: "10/05/1990",
            cargo: "Técnico",
            salario: 3000
        };

        const response = await request(app)
            .post('/api/funcionarios')
            .send(funcionarioInvalido);

        expect(response.status).toBe(400);
        expect(response.body.erro).toBe("Data de nascimento deve estar no formato YYYY-MM-DD.");
    });
});