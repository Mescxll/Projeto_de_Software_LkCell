// Validação Buscar Fornecedor
const validarBuscarFornecedor = (req, res, next) => {
  const { uuid } = req.params;

  if (!uuid) {
    return res.status(400).json({ 
      erro: "O UUID do fornecedor é obrigatório na URL para realizar a busca." 
    });
  }
  
  next();
};

module.exports = validarBuscarFornecedor;