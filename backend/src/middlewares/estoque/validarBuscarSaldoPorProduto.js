// middlewares/estoque/validarBuscarSaldoPorProduto.js
const validarBuscarSaldoPorProduto = (req, res, next) => {
  const { id } = req.params;

  // Valida o ID do produto
  if (!id || isNaN(Number(id)) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      erro: "ID do produto inválido. Informe um número inteiro positivo.",
    });
  }

  next();
};

module.exports = validarBuscarSaldoPorProduto;