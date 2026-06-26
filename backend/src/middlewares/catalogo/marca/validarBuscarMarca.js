// middlewares/catalogo/marca/validarBuscarMarca.js
const validarBuscarMarca = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ 
      erro: "O identificador da marca é obrigatório na URL e deve ser um número válido para realizar a busca." 
    });
  }

  next();
};

module.exports = validarBuscarMarca;