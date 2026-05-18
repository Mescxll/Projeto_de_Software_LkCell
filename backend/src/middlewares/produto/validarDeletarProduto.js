// Validação de Deletar Produto
const validarDeletarProduto = (req, res, next) => {
  const { uuid } = req.params;

  if (!uuid) {
    return res.status(400).json({ 
      erro: "O identificador do produto é obrigatório na URL para realizar a exclusão." 
    });
  }

  next();
};

module.exports = validarDeletarProduto;