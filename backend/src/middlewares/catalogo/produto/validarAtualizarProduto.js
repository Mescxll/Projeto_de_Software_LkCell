// Validação de Atualização de Produto
const validarAtualizarProduto = (req, res, next) => {
  const { uuid } = req.params;
  const {
    descricao,
    nome_categoria,
    estoque_minimo,
    estoque_ideal,
    estoque_atual,
    preco_compra,
    preco_custo,
    preco_venda,
  } = req.body;

  const camposPermitidos = [
    "descricao",
    "nome_categoria",
    "estoque_minimo",
    "estoque_ideal",
    "estoque_atual",
    "preco_compra",
    "preco_custo",
    "preco_venda",
  ];

  const camposEnviados = Object.keys(req.body || {});
  const camposInvalidos = camposEnviados.filter(
    (campo) => !camposPermitidos.includes(campo),
  );

  // Trava da URL
  if (!uuid) {
    return res
      .status(400)
      .json({ erro: "O identificador do produto é obrigatório na URL." });
  }

  if (camposInvalidos.length > 0) {
    return res.status(400).json({
      erro: "Somente descrição, categoria, estoque e valores podem ser atualizados.",
    });
  }

  // Trava do Vento (Tentou atualizar sem mandar nada?)
  if (
    descricao === undefined &&
    nome_categoria === undefined &&
    estoque_minimo === undefined &&
    estoque_ideal === undefined &&
    estoque_atual === undefined &&
    preco_compra === undefined &&
    preco_custo === undefined &&
    preco_venda === undefined
  ) {
    return res
      .status(400)
      .json({ erro: "Nenhum dado válido foi enviado para atualização." });
  }

  if (preco_venda === undefined) {
    return res
      .status(400)
      .json({ erro: "O Preço de Venda é obrigatório na atualização." });
  }

  // Trava Matemática Básica
  if (estoque_atual !== undefined && isNaN(Number(estoque_atual))) {
    return res
      .status(400)
      .json({ erro: "O Estoque Atual deve ser um número válido." });
  }
  if (preco_venda !== undefined && isNaN(Number(preco_venda))) {
    return res
      .status(400)
      .json({ erro: "O Preço de Venda deve ser um número válido." });
  }

  next();
};

module.exports = validarAtualizarProduto;
