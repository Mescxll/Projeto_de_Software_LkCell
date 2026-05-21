// Validação de Exclusão de Funcionário
const validarDeletarFuncionario = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ 
      erro: "O ID do funcionário é obrigatório na URL para realizar a exclusão." 
    });
  }

  next();
};

module.exports = validarDeletarFuncionario;