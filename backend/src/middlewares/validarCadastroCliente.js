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
            erro: 'Campos obrigatórios faltando: Tipo de Cliente e Nome.' 
        });
    }

    if (tipo_cliente !== 'FISICA' && tipo_cliente !== 'JURIDICA') {
        return res.status(400).json({ 
            erro: 'O Tipo de Cliente deve ser Pessoa Física ou Jurídica.' 
        });
    }

    if (tipo_cliente === 'FISICA' && !cpf) {
        return res.status(400).json({ 
            erro: 'Para pessoa física, o campo CPF é obrigatório.' 
        });
    }

    if (tipo_cliente === 'JURIDICA' && (!cnpj || !razao_social)) {
        return res.status(400).json({ 
            erro: 'Para pessoa jurídica, CNPJ, Razão Social são obrigatórios.' 
        });
    }

    next(); 
};

module.exports = validarCadastroCliente;