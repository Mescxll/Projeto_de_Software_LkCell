// middlewares/catalogo/validarListarCategoria.js
const validarListarCategorias = (req, res, next) => {
  const { search } = req.query;

  // Se enviou o search, ele OBRIGATORIAMENTE tem que ser uma string.
  // Isso evita ataques onde o cliente manda arrays ou objetos na query da URL.
  if (search !== undefined && typeof search !== "string") {
    return res.status(400).json({
      erro: "O parâmetro de busca deve ser um texto válido.",
    });
  }

  next();
};

module.exports = validarListarCategorias;