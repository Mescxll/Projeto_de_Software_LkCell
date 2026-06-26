// Validação de Cadastro de Produto
const validarCadastrarProduto = (req, res, next) => {
  const {
    codigo_produto,
    descricao,
    fk_categoria_id,
    fk_modelo_id,
    estoque_atual,
    preco_venda,
  } = req.body;

  // Trava dos Obrigatórios
  if (
    !codigo_produto ||
    !descricao ||
    !fk_categoria_id ||
    !fk_modelo_id ||
    preco_venda === undefined ||
    String(preco_venda).trim() === "" ||
    estoque_atual === undefined
  ) {
    return res.status(400).json({
      erro: "Preencha todos os campos obrigatórios (Código, Descrição, Categoria, Modelo, Estoque Atual e Preço de Venda).",
    });
  }

  // Trava de Sanidade de Strings (Não aceita só espaço em branco)
  if (codigo_produto.trim() === "" || descricao.trim() === "") {
    return res.status(400).json({
      erro: "Os campos de texto não podem ser vazios.",
    });
  }

  // Trava de Tipagem (IDs e valores numéricos)
  if (
    isNaN(fk_categoria_id) ||
    isNaN(fk_modelo_id) ||
    isNaN(estoque_atual) ||
    isNaN(preco_venda)
  ) {
    return res.status(400).json({
      erro: "Categoria, Modelo, Estoque Atual e Preço de Venda devem ser valores válidos.",
    });
  }

  next();
};

module.exports = validarCadastrarProduto;