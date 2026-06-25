// Validação de Cadastro de Produto
const validarCadastrarProduto = (req, res, next) => {
  const {
    codigo_produto,
    descricao,
    nome_categoria,
    nome_marca,
    nome_modelo,
    estoque_atual,
    preco_venda,
  } = req.body;

  // Trava dos Obrigatórios
  if (
    !codigo_produto ||
    !descricao ||
    !nome_categoria ||
    !nome_marca ||
    !nome_modelo ||
    preco_venda === undefined ||
    String(preco_venda).trim() === "" ||
    estoque_atual === undefined
  ) {
    return res.status(400).json({
      erro: "Preencha todos os campos obrigatórios (Código, Descrição, Categoria, Marca, Modelo, Estoque Atual e Preço de Venda).",
    });
  }

  // Trava de Sanidade de Strings (Não aceita só espaço em branco)
  if (
    codigo_produto.trim() === "" ||
    descricao.trim() === "" ||
    nome_categoria.trim() === "" ||
    nome_marca.trim() === "" ||
    nome_modelo.trim() === ""
  ) {
    return res.status(400).json({
      erro: "Os campos de texto não podem ser vazios.",
    });
  }

  // Trava de Tipagem Matemática (Pra não quebrar o parseInt/parseFloat do Controller)
  if (isNaN(estoque_atual) || isNaN(preco_venda)) {
    return res.status(400).json({
      erro: "O Estoque Atual e o Preço de Venda devem ser valores numéricos válidos.",
    });
  }

  next();
};

module.exports = validarCadastrarProduto;
