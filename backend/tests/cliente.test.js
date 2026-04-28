const request = require('supertest');
const app = require('../index');

describe('Testes Integrados de Clientes', () => {
    // Teste de listagem
    it('Deve retornar a lista de clientes com status 200', async () => {
        const response = await request(app).get('/api/clientes');

        expect(response.status).toBe(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    // Teste de buscar um cliente que não existe
    it('Deve retornar 404 ao buscar um documento inexistente', async () => {
        const docInexistente = '00000000000';
        const response = await request(app).get(`/api/clientes/${docInexistente}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('erro');
    });
});