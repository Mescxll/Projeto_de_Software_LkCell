// Validação Busca Funcionário
const validarBuscarFuncionario = (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ 
      erro: "O ID do funcionário é obrigatório na URL para realizar a busca." 
    });
  }

  // Garante que o ID que mandaram é um número válido
  if (isNaN(id)) {
    return res.status(400).json({ 
      erro: "O ID do funcionário deve ser um número válido." 
    });
  }

  next();
};

module.exports = validarBuscarFuncionario;