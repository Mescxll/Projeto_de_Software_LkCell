// Validação de Atualização de Produto
const validarAtualizarProduto = (req, res, next) => {
  const { uuid } = req.params;
  const {
    codigo_produto,
    descricao,
    nome_categoria,
    nome_marca,
    nome_modelo,
    estoque_minimo,
    estoque_ideal,
    estoque_atual,
    preco_compra,
    preco_custo,
    preco_venda,
    margem_lucro,
  } = req.body;

  // Trava da URL
  if (!uuid) {
    return res.status(400).json({ erro: "O identificador do produto é obrigatório na URL." });
  }

  // Trava do Vento (Tentou atualizar sem mandar nada?)
  if (
    codigo_produto === undefined && descricao === undefined &&
    nome_categoria === undefined && nome_marca === undefined && nome_modelo === undefined &&
    estoque_minimo === undefined && estoque_ideal === undefined && estoque_atual === undefined &&
    preco_compra === undefined && preco_custo === undefined && preco_venda === undefined &&
    margem_lucro === undefined
  ) {
    return res.status(400).json({ erro: "Nenhum dado válido foi enviado para atualização." });
  }

  // Trava Matemática Básica
  if (estoque_atual !== undefined && isNaN(Number(estoque_atual))) {
    return res.status(400).json({ erro: "O Estoque Atual deve ser um número válido." });
  }
  if (preco_venda !== undefined && isNaN(Number(preco_venda))) {
    return res.status(400).json({ erro: "O Preço de Venda deve ser um número válido." });
  }

  next();
};

module.exports = validarAtualizarProduto;