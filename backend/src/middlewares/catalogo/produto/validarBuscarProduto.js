// Validação de Buscar Produto
const validarBuscarProduto = (req, res, next) => {
  const { uuid } = req.params;

  if (!uuid) {
    return res.status(400).json({ 
      erro: "O identificador do produto é obrigatório na URL para realizar a busca." 
    });
  }

  next();
};

module.exports = validarBuscarProduto;