// middlewares/catalogo/compatibilidade/validarRemoverCompatibilidade.js
const validarRemoverCompatibilidade = (req, res, next) => {
  const { id, id_compatibilidade } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ erro: "O ID do produto deve ser um número válido." });
  }

  if (!id_compatibilidade || isNaN(Number(id_compatibilidade))) {
    return res.status(400).json({ erro: "O ID da compatibilidade deve ser um número válido." });
  }

  next();
};

module.exports = validarRemoverCompatibilidade;