// middlewares/catalogo/marca/validarDeletarMarca.js
const validarDeletarMarca = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ 
      erro: "O identificador da marca é obrigatório na URL e deve ser um número válido para realizar a exclusão." 
    });
  }

  next();
};

module.exports = validarDeletarMarca;