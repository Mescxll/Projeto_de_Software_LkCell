// middlewares/catalogo/marca/validarAtualizarMarca.js
const validarAtualizarMarca = (req, res, next) => {
  const { id } = req.params;
  const { nome } = req.body;

  // Trava do ID numérico
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ 
      erro: "O identificador da marca na URL deve ser um número válido." 
    });
  }

  // Trava de campos intrusos no JSON
  const camposPermitidos = ["nome"];
  const camposEnviados = Object.keys(req.body || {});
  const camposInvalidos = camposEnviados.filter(
    (campo) => !camposPermitidos.includes(campo)
  );

  if (camposInvalidos.length > 0) {
    return res.status(400).json({
      erro: "Somente o nome da marca pode ser atualizado.",
    });
  }

  // O nome não pode vir vazio se tentaram enviar
  if (nome === undefined || String(nome).trim() === "") {
    return res.status(400).json({
      erro: "O nome da marca é obrigatório na atualização e não pode estar vazio.",
    });
  }

  if (typeof nome !== "string") {
    return res.status(400).json({
      erro: "O nome da marca deve ser um texto válido.",
    });
  }

  next();
};

module.exports = validarAtualizarMarca;