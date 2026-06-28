// middlewares/estoque/validarAjustarParametros.js
const validarAjustarParametros = (req, res, next) => {
  const { produtoId } = req.params;
  const { estoque_minimo, estoque_ideal } = req.body;

  // Valida o ID do produto
  if (
    !produtoId ||
    isNaN(Number(produtoId)) ||
    !Number.isInteger(Number(produtoId)) ||
    Number(produtoId) <= 0
  ) {
    return res.status(400).json({
      erro: "ID do produto inválido. Informe um número inteiro positivo.",
    });
  }

  // Pelo menos um dos campos deve ser informado
  if (estoque_minimo === undefined && estoque_ideal === undefined) {
    return res.status(400).json({
      erro: "Informe ao menos um campo para atualizar: estoque_minimo ou estoque_ideal.",
    });
  }

  // Valida estoque_minimo, se informado (null não é permitido)
  if (
    estoque_minimo !== undefined &&
    (estoque_minimo === null ||
      isNaN(Number(estoque_minimo)) ||
      !Number.isInteger(Number(estoque_minimo)) ||
      Number(estoque_minimo) <= 0)
  ) {
    return res.status(400).json({
      erro: "estoque_minimo inválido. Informe um número inteiro positivo.",
    });
  }

  // Valida estoque_ideal, se informado (null não é permitido)
  if (
    estoque_ideal !== undefined &&
    (estoque_ideal === null ||
      isNaN(Number(estoque_ideal)) ||
      !Number.isInteger(Number(estoque_ideal)) ||
      Number(estoque_ideal) <= 0)
  ) {
    return res.status(400).json({
      erro: "estoque_ideal inválido. Informe um número inteiro positivo.",
    });
  }

  // Quando ambos são informados, o ideal deve ser maior ou igual ao mínimo
  if (
    estoque_minimo !== undefined &&
    estoque_ideal !== undefined &&
    Number(estoque_ideal) < Number(estoque_minimo)
  ) {
    return res.status(400).json({
      erro: "estoque_ideal não pode ser menor que estoque_minimo.",
    });
  }

  next();
};

module.exports = validarAjustarParametros;