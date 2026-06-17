// Validação de Atualizar Venda
const validarAtualizarVenda = (req, res, next) => {
  const { id } = req.params;
  const { status_pagamento, data_vencimento, itens } = req.body;

  // 1. Valida o ID da venda (veio pela URL)
  if (!id || isNaN(Number(id)) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      erro: "ID da venda inválido. Informe um número inteiro positivo.",
    });
  }

  // 2. Valida o status_pagamento, se ele vier no payload
  if (status_pagamento !== undefined) {
    if (typeof status_pagamento !== "string" || status_pagamento.trim() === "") {
      return res.status(400).json({
        erro: "status_pagamento inválido. Deve ser uma string (ex: 'PAGO' ou 'EM_ABERTO').",
      });
    }
  }

  // 3. Valida a data_vencimento (aceita null para caso a venda seja paga na hora e não tenha vencimento)
  if (data_vencimento !== undefined && data_vencimento !== null) {
    const data = new Date(data_vencimento);
    if (isNaN(data.getTime())) {
      return res.status(400).json({
        erro: "data_vencimento inválida. Informe uma data válida no formato ISO 8601.",
      });
    }
  }

  // 4. Valida os itens da venda (Crucial para não quebrar o cálculo de estoque!)
  if (itens !== undefined) {
    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        erro: "A venda deve conter pelo menos um produto na lista de itens.",
      });
    }

    // Passa um pente fino em cada produto dentro do array
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];

      if (!item.fk_produto_id_produto || isNaN(Number(item.fk_produto_id_produto)) || Number(item.fk_produto_id_produto) <= 0) {
        return res.status(400).json({
          erro: `ID do produto inválido no item da posição ${i}. Informe um inteiro positivo.`,
        });
      }

      if (!item.quantidade_vendida || isNaN(Number(item.quantidade_vendida)) || Number(item.quantidade_vendida) <= 0) {
        return res.status(400).json({
          erro: `Quantidade inválida no produto ID ${item.fk_produto_id_produto}. A quantidade deve ser maior que zero.`,
        });
      }

      if (item.preco_unitario === undefined || isNaN(Number(item.preco_unitario)) || Number(item.preco_unitario) < 0) {
        return res.status(400).json({
          erro: `Preço unitário inválido no produto ID ${item.fk_produto_id_produto}. O valor não pode ser negativo.`,
        });
      }
    }
  }

  // Se o código sobreviveu até aqui sem dar return de erro, tá liberado!
  next();
};

module.exports = validarAtualizarVenda;