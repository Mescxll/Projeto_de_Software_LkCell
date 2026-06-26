// middlewares/catalogo/marca/validarCadastrarMarca.js
const validarCadastrarMarca = (req, res, next) => {
  const { nome } = req.body;

  // Verifica existência e tipagem
  if (!nome || typeof nome !== "string") {
    return res.status(400).json({
      erro: "O nome da marca é obrigatório e deve ser um texto válido.",
    });
  }

  // Não aceita string vazia ou só com espaços
  if (nome.trim() === "") {
    return res.status(400).json({
      erro: "O nome da marca não pode estar vazio.",
    });
  }

  // Impede que enviem lixo no JSON (ex: enviar 'descricao' numa tabela que só tem 'nome')
  const camposPermitidos = ["nome"];
  const camposEnviados = Object.keys(req.body || {});
  const camposInvalidos = camposEnviados.filter(
    (campo) => !camposPermitidos.includes(campo)
  );

  if (camposInvalidos.length > 0) {
    return res.status(400).json({
      erro: `Campos inválidos enviados: ${camposInvalidos.join(", ")}. Apenas o campo 'nome' é aceito no cadastro de marca.`,
    });
  }

  next();
};

module.exports = validarCadastrarMarca;