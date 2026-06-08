// Validar Cadastro Compra
const validarCadastrarCompra = (req, res, next) => {
  const { fk_fornecedor_id_fornecedor, itens } = req.body;

  // Fornecedor obrigatório
  if (!fk_fornecedor_id_fornecedor) {
    return res.status(400).json({ erro: "Fornecedor é obrigatório." });
  }

  if (
    !Number.isInteger(Number(fk_fornecedor_id_fornecedor)) ||
    Number(fk_fornecedor_id_fornecedor) <= 0
  ) {
    return res.status(400).json({ erro: "ID do fornecedor inválido." });
  }

  // Validação dos itens
  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({
      erro: "A compra deve conter pelo menos um produto.",
    });
  }

  for (let i = 0; i < itens.length; i++) {
    const item = itens[i];

    if (!item.fk_produto_id_produto) {
      return res.status(400).json({
        erro: `Item ${i + 1}: o produto é obrigatório.`,
      });
    }

    if (!Number.isInteger(Number(item.fk_produto_id_produto)) || Number(item.fk_produto_id_produto) <= 0) {
      return res.status(400).json({
        erro: `Item ${i + 1}: ID do produto inválido.`,
      });
    }

    if (!item.quantidade || Number(item.quantidade) <= 0) {
      return res.status(400).json({
        erro: `Item ${i + 1}: a quantidade deve ser maior que zero.`,
      });
    }

    if (!Number.isInteger(Number(item.quantidade))) {
      return res.status(400).json({
        erro: `Item ${i + 1}: a quantidade deve ser um número inteiro.`,
      });
    }

    if (item.preco_custo === undefined || item.preco_custo === null) {
      return res.status(400).json({
        erro: `Item ${i + 1}: o preço de custo é obrigatório.`,
      });
    }

    if (isNaN(Number(item.preco_custo)) || Number(item.preco_custo) <= 0) {
      return res.status(400).json({
        erro: `Item ${i + 1}: o preço de custo deve ser um número maior que zero.`,
      });
    }
  }

  // Verificação de produtos duplicados na mesma compra
  const ids = itens.map((i) => i.fk_produto_id_produto);
  const idsUnicos = new Set(ids);
  if (idsUnicos.size !== ids.length) {
    return res.status(400).json({
      erro: "A compra contém produtos duplicados. Ajuste a quantidade em vez de repetir o produto.",
    });
  }

  next();
};

module.exports = validarCadastrarCompra;