// middlewares/estoque/validarBuscarVisaoGeralEstoque.js
const STATUS_VALIDOS = ["normal", "abaixo_minimo", "acima_ideal"];

const validarBuscarVisaoGeralEstoque = (req, res, next) => {
  const { status } = req.query;

  if (status !== undefined && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({
      erro: `status inválido. Valores aceitos: ${STATUS_VALIDOS.join(", ")}.`,
    });
  }

  next();
};

module.exports = validarBuscarVisaoGeralEstoque;