// middlewares/estoque/validarBuscarHistoricoPorProduto.js
const TIPOS_MOVIMENTO_VALIDOS = ["ENTRADA", "SAIDA", "AJUSTE"];
 
const validarBuscarHistoricoPorProduto = (req, res, next) => {
  const { id } = req.params;
  const { fk_localizacao_id, tipo_movimento } = req.query;
 
  // Valida o ID do produto
  if (!id || isNaN(Number(id)) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      erro: "ID do produto inválido. Informe um número inteiro positivo.",
    });
  }
 
  // Valida fk_localizacao_id, se informado ("null" é um valor especial aceito,
  // representando registros sem localização)
  if (
    fk_localizacao_id !== undefined &&
    fk_localizacao_id !== "null" &&
    (isNaN(Number(fk_localizacao_id)) ||
      !Number.isInteger(Number(fk_localizacao_id)) ||
      Number(fk_localizacao_id) <= 0)
  ) {
    return res.status(400).json({
      erro:
        "fk_localizacao_id inválido. Informe um número inteiro positivo ou 'null'.",
    });
  }
 
  // Valida tipo_movimento, se informado
  if (
    tipo_movimento !== undefined &&
    !TIPOS_MOVIMENTO_VALIDOS.includes(tipo_movimento)
  ) {
    return res.status(400).json({
      erro: `tipo_movimento inválido. Valores aceitos: ${TIPOS_MOVIMENTO_VALIDOS.join(", ")}.`,
    });
  }
 
  next();
};
 
module.exports = validarBuscarHistoricoPorProduto;