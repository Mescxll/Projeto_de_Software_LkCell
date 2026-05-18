const validarCadastroCliente = (req, res, next) => {
    const { 
        tipo_cliente, 
        nome, 
        cpf, 
        cnpj, 
        razao_social, 
        uf 
    } = req.body;

    // Obrigatórios Base
    if (!tipo_cliente || !nome) {
        return res.status(400).json({ 
            erro: 'Campos obrigatórios faltando: Tipo de Cliente e Nome.' 
        });
    }

    // Normaliza o tipo pra bater com a lógica do Controller e evitar falsos positivos
    const tipoNormalizado = tipo_cliente.toUpperCase();
    const isFisico = ["FISICA", "FISICO"].includes(tipoNormalizado);
    const isJuridico = ["JURIDICA", "JURIDICO"].includes(tipoNormalizado);

    if (!isFisico && !isJuridico) {
        return res.status(400).json({ 
            erro: 'O Tipo de Cliente deve ser Pessoa Física ou Jurídica.' 
        });
    }

    // Validações Específicas de Pessoa Física
    if (isFisico) {
        if (!cpf) {
            return res.status(400).json({ erro: 'Para pessoa física, o campo CPF é obrigatório.' });
        }
        // Tira as máscaras só pra contar se o tamanho tá certo
        const cpfLimpo = cpf.replace(/\D/g, "");
        if (cpfLimpo.length !== 11) {
            return res.status(400).json({ erro: 'O CPF precisa ter exatamente 11 dígitos numéricos.' });
        }
    }

    // Validações Específicas de Pessoa Jurídica
    if (isJuridico) {
        if (!cnpj || !razao_social) {
            return res.status(400).json({ erro: 'Para pessoa jurídica, CNPJ e Razão Social são obrigatórios.' });
        }
        const cnpjLimpo = cnpj.replace(/\D/g, "");
        if (cnpjLimpo.length !== 14) {
            return res.status(400).json({ erro: 'O CNPJ precisa ter exatamente 14 dígitos numéricos.' });
        }
    }

    // Trava o tamanho do Estado (UF) que no banco para 2 caracteres.
    if (uf && uf.length !== 2) {
        return res.status(400).json({ erro: 'A UF (Estado) deve conter exatamente 2 letras (Ex: BA, SP).' });
    }

    next(); 
};

module.exports = validarCadastroCliente;