// Validação da Exlusão de Fornecedores
const validarDeletarFornecedor = (req, res, next) => {
  const { uuid } = req.params;

  if (!uuid) {
    return res.status(400).json({ 
      erro: "O UUID do fornecedor é obrigatório na URL para realizar a exclusão." 
    });
  }

  // Pode passar pro Controller
  next();
};

module.exports = validarDeletarFornecedor;