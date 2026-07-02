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
  if (
    !Number.isInteger(Number(fk_funcionario_id_funcionario)) ||
    Number(fk_funcionario_id_funcionario) <= 0
  ) {
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

    if (
      !Number.isInteger(Number(item.fk_produto_id_produto)) ||
      Number(item.fk_produto_id_produto) <= 0
    ) {
      return res.status(400).json({
        erro: `Item ${i + 1}: ID do produto inválido.`,
      });
    }

    if (!item.fk_localizacao_id) {
      return res.status(400).json({
        erro: `Item ${i + 1}: a localização é obrigatória.`,
      });
    }

    if (
      !Number.isInteger(Number(item.fk_localizacao_id)) ||
      Number(item.fk_localizacao_id) <= 0
    ) {
      return res.status(400).json({
        erro: `Item ${i + 1}: ID da localização inválido.`,
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

  // Duplicata real = mesmo produto NA MESMA localização (PK composta de itensvenda)
  const chaves = itens.map(
    (i) => `${i.fk_produto_id_produto}-${i.fk_localizacao_id}`,
  );
  const chavesUnicas = new Set(chaves);
  if (chavesUnicas.size !== chaves.length) {
    return res.status(400).json({
      erro: "A venda contém o mesmo produto repetido na mesma localização. Ajuste a quantidade em vez de repetir o item.",
    });
  }

  next();
};

module.exports = validarCadastrarVenda;