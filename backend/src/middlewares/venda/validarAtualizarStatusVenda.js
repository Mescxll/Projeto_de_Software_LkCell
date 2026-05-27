// Validação de Atualização de Venda
const validarAtualizarStatusVenda = (req, res, next) => {
  const { id } = req.params;
  const { status_venda } = req.body;
 
  // Valida o ID da venda
  if (!id || isNaN(Number(id)) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      erro: "ID da venda inválido. Informe um número inteiro positivo.",
    });
  }
 
  // Valida o status da venda
  if (!status_venda) {
    return res.status(400).json({
      erro: "Status da venda é obrigatório.",
    });
  }
 
  // CANCELADA não é permitido por aqui 
  const statusPermitidos = ["ATIVA", "EFETUADA"];
  if (!statusPermitidos.includes(status_venda)) {
    return res.status(400).json({
      erro: "Status da venda inválido. Use: ATIVA ou EFETUADA. Para cancelar, use DELETE /api/vendas/:id.",
    });
  }
 
  next();
};
 
module.exports = validarAtualizarStatusVenda;