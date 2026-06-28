// middlewares/estoque/validarBuscarAlertasEstoqueBaixo.js

// Endpoint atualmente não recebe parâmetros. Middleware mantido por
// simetria com os demais endpoints e como ponto de extensão futuro
// (ex.: filtro por fk_localizacao_id).
const validarBuscarAlertasEstoqueBaixo = (req, res, next) => {
  next();
};
 
module.exports = validarBuscarAlertasEstoqueBaixo;