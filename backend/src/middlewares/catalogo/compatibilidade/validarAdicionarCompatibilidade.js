
// middlewares/catalogo/compatibilidade/validarAdicionarCompatibilidade.js
const validarAdicionarCompatibilidade = (req, res, next) => {
  const { id } = req.params;
  const { fk_marca_id, fk_modelo_id, tipo, observacao } = req.body;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ erro: "O identificador do produto deve ser um número válido." });
  }

  // Trava do Enum de Tipo
  if (!tipo || !["INCLUSAO", "EXCLUSAO"].includes(tipo.toUpperCase())) {
    return res.status(400).json({ 
      erro: "O campo 'tipo' é obrigatório e deve ser 'INCLUSAO' ou 'EXCLUSAO'." 
    });
  }

  // Trava Matemática das chaves estrangeiras (se enviadas, tem que ser número)
  if (fk_marca_id !== undefined && isNaN(Number(fk_marca_id))) {
    return res.status(400).json({ erro: "O ID da marca deve ser um número válido." });
  }

  if (fk_modelo_id !== undefined && isNaN(Number(fk_modelo_id))) {
    return res.status(400).json({ erro: "O ID do modelo deve ser um número válido." });
  }

  // Trava de coerência
  if (fk_modelo_id && !fk_marca_id) {
    return res.status(400).json({ 
      erro: "Não é possível vincular um modelo sem informar a marca correspondente." 
    });
  }

  // Trava da observação
  if (observacao !== undefined && typeof observacao !== "string") {
    return res.status(400).json({ erro: "A observação deve ser um texto válido." });
  }

  next();
};

module.exports = validarAdicionarCompatibilidade;