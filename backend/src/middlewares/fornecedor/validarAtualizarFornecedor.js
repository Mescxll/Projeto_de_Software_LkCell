// Validar Atualizar Fornecedor
const validarAtualizarFornecedor = (req, res, next) => {
  const { uuid } = req.params;
  const { email, politica_preco, prazo_entrega, telefones } = req.body;

  // Trava da URL
  if (!uuid) {
    return res.status(400).json({ erro: "O UUID do fornecedor é obrigatório na URL." });
  }

  // Trava dos valores vazios
  if (email === undefined && politica_preco === undefined && prazo_entrega === undefined && telefones === undefined) {
    return res.status(400).json({ erro: "Nenhum dado válido foi enviado para atualização." });
  }

  // Trava de tipagem do Telefone
  if (telefones !== undefined && !Array.isArray(telefones)) {
    return res.status(400).json({ erro: "O campo telefones deve ser enviado como uma lista (Array)." });
  }

  // Libera a catraca pro Controller!
  next();
};

module.exports = validarAtualizarFornecedor;
