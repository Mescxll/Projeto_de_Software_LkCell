const validarCadastroCliente = (req, res, next) => {
    const { 
        tipo_cliente, 
        nome, 
        cpf, 
        cnpj, 
        razao_social, 
        nome_fantasia 
    } = req.body;

    if (!tipo_cliente || !nome) {
        return res.status(400).json({ 
            erro: 'Campos obrigatórios faltando: tipo_cliente e nome.' 
        });
    }

    if (tipo_cliente !== 'FISICA' && tipo_cliente !== 'JURIDICA') {
        return res.status(400).json({ 
            erro: 'O tipo_cliente deve ser FISICA ou JURIDICA.' 
        });
    }

    if (tipo_cliente === 'FISICA' && !cpf) {
        return res.status(400).json({ 
            erro: 'Para pessoa física, o campo CPF é obrigatório.' 
        });
    }

    if (tipo_cliente === 'JURIDICA' && (!cnpj || !razao_social || !nome_fantasia)) {
        return res.status(400).json({ 
            erro: 'Para pessoa jurídica, CNPJ, razao_social e nome_fantasia são obrigatórios.' 
        });
    }

    next(); 
};

module.exports = validarCadastroCliente;