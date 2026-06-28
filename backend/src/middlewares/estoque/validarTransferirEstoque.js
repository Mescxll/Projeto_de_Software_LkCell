// middlewares/estoque/validarTransferirEstoque.js
const validarTransferirEstoque = (req, res, next) => {
  const {
    fk_produto_id,
    fk_localizacao_origem_id,
    fk_localizacao_destino_id,
    quantidade,
  } = req.body;

  // Valida fk_produto_id
  if (
    !fk_produto_id ||
    isNaN(Number(fk_produto_id)) ||
    !Number.isInteger(Number(fk_produto_id)) ||
    Number(fk_produto_id) <= 0
  ) {
    return res.status(400).json({
      erro: "fk_produto_id inválido. Informe um número inteiro positivo.",
    });
  }

  // Valida fk_localizacao_origem_id
  if (
    !fk_localizacao_origem_id ||
    isNaN(Number(fk_localizacao_origem_id)) ||
    !Number.isInteger(Number(fk_localizacao_origem_id)) ||
    Number(fk_localizacao_origem_id) <= 0
  ) {
    return res.status(400).json({
      erro: "fk_localizacao_origem_id inválido. Informe um número inteiro positivo.",
    });
  }

  // Valida fk_localizacao_destino_id
  if (
    !fk_localizacao_destino_id ||
    isNaN(Number(fk_localizacao_destino_id)) ||
    !Number.isInteger(Number(fk_localizacao_destino_id)) ||
    Number(fk_localizacao_destino_id) <= 0
  ) {
    return res.status(400).json({
      erro: "fk_localizacao_destino_id inválido. Informe um número inteiro positivo.",
    });
  }

  // Origem e destino não podem ser a mesma localização
  if (Number(fk_localizacao_origem_id) === Number(fk_localizacao_destino_id)) {
    return res.status(400).json({
      erro: "A localização de origem deve ser diferente da localização de destino.",
    });
  }

  // Valida quantidade
  if (
    quantidade === undefined ||
    isNaN(Number(quantidade)) ||
    !Number.isInteger(Number(quantidade)) ||
    Number(quantidade) <= 0
  ) {
    return res.status(400).json({
      erro: "quantidade inválida. Informe um número inteiro positivo.",
    });
  }

  next();
};

module.exports = validarTransferirEstoque;