// Validar Cadastro Venda
const validarCadastrarVenda = (req, res, next) => {
  const { status_pagamento, fk_funcionario_id_funcionario, itens } = req.body;
 
  // Campos obrigatórios
  if (!status_pagamento) {
    return res.status(400).json({ erro: "Status de pagamento é obrigatório." });
  }
 
  if (!fk_funcionario_id_funcionario) {
    return res.status(400).json({ erro: "Funcionário é obrigatório." });
  }
 
  // Validação do enum status_pagamento
  const statusPermitidos = ["PAGO", "EM_ABERTO"];
  if (!statusPermitidos.includes(status_pagamento)) {
    return res.status(400).json({
      erro: "Status de pagamento inválido. Use: PAGO ou EM_ABERTO.",
    });
  }
 
  // Validação do ID do funcionário
  if (!Number.isInteger(Number(fk_funcionario_id_funcionario)) || Number(fk_funcionario_id_funcionario) <= 0) {
    return res.status(400).json({ erro: "ID do funcionário inválido." });
  }
 
  // Validação dos itens
  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({
      erro: "A venda deve conter pelo menos um produto.",
    });
  }
 
  for (let i = 0; i < itens.length; i++) {
    const item = itens[i];
 
    if (!item.fk_produto_id_produto) {
      return res.status(400).json({
        erro: `Item ${i + 1}: o produto é obrigatório.`,
      });
    }
 
    if (!item.quantidade_vendida || Number(item.quantidade_vendida) <= 0) {
      return res.status(400).json({
        erro: `Item ${i + 1}: a quantidade deve ser maior que zero.`,
      });
    }
 
    if (!Number.isInteger(Number(item.quantidade_vendida))) {
      return res.status(400).json({
        erro: `Item ${i + 1}: a quantidade deve ser um número inteiro.`,
      });
    }
  }
 
  // Verificação de produtos duplicados na mesma venda
  const ids = itens.map((i) => i.fk_produto_id_produto);
  const idsUnicos = new Set(ids);
  if (idsUnicos.size !== ids.length) {
    return res.status(400).json({
      erro: "A venda contém produtos duplicados. Ajuste a quantidade em vez de repetir o produto.",
    });
  }
 
  next();
};
 
module.exports = validarCadastrarVenda;