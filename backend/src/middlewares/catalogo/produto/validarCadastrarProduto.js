// middlewares/catalogo/validarCadastrarProduto.js
const validarCadastrarProduto = (req, res, next) => {
  const {
    codigo_produto,
    descricao,
    fk_categoria_id,
    fk_modelo_id,
    estoque_entradas,
    preco_venda,
  } = req.body;

  if (
    !codigo_produto ||
    !descricao ||
    !fk_categoria_id ||
    preco_venda === undefined ||
    String(preco_venda).trim() === ""
  ) {
    return res.status(400).json({
      erro: "Preencha todos os campos obrigatórios: Código, Descrição, Categoria e Preço de Venda.",
    });
  }

  if (codigo_produto.trim() === "" || descricao.trim() === "") {
    return res.status(400).json({
      erro: "Os campos de texto não podem ser vazios.",
    });
  }

  if (isNaN(fk_categoria_id) || isNaN(preco_venda)) {
    return res.status(400).json({
      erro: "Categoria e Preço de Venda devem ser valores válidos.",
    });
  }

  if (
    fk_modelo_id !== undefined &&
    fk_modelo_id !== null &&
    isNaN(fk_modelo_id)
  ) {
    return res.status(400).json({
      erro: "O ID do modelo deve ser um número válido.",
    });
  }

  // estoque_entradas é opcional — ausente ou array vazio = estoque zero sem localização
  if (estoque_entradas !== undefined) {
    if (!Array.isArray(estoque_entradas)) {
      return res.status(400).json({
        erro: "estoque_entradas deve ser um array.",
      });
    }

    for (const entrada of estoque_entradas) {
      if (!entrada.fk_localizacao_id || entrada.quantidade === undefined) {
        return res.status(400).json({
          erro: "Cada entrada de estoque deve informar fk_localizacao_id e quantidade.",
        });
      }

      if (isNaN(entrada.fk_localizacao_id) || isNaN(entrada.quantidade)) {
        return res.status(400).json({
          erro: "Os valores de localização e quantidade nas entradas de estoque devem ser numéricos.",
        });
      }

      if (parseInt(entrada.quantidade) <= 0) {
        return res.status(400).json({
          erro: "A quantidade em cada entrada de estoque deve ser maior que zero.",
        });
      }
    }
  }

  next();
};

module.exports = validarCadastrarProduto;