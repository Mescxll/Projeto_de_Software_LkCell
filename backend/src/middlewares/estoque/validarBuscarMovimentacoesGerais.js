// middlewares/estoque/validarBuscarMovimentacoesGerais.js
const TIPOS_MOVIMENTO_VALIDOS = ["ENTRADA", "SAIDA", "AJUSTE"];

const validarBuscarMovimentacoesGerais = (req, res, next) => {
  const {
    data_inicio,
    data_fim,
    tipo_movimento,
    fk_produto_id,
    fk_localizacao_id,
    pagina,
    por_pagina,
  } = req.query;

  if (data_inicio !== undefined && isNaN(new Date(data_inicio).getTime())) {
    return res.status(400).json({
      erro: "data_inicio inválida. Informe uma data válida no formato ISO 8601.",
    });
  }

  if (data_fim !== undefined && isNaN(new Date(data_fim).getTime())) {
    return res.status(400).json({
      erro: "data_fim inválida. Informe uma data válida no formato ISO 8601.",
    });
  }

  if (
    tipo_movimento !== undefined &&
    !TIPOS_MOVIMENTO_VALIDOS.includes(tipo_movimento)
  ) {
    return res.status(400).json({
      erro: `tipo_movimento inválido. Valores aceitos: ${TIPOS_MOVIMENTO_VALIDOS.join(", ")}.`,
    });
  }

  if (
    fk_produto_id !== undefined &&
    (isNaN(Number(fk_produto_id)) ||
      !Number.isInteger(Number(fk_produto_id)) ||
      Number(fk_produto_id) <= 0)
  ) {
    return res.status(400).json({
      erro: "fk_produto_id inválido. Informe um número inteiro positivo.",
    });
  }

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

  if (
    pagina !== undefined &&
    (isNaN(Number(pagina)) || !Number.isInteger(Number(pagina)) || Number(pagina) <= 0)
  ) {
    return res.status(400).json({
      erro: "pagina inválida. Informe um número inteiro positivo.",
    });
  }

  if (
    por_pagina !== undefined &&
    (isNaN(Number(por_pagina)) ||
      !Number.isInteger(Number(por_pagina)) ||
      Number(por_pagina) <= 0 ||
      Number(por_pagina) > 100)
  ) {
    return res.status(400).json({
      erro: "por_pagina inválido. Informe um número inteiro entre 1 e 100.",
    });
  }

  next();
};

module.exports = validarBuscarMovimentacoesGerais;