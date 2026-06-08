// Validação de Cancelar Compra
const validarCancelarCompra = (req, res, next) => {
  const { id } = req.params;

  // Verifica se o ID foi informado e é numérico
  if (!id || isNaN(Number(id)) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      erro: "ID da compra inválido. Informe um número inteiro positivo.",
    });
  }

  next();
};

module.exports = validarCancelarCompra;