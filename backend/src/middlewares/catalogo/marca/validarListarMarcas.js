// middlewares/catalogo/marca/validarListarMarca.js
const validarListarMarcas = (req, res, next) => {
  const { search } = req.query;

  // Evita que o Prisma receba um array no contains se mandarem ?search[]=a&search[]=b
  if (search !== undefined && typeof search !== "string") {
    return res.status(400).json({
      erro: "O parâmetro de busca deve ser um texto válido.",
    });
  }

  next();
};

module.exports = validarListarMarcas;