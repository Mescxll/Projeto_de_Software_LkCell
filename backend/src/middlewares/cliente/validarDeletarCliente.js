// Validação de Exclusão de Cliente
const validarDeletarCliente = (req, res, next) => {
  const { uuid } = req.params;

  if (!uuid) {
    return res.status(400).json({ 
      erro: "O UUID do cliente é obrigatório na URL para realizar a exclusão." 
    });
  }

  next();
};

module.exports = validarDeletarCliente;