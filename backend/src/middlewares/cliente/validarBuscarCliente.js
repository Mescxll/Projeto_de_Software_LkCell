// Validação Buscar Cliente
const validarBuscarCliente = (req, res, next) => {
  const { uuid } = req.params;

  // Se o frontend bugar e não mandar o ID
  if (!uuid) {
    return res.status(400).json({ 
      erro: "O UUID do cliente é obrigatório na URL para realizar a busca." 
    });
  }
  
  next();
};

module.exports = validarBuscarCliente;