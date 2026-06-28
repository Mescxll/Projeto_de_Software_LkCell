// Validar Cadastro Fornecedor
const validarCadastrarFornecedor = (req, res, next) => {
  const {
    cnpj,
    razao_social,
    politica_preco,
    telefones,
    telefone,
    telefone_secundario,
  } = req.body;

  if (!cnpj || !razao_social || politica_preco === undefined) {
    return res.status(400).json({
      erro: "Preencha os campos obrigatórios: CNPJ, Razão Social e Política de Preço.",
    });
  }

  const cnpjLimpo = cnpj.replace(/\D/g, "");
  if (cnpjLimpo.length !== 14) {
    return res.status(400).json({
      erro: "O CNPJ precisa ter exatamente 14 dígitos válidos.",
    });
  }

  if (telefones !== undefined && !Array.isArray(telefones)) {
    return res.status(400).json({
      erro: "O campo telefones deve ser enviado como uma lista (Array).",
    });
  }

  if (telefone !== undefined && typeof telefone !== "string") {
    return res.status(400).json({
      erro: "O campo telefone deve ser uma string.",
    });
  }

  if (telefone_secundario !== undefined && typeof telefone_secundario !== "string") {
    return res.status(400).json({
      erro: "O campo telefone_secundario deve ser uma string.",
    });
  }

  next();
};

module.exports = validarCadastrarFornecedor;