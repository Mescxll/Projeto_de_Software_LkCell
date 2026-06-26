// middlewares/catalogo/validarAtualizarCategoria.js
const validarAtualizarCategoria = (req, res, next) => {
  const { id } = req.params;
  const { nome } = req.body;

  // Trava da URL: O ID tem que existir e tem que ser conversível para número
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ 
      erro: "O identificador da categoria na URL deve ser um número válido." 
    });
  }

  const camposPermitidos = ["nome"];
  const camposEnviados = Object.keys(req.body || {});
  const camposInvalidos = camposEnviados.filter(
    (campo) => !camposPermitidos.includes(campo)
  );

  if (camposInvalidos.length > 0) {
    return res.status(400).json({
      erro: "Somente o nome da categoria pode ser atualizado.",
    });
  }

  // O nome precisa estar presente se o body tiver sido enviado, e não pode ser vazio
  if (nome === undefined || String(nome).trim() === "") {
    return res.status(400).json({
      erro: "O nome da categoria é obrigatório na atualização e não pode estar vazio.",
    });
  }

  next();
};

module.exports = validarAtualizarCategoria;