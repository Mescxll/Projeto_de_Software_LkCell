// Validar Cadastro e Atualização de Localização
const validarLocalizacao = (req, res, next) => {
  const { localizacao } = req.body;

  if (!localizacao || typeof localizacao !== "string" || !localizacao.trim()) {
    return res.status(400).json({ erro: "O nome da localização é obrigatório." });
  }

  if (localizacao.trim().length > 100) {
    return res
      .status(400)
      .json({ erro: "O nome da localização deve ter no máximo 100 caracteres." });
  }

  next();
};

// Validar ID de Localização (params)
const validarIdLocalizacao = (req, res, next) => {
  const { id } = req.params;

  if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ erro: "ID de localização inválido." });
  }

  next();
};

module.exports = { validarLocalizacao, validarIdLocalizacao };