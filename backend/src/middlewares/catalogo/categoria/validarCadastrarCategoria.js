// middlewares/catalogo/validarCadastrarCategoria.js
const validarCadastrarCategoria = (req, res, next) => {
  const { nome } = req.body;

  // Trava dos Obrigatórios
  if (!nome || typeof nome !== "string") {
    return res.status(400).json({
      erro: "O nome da categoria é obrigatório e deve ser um texto válido.",
    });
  }

  // Trava de Sanidade de Strings (Não aceita só espaço em branco)
  if (nome.trim() === "") {
    return res.status(400).json({
      erro: "O nome da categoria não pode estar vazio.",
    });
  }

  // Verificar se enviaram lixo a mais no body (campos não permitidos)
  const camposPermitidos = ["nome"];
  const camposEnviados = Object.keys(req.body || {});
  const camposInvalidos = camposEnviados.filter(
    (campo) => !camposPermitidos.includes(campo)
  );

  if (camposInvalidos.length > 0) {
    return res.status(400).json({
      erro: `Campos inválidos enviados: ${camposInvalidos.join(", ")}. Apenas 'nome' é aceito.`,
    });
  }

  next();
};

module.exports = validarCadastrarCategoria;