// Validação de Atualizar Venda
const validarAtualizarVenda = (req, res, next) => {
  const { id } = req.params;
  const { status_pagamento, data_vencimento, fk_cliente_id_cliente, fk_funcionario_id_funcionario, itens } = req.body;

  // Valida o ID da venda (veio pela URL)
  if (!id || isNaN(Number(id)) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      erro: "ID da venda inválido. Informe um número inteiro positivo.",
    });
  }

  // Valida cliente (obrigatório)
  if (!fk_cliente_id_cliente) {
    return res.status(400).json({ erro: "Cliente é obrigatório." });
  }

  if (
    !Number.isInteger(Number(fk_cliente_id_cliente)) ||
    Number(fk_cliente_id_cliente) <= 0
  ) {
    return res.status(400).json({ erro: "ID do cliente inválido." });
  }

  // Valida funcionário (obrigatório)
  if (!fk_funcionario_id_funcionario) {
    return res.status(400).json({ erro: "Funcionário é obrigatório." });
  }

  if (
    !Number.isInteger(Number(fk_funcionario_id_funcionario)) ||
    Number(fk_funcionario_id_funcionario) <= 0
  ) {
    return res.status(400).json({ erro: "ID do funcionário inválido." });
  }

  //  Valida o status_pagamento, se ele vier no payload
  if (status_pagamento !== undefined) {
    if (typeof status_pagamento !== "string" || status_pagamento.trim() === "") {
      return res.status(400).json({
        erro: "status_pagamento inválido. Deve ser uma string (ex: 'PAGO' ou 'EM_ABERTO').",
      });
    }

    const statusPermitidos = ["PAGO", "EM_ABERTO"];
    if (!statusPermitidos.includes(status_pagamento)) {
      return res.status(400).json({
        erro: "Status de pagamento inválido. Use: PAGO ou EM_ABERTO.",
      });
    }
  }

  //  Valida a data_vencimento (aceita null para vendas pagas na hora)
  if (data_vencimento !== undefined && data_vencimento !== null) {
    const data = new Date(data_vencimento);
    if (isNaN(data.getTime())) {
      return res.status(400).json({
        erro: "data_vencimento inválida. Informe uma data válida no formato ISO 8601.",
      });
    }
  }

  // Valida os itens da venda
  if (itens !== undefined) {
    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        erro: "A venda deve conter pelo menos um produto na lista de itens.",
      });
    }

    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];

      if (
        !item.fk_produto_id_produto ||
        isNaN(Number(item.fk_produto_id_produto)) ||
        Number(item.fk_produto_id_produto) <= 0
      ) {
        return res.status(400).json({
          erro: `ID do produto inválido no item da posição ${i}. Informe um inteiro positivo.`,
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

      if (
        !item.quantidade_vendida ||
        isNaN(Number(item.quantidade_vendida)) ||
        Number(item.quantidade_vendida) <= 0
      ) {
        return res.status(400).json({
          erro: `Quantidade inválida no produto ID ${item.fk_produto_id_produto}. A quantidade deve ser maior que zero.`,
        });
      }

      if (
        item.preco_unitario === undefined ||
        isNaN(Number(item.preco_unitario)) ||
        Number(item.preco_unitario) < 0
      ) {
        return res.status(400).json({
          erro: `Preço unitário inválido no produto ID ${item.fk_produto_id_produto}. O valor não pode ser negativo.`,
        });
      }
    }

    // Duplicata real = mesmo produto NA MESMA localização
    const chaves = itens.map(
      (i) => `${i.fk_produto_id_produto}-${i.fk_localizacao_id}`,
    );
    const chavesUnicas = new Set(chaves);
    if (chavesUnicas.size !== chaves.length) {
      return res.status(400).json({
        erro: "A venda contém o mesmo produto repetido na mesma localização. Ajuste a quantidade em vez de repetir o item.",
      });
    }
  }

  next();
};

module.exports = validarAtualizarVenda;