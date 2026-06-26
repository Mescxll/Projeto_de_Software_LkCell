// middlewares/catalogo/compatibilidade/validarAtualizarCompatibilidade.js
const validarAtualizarCompatibilidade = (req, res, next) => {
  const { id, id_compatibilidade } = req.params;
  const { observacao } = req.body;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ erro: "O ID do produto deve ser um número válido." });
  }

  if (!id_compatibilidade || isNaN(Number(id_compatibilidade))) {
    return res.status(400).json({ erro: "O ID da compatibilidade deve ser um número válido." });
  }

  // Trava severa: Só aceita a observação no body
  const camposPermitidos = ["observacao"];
  const camposEnviados = Object.keys(req.body || {});
  const camposInvalidos = camposEnviados.filter(campo => !camposPermitidos.includes(campo));

  if (camposInvalidos.length > 0) {
    return res.status(400).json({ 
      erro: "Nesta rota, somente o campo 'observacao' pode ser atualizado. Para alterar marca ou modelo, remova o registro e adicione um novo." 
    });
  }

  if (observacao !== undefined && typeof observacao !== "string") {
    return res.status(400).json({ erro: "A observação deve ser um texto válido." });
  }

  next();
};

module.exports = validarAtualizarCompatibilidade;