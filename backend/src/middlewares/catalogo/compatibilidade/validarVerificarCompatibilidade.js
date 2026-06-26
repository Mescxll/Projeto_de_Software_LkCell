// middlewares/catalogo/compatibilidade/validarVerificarCompatibilidade.js
const validarVerificarCompatibilidade = (req, res, next) => {
  const { id } = req.params;
  const { marca_id, modelo_id } = req.query;

  // Trava do ID na URL
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ erro: "O ID do produto deve ser um número válido." });
  }

  // Trava da Query: A marca é obrigatória para a verificação fazer sentido
  if (!marca_id || isNaN(Number(marca_id))) {
    return res.status(400).json({ 
      erro: "O parâmetro 'marca_id' é obrigatório na URL (query) e deve ser um número." 
    });
  }

  // O modelo é opcional, mas se for enviado, precisa ser número
  if (modelo_id !== undefined && isNaN(Number(modelo_id))) {
    return res.status(400).json({ 
      erro: "O parâmetro 'modelo_id' deve ser um número válido." 
    });
  }

  next();
};

module.exports = validarVerificarCompatibilidade;