// Validação Busca Compra
const validarBuscarCompra = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id)) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      erro: "ID da compra inválido. Informe um número inteiro positivo.",
    });
  }

  next();
};

module.exports = validarBuscarCompra;