// Validação de Status Atualizar Pagamento
const validarAtualizarStatusPagamento = (req, res, next) => {
  const { id } = req.params;
  const { status_pagamento } = req.body;
 
  // Valida o ID da venda
  if (!id || isNaN(Number(id)) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      erro: "ID da venda inválido. Informe um número inteiro positivo.",
    });
  }
 
  // Valida o status de pagamento
  if (!status_pagamento) {
    return res.status(400).json({
      erro: "Status de pagamento é obrigatório.",
    });
  }
 
  const statusPermitidos = ["PAGO", "EM_ABERTO"];
  if (!statusPermitidos.includes(status_pagamento)) {
    return res.status(400).json({
      erro: "Status de pagamento inválido. Use: PAGO ou EM_ABERTO.",
    });
  }
 
  next();
};
 
module.exports = validarAtualizarStatusPagamento;