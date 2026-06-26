// middlewares/catalogo/modelo/validarCadastrarModelo.js
const validarCadastrarModelo = (req, res, next) => {
  const { nome, fk_marca_id } = req.body;

  // Trava dos Obrigatórios
  if (!nome || !fk_marca_id) {
    return res.status(400).json({
      erro: "O nome do modelo e a marca (fk_marca_id) são obrigatórios.",
    });
  }

  if (typeof nome !== "string" || nome.trim() === "") {
    return res.status(400).json({
      erro: "O nome do modelo não pode ser vazio e deve ser um texto.",
    });
  }

  if (isNaN(Number(fk_marca_id))) {
    return res.status(400).json({
      erro: "O ID da marca (fk_marca_id) deve ser um número válido.",
    });
  }

  // Trava de campos não permitidos
  const camposPermitidos = ["nome", "fk_marca_id"];
  const camposEnviados = Object.keys(req.body || {});
  const camposInvalidos = camposEnviados.filter(
    (campo) => !camposPermitidos.includes(campo)
  );

  if (camposInvalidos.length > 0) {
    return res.status(400).json({
      erro: `Campos inválidos enviados: ${camposInvalidos.join(", ")}. Apenas 'nome' e 'fk_marca_id' são aceitos.`,
    });
  }

  next();
};

module.exports = validarCadastrarModelo;