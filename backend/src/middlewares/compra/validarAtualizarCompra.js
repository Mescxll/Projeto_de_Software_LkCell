// Validação de Atualizar Compra
const validarAtualizarCompra = (req, res, next) => {
  const { id } = req.params;
  const { prazo_entrega, fk_fornecedor_id_fornecedor } = req.body;

  // Valida o ID da compra
  if (!id || isNaN(Number(id)) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      erro: "ID da compra inválido. Informe um número inteiro positivo.",
    });
  }

  // Pelo menos um campo deve ser informado para atualização
  if (prazo_entrega === undefined && fk_fornecedor_id_fornecedor === undefined) {
    return res.status(400).json({
      erro: "Informe ao menos um campo para atualizar: prazo_entrega ou fk_fornecedor_id_fornecedor.",
    });
  }

  // Valida prazo_entrega, se informado (null é permitido para limpar o campo)
  if (prazo_entrega !== undefined && prazo_entrega !== null) {
    const data = new Date(prazo_entrega);
    if (isNaN(data.getTime())) {
      return res.status(400).json({
        erro: "prazo_entrega inválido. Informe uma data válida no formato ISO 8601.",
      });
    }
  }

  // Valida fk_fornecedor_id_fornecedor, se informado
  if (
    fk_fornecedor_id_fornecedor !== undefined &&
    (isNaN(Number(fk_fornecedor_id_fornecedor)) ||
      !Number.isInteger(Number(fk_fornecedor_id_fornecedor)) ||
      Number(fk_fornecedor_id_fornecedor) <= 0)
  ) {
    return res.status(400).json({
      erro: "fk_fornecedor_id_fornecedor inválido. Informe um número inteiro positivo.",
    });
  }

  next();
};

module.exports = validarAtualizarCompra;