// middlewares/catalogo/compatibilidade/validarAtualizarTodasMarcas.js
const validarAtualizarTodasMarcas = (req, res, next) => {
  const { id } = req.params;
  const { compativel_todas_marcas } = req.body;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ 
      erro: "O identificador do produto na URL deve ser um número válido." 
    });
  }

  if (compativel_todas_marcas === undefined || typeof compativel_todas_marcas !== "boolean") {
    return res.status(400).json({ 
      erro: "O campo 'compativel_todas_marcas' é obrigatório e deve ser estritamente true ou false." 
    });
  }

  // Trava para evitar lixo no body
  const camposPermitidos = ["compativel_todas_marcas"];
  const camposEnviados = Object.keys(req.body || {});
  const camposInvalidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));

  if (camposInvalidos.length > 0) {
    return res.status(400).json({ 
      erro: `Campos inválidos enviados. Apenas 'compativel_todas_marcas' é permitido nesta rota.` 
    });
  }

  next();
};

module.exports = validarAtualizarTodasMarcas;