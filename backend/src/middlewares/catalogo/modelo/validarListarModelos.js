// middlewares/catalogo/modelo/validarListarModelos.js
const validarListarModelos = (req, res, next) => {
  const { search, marca_id } = req.query;

  if (search !== undefined && typeof search !== "string") {
    return res.status(400).json({
      erro: "O parâmetro de busca deve ser um texto válido.",
    });
  }

  if (marca_id !== undefined && isNaN(Number(marca_id))) {
    return res.status(400).json({
      erro: "O parâmetro 'marca_id' na busca deve ser um número válido.",
    });
  }

  next();
};

module.exports = validarListarModelos;