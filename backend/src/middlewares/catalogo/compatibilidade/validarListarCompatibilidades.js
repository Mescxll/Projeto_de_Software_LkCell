// middlewares/catalogo/compatibilidade/validarListarCompatibilidades.js
const validarListarCompatibilidades = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ 
      erro: "O identificador do produto na URL deve ser um número válido." 
    });
  }

  next();
};

module.exports = validarListarCompatibilidades;