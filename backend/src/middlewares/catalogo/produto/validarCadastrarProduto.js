// middlewares/catalogo/validarCadastrarProduto.js
const validarCadastrarProduto = (req, res, next) => {
  const {
    codigo_produto,
    descricao,
    fk_categoria_id,
    fk_modelo_id,
    estoque_atual,
    preco_venda,
  } = req.body;

  if (
    !codigo_produto ||
    !descricao ||
    !fk_categoria_id ||
    preco_venda === undefined ||
    String(preco_venda).trim() === "" ||
    estoque_atual === undefined
  ) {
    return res.status(400).json({
      erro: "Preencha todos os campos obrigatórios: Código, Descrição, Categoria, Estoque Atual e Preço de Venda.",
    });
  }

  if (codigo_produto.trim() === "" || descricao.trim() === "") {
    return res.status(400).json({
      erro: "Os campos de texto não podem ser vazios.",
    });
  }

  if (isNaN(fk_categoria_id) || isNaN(estoque_atual) || isNaN(preco_venda)) {
    return res.status(400).json({
      erro: "Categoria, Estoque Atual e Preço de Venda devem ser valores válidos.",
    });
  }

  if (fk_modelo_id !== undefined && fk_modelo_id !== null && isNaN(fk_modelo_id)) {
    return res.status(400).json({
      erro: "O ID do modelo deve ser um número válido.",
    });
  }

  next();
};

module.exports = validarCadastrarProduto;