const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasourceUrl: "file:./dev.db"
});

const cadastrarCliente = async (req, res) => {
    try {
        const {
            tipoPessoa,
            nome,
            email,
            telefone,
            documento
        } = req.body;

        const clienteExistente = clientesDB.find(c => c.documento === documento);
        if (clienteExistente) {
            return res.status(409).json({ 
                erro: 'Já existe um cliente cadastrado com este documento (CPF/CNPJ).' 
            });
        }

        const novoCliente = {
            id: clientesDB.length + 1,
            tipoPessoa,
            nome,
            email,
            telefone: telefone || null,
            documento,
            dataCadastro: new Date()
        };

        //Substituir a linha abaixo pela conexão com o banco
        clientesDB.push(novoCliente);

        return res.status(201).json({
            mensagem: 'Cliente cadastrado com sucesso!',
            cliente: novoCliente
        });

    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

module.exports = {
    cadastrarCliente
};