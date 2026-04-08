const clientesDB = [];

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

const buscarCliente = async (req, res) => {
    try {
        const { documento } = req.params;

        const documentoLimpoURL = documento.replace(/\D/g, '');

        if (!documentoLimpoURL) {
            return res.status(400).json({
                erro: 'Documento inválido. Certifique-se de enviar apenas números.'
            });
        }
        // Substituir as linhas abaixo pela conexão com o banco
        const cliente = clientesDB.find(c => {
            const documentoLimpoDB = c.documento.replace(/\D/g, '');
            return documentoLimpoDB === documentoLimpoURL;
        });

        if (!cliente) {
            return res.status(404).json({
                erro: 'Cliente não encontrado na base de dados.'
            });
        }
        return res.status(200).json(cliente);
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }

};

module.exports = {
    cadastrarCliente,
    buscarCliente
};