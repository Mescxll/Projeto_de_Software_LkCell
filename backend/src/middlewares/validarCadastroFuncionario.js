const validarCadastroFuncionario = (req, res, next) => {
    const { nome, data_nascimento } = req.body;

    if (!nome || !data_nascimento) {
        return res.status(400).json({ 
            erro: 'Campos obrigatórios faltando: nome e data_nascimento.' 
        });
    }

    if (typeof nome !== 'string' || nome.trim().length === 0) {
        return res.status(400).json({ 
            erro: 'Nome deve ser uma string não vazia.' 
        });
    }

    // Validar formato de data (YYYY-MM-DD)
    const regexData = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexData.test(data_nascimento)) {
        return res.status(400).json({ 
            erro: 'Data de nascimento deve estar no formato YYYY-MM-DD.' 
        });
    }

    // Validar se é uma data válida
    const data = new Date(data_nascimento);
    if (isNaN(data.getTime())) {
        return res.status(400).json({ 
            erro: 'Data de nascimento inválida.' 
        });
    }

    next(); 
};

module.exports = validarCadastroFuncionario;
