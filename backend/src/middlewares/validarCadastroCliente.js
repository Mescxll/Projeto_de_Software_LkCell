const validarCadastroCliente = (req, res, next) => {
    const { tipoPessoa, nome, email, documento } = req.body;

    if (!tipoPessoa || !nome || !email || !documento) {
        return res.status(400).json({ 
            erro: 'Campos obrigatórios faltando: tipoPessoa, nome, email e/ou documento.' 
        });
    }

    if (tipoPessoa !== 'FISICA' && tipoPessoa !== 'JURIDICA') {
        return res.status(400).json({ 
            erro: 'O tipoPessoa deve ser FISICA ou JURIDICA.' 
        });
    }

    next(); 
};

module.exports = validarCadastroCliente;