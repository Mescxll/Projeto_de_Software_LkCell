// middlewares/catalogo/produto/validarAtualizarProduto.js
const validarAtualizarProduto = (req, res, next) => {
  const { uuid } = req.params;

  const {
    descricao,
    fk_categoria_id,
    fk_modelo_id,
    preco_compra,
    preco_custo,
    preco_venda,
  } = req.body;

  const camposPermitidos = [
    "descricao",
    "fk_categoria_id",
    "fk_modelo_id",
    "preco_compra",
    "preco_custo",
    "preco_venda",
  ];

  if (!uuid) {
    return res
      .status(400)
      .json({ erro: "O identificador do produto é obrigatório na URL." });
  }

  const camposEnviados = Object.keys(req.body || {});
  const camposInvalidos = camposEnviados.filter(
    (campo) => !camposPermitidos.includes(campo)
  );

  if (camposInvalidos.length > 0) {
    return res.status(400).json({
      erro: `Campos não permitidos: ${camposInvalidos.join(", ")}. Apenas descrição, categoria, modelo e preços podem ser atualizados.`,
    });
  }

  if (camposEnviados.length === 0) {
    return res
      .status(400)
      .json({ erro: "Nenhum dado válido foi enviado para atualização." });
  }

  if (preco_venda === undefined) {
    return res
      .status(400)
      .json({ erro: "O Preço de Venda é obrigatório na atualização." });
  }

  if (preco_venda !== undefined && isNaN(Number(preco_venda))) {
    return res
      .status(400)
      .json({ erro: "O Preço de Venda deve ser um número válido." });
  }

  if (preco_compra !== undefined && preco_compra !== null && isNaN(Number(preco_compra))) {
    return res
      .status(400)
      .json({ erro: "O Preço de Compra deve ser um número válido." });
  }

  if (preco_custo !== undefined && preco_custo !== null && isNaN(Number(preco_custo))) {
    return res
      .status(400)
      .json({ erro: "O Preço de Custo deve ser um número válido." });
  }

  if (fk_categoria_id !== undefined && isNaN(parseInt(fk_categoria_id))) {
    return res
      .status(400)
      .json({ erro: "O ID da categoria deve ser um número válido." });
  }

  if (fk_modelo_id !== undefined && isNaN(parseInt(fk_modelo_id))) {
    return res
      .status(400)
      .json({ erro: "O ID do modelo deve ser um número válido." });
  }

  next();
};

module.exports = validarAtualizarProduto;