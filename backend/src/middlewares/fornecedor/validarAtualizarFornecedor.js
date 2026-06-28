// Validar Atualizar Fornecedor
const validarAtualizarFornecedor = (req, res, next) => {
  const { uuid } = req.params;
  const {
    email,
    politica_preco,
    prazo_entrega,
    telefones,
    telefone,
    telefone_secundario,
  } = req.body;

  if (!uuid) {
    return res.status(400).json({ erro: "O UUID do fornecedor é obrigatório na URL." });
  }

  if (
    email === undefined &&
    politica_preco === undefined &&
    prazo_entrega === undefined &&
    telefones === undefined &&
    telefone === undefined &&
    telefone_secundario === undefined
  ) {
    return res.status(400).json({ erro: "Nenhum dado válido foi enviado para atualização." });
  }

  if (telefones !== undefined && !Array.isArray(telefones)) {
    return res.status(400).json({ erro: "O campo telefones deve ser enviado como uma lista (Array)." });
  }

  next();
};

module.exports = validarAtualizarFornecedor;