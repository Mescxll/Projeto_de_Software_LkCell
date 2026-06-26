// middlewares/catalogo/modelo/validarAtualizarModelo.js
const validarAtualizarModelo = (req, res, next) => {
  const { id } = req.params;
  const { nome, fk_marca_id } = req.body;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ 
      erro: "O identificador do modelo na URL deve ser um número válido." 
    });
  }

  const camposPermitidos = ["nome", "fk_marca_id"];
  const camposEnviados = Object.keys(req.body || {});
  const camposInvalidos = camposEnviados.filter(
    (campo) => !camposPermitidos.includes(campo)
  );

  if (camposInvalidos.length > 0) {
    return res.status(400).json({
      erro: "Somente o nome do modelo e a marca (fk_marca_id) podem ser atualizados.",
    });
  }

  // Trava do Vento: Enviou o body vazio?
  if (nome === undefined && fk_marca_id === undefined) {
    return res.status(400).json({
      erro: "Nenhum dado válido foi enviado para atualização.",
    });
  }

  if (nome !== undefined && (typeof nome !== "string" || nome.trim() === "")) {
    return res.status(400).json({
      erro: "Se for atualizar o nome, ele não pode ser vazio e deve ser um texto válido.",
    });
  }

  if (fk_marca_id !== undefined && isNaN(Number(fk_marca_id))) {
    return res.status(400).json({
      erro: "Se for atualizar a marca, o ID (fk_marca_id) deve ser um número válido.",
    });
  }

  next();
};

module.exports = validarAtualizarModelo;