// controllers/vendaController.js
const prisma = require("../lib/prisma");

const cadastrarVenda = async (req, res) => {
  try {
    const {
      status_pagamento,
      data_vencimento,
      fk_cliente_id_cliente,
      fk_funcionario_id_funcionario,
      itens,
    } = req.body;

    for (const item of itens) {
      if (!item.fk_localizacao_id) {
        return res
          .status(400)
          .json({ erro: "Cada item deve informar fk_localizacao_id." });
      }
    }

    const ids = [...new Set(itens.map((i) => i.fk_produto_id_produto))];

    const produtos = await prisma.produto.findMany({
      where: { id_produto: { in: ids } },
    });

    if (produtos.length !== ids.length) {
      return res
        .status(404)
        .json({ erro: "Um ou mais produtos não foram encontrados." });
    }

    const mapaProdutos = {};
    for (const p of produtos) {
      mapaProdutos[p.id_produto] = p;
    }

    // Pré-carrega estoques por produto+localização FORA da transação
    const estoquesCadastro = await Promise.all(
      itens.map((item) =>
        prisma.estoque.findFirst({
          where: {
            fk_produto_id: item.fk_produto_id_produto,
            fk_localizacao_id: item.fk_localizacao_id,
          },
          orderBy: { data_hora: "desc" },
        }),
      ),
    );

    const mapaEstoquesCadastro = {};
    itens.forEach((item, idx) => {
      const chave = `${item.fk_produto_id_produto}-${item.fk_localizacao_id}`;
      if (!mapaEstoquesCadastro[chave]) {
        mapaEstoquesCadastro[chave] = estoquesCadastro[idx];
      }
    });

    // Valida estoque por localização
    for (const item of itens) {
      const ultimoEstoque =
        mapaEstoquesCadastro[`${item.fk_produto_id_produto}-${item.fk_localizacao_id}`] ?? null;
      const estoqueDisponivel = ultimoEstoque?.estoque_atual ?? 0;

      if (item.quantidade_vendida > estoqueDisponivel) {
        const produto = mapaProdutos[item.fk_produto_id_produto];
        return res.status(409).json({
          erro: `Estoque insuficiente para o produto "${
            produto.nome || produto.codigo_produto
          }" na localização selecionada. Disponível: ${estoqueDisponivel}, solicitado: ${item.quantidade_vendida}.`,
        });
      }
    }

    const novaVenda = await prisma.$transaction(async (tx) => {
      let valorTotal = 0;
      for (const item of itens) {
        valorTotal +=
          Number(mapaProdutos[item.fk_produto_id_produto].preco_venda) *
          item.quantidade_vendida;
      }

      const venda = await tx.venda.create({
        data: {
          data_hora: new Date(),
          valor_total: valorTotal,
          status_pagamento,
          status_venda: "EFETUADA",
          data_vencimento: data_vencimento ? new Date(data_vencimento) : null,
          fk_cliente_id_cliente,
          fk_funcionario_id_funcionario,
        },
      });

      await tx.itensvenda.createMany({
        data: itens.map((item) => ({
          fk_venda_id_venda: venda.id_venda,
          fk_produto_id_produto: item.fk_produto_id_produto,
          fk_localizacao_id: item.fk_localizacao_id,
          quantidade_vendida: item.quantidade_vendida,
          preco_unitario: mapaProdutos[item.fk_produto_id_produto].preco_venda,
        })),
      });

      await tx.estoque.createMany({
        data: itens.map((item) => {
          const ultimoEstoque =
            mapaEstoquesCadastro[`${item.fk_produto_id_produto}-${item.fk_localizacao_id}`] ?? null;
          return {
            fk_produto_id: item.fk_produto_id_produto,
            fk_venda_id: venda.id_venda,
            fk_localizacao_id: item.fk_localizacao_id,
            tipo_movimento: "SAIDA",
            quantidade: item.quantidade_vendida,
            estoque_atual: (ultimoEstoque?.estoque_atual ?? 0) - item.quantidade_vendida,
            estoque_minimo: ultimoEstoque?.estoque_minimo ?? null,
            estoque_ideal: ultimoEstoque?.estoque_ideal ?? null,
          };
        }),
      });

      return tx.venda.findUnique({
        where: { id_venda: venda.id_venda },
        include: {
          cliente: true,
          funcionario: true,
          itensvenda: {
            include: {
              produto: true,
              localizacao: true,
            },
          },
        },
      });
    }, { timeout: 15000 });

    return res.status(201).json({
      mensagem: "Venda cadastrada com sucesso!",
      venda: novaVenda,
    });
  } catch (error) {
    console.error("Erro ao cadastrar venda:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao cadastrar venda." });
  }
};

const buscarTodasVendas = async (req, res) => {
  try {
    const {
      cliente,
      funcionario,
      status_pagamento,
      status_venda,
      data_inicio,
      data_fim,
    } = req.query;

    const where = {};

    if (status_pagamento) where.status_pagamento = status_pagamento;
    if (status_venda) where.status_venda = status_venda;

    if (data_inicio || data_fim) {
      where.data_hora = {};
      if (data_inicio) where.data_hora.gte = new Date(data_inicio);
      if (data_fim) {
        const fim = new Date(data_fim);
        fim.setHours(23, 59, 59, 999);
        where.data_hora.lte = fim;
      }
    }

    if (cliente) {
      where.cliente = { nome: { contains: cliente, mode: "insensitive" } };
    }

    if (funcionario) {
      where.funcionario = {
        nome: { contains: funcionario, mode: "insensitive" },
      };
    }

    const vendas = await prisma.venda.findMany({
      where,
      orderBy: { data_hora: "desc" },
      include: {
        cliente: true,
        funcionario: true,
        itensvenda: {
          include: {
            produto: {
              include: {
                categoria: true,
                modelo: { include: { marca: true } },
              },
            },
            localizacao: true,
          },
        },
      },
    });

    return res.status(200).json(vendas);
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao buscar vendas." });
  }
};

const buscarVenda = async (req, res) => {
  try {
    const { id } = req.params;

    const venda = await prisma.venda.findUnique({
      where: { id_venda: parseInt(id) },
      include: {
        cliente: true,
        funcionario: true,
        itensvenda: {
          include: {
            produto: {
              include: {
                categoria: true,
                modelo: { include: { marca: true } },
              },
            },
            localizacao: true,
          },
        },
        estoque: {
          include: {
            localizacao: true,
          },
        },
      },
    });

    if (!venda) {
      return res.status(404).json({ erro: "Venda não encontrada." });
    }

    return res.status(200).json(venda);
  } catch (error) {
    console.error("Erro ao buscar venda:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao buscar venda." });
  }
};

const atualizarVenda = async (req, res) => {
  try {
    const { id } = req.params;
    const idVenda = parseInt(id);
    const {
      status_pagamento,
      data_vencimento,
      fk_cliente_id_cliente,
      fk_funcionario_id_funcionario,
      itens,
    } = req.body;

    for (const item of itens) {
      if (!item.fk_localizacao_id) {
        return res
          .status(400)
          .json({ erro: "Cada item deve informar fk_localizacao_id." });
      }
    }

    const vendaExistente = await prisma.venda.findUnique({
      where: { id_venda: idVenda },
      include: { itensvenda: true },
    });

    if (!vendaExistente) {
      return res.status(404).json({ erro: "Venda não encontrada." });
    }
    if (vendaExistente.status_venda === "CANCELADA") {
      return res
        .status(409)
        .json({ erro: "Não é possível atualizar uma venda cancelada." });
    }
    if (
      vendaExistente.status_pagamento === "PAGO" &&
      status_pagamento === "EM_ABERTO"
    ) {
      return res.status(409).json({
        erro: "Não é permitido alterar o status de pagamento de 'PAGO' para 'EM_ABERTO'.",
      });
    }
    if (!itens || itens.length === 0) {
      return res
        .status(400)
        .json({ erro: "A venda deve ter pelo menos um produto." });
    }

    const ids = [...new Set(itens.map((i) => i.fk_produto_id_produto))];
    const produtos = await prisma.produto.findMany({
      where: { id_produto: { in: ids } },
    });
    if (produtos.length !== ids.length) {
      return res
        .status(404)
        .json({ erro: "Um ou mais produtos não foram encontrados." });
    }
    const mapaProdutos = {};
    for (const p of produtos) mapaProdutos[p.id_produto] = p;

    // Pré-carrega todos os estoques necessários FORA da transação
    const chavesBusca = [
      ...vendaExistente.itensvenda.map((i) => ({
        fk_produto_id: i.fk_produto_id_produto,
        fk_localizacao_id: i.fk_localizacao_id,
      })),
      ...itens.map((i) => ({
        fk_produto_id: i.fk_produto_id_produto,
        fk_localizacao_id: i.fk_localizacao_id,
      })),
    ];

    const estoquesBrutos = await Promise.all(
      chavesBusca.map((c) =>
        prisma.estoque.findFirst({
          where: {
            fk_produto_id: c.fk_produto_id,
            fk_localizacao_id: c.fk_localizacao_id,
          },
          orderBy: { data_hora: "desc" },
        }),
      ),
    );

    const mapaEstoques = {};
    chavesBusca.forEach((c, idx) => {
      const chave = `${c.fk_produto_id}-${c.fk_localizacao_id}`;
      if (!mapaEstoques[chave]) {
        mapaEstoques[chave] = estoquesBrutos[idx];
      }
    });

    const getEstoque = (produtoId, localizacaoId) =>
      mapaEstoques[`${produtoId}-${localizacaoId}`] ?? null;

    // Valida estoque para itens novos (apenas diferença positiva)
    for (const item of itens) {
      const itemAntigo = vendaExistente.itensvenda.find(
        (i) =>
          i.fk_produto_id_produto === item.fk_produto_id_produto &&
          i.fk_localizacao_id === item.fk_localizacao_id,
      );
      const qtdAntiga = itemAntigo?.quantidade_vendida ?? 0;
      const diferenca = item.quantidade_vendida - qtdAntiga;

      if (diferenca > 0) {
        const ultimoEstoque = getEstoque(item.fk_produto_id_produto, item.fk_localizacao_id);
        const disponivel = ultimoEstoque?.estoque_atual ?? 0;
        if (diferenca > disponivel) {
          const produto = mapaProdutos[item.fk_produto_id_produto];
          return res.status(409).json({
            erro: `Estoque insuficiente para "${
              produto.nome || produto.codigo_produto
            }". Disponível: ${disponivel}, necessário adicional: ${diferenca}.`,
          });
        }
      }
    }

    const vendaAtualizada = await prisma.$transaction(async (tx) => {
      // Estorna saídas anteriores — um único createMany
      await tx.estoque.createMany({
        data: vendaExistente.itensvenda.map((itemAntigo) => {
          const ultimoEstoque = getEstoque(itemAntigo.fk_produto_id_produto, itemAntigo.fk_localizacao_id);
          return {
            fk_produto_id: itemAntigo.fk_produto_id_produto,
            fk_localizacao_id: itemAntigo.fk_localizacao_id,
            tipo_movimento: "AJUSTE",
            quantidade: itemAntigo.quantidade_vendida,
            estoque_atual: (ultimoEstoque?.estoque_atual ?? 0) + itemAntigo.quantidade_vendida,
            estoque_minimo: ultimoEstoque?.estoque_minimo ?? null,
            estoque_ideal: ultimoEstoque?.estoque_ideal ?? null,
            observacao: `Estorno por atualização da venda #${idVenda}`,
          };
        }),
      });

      await tx.itensvenda.deleteMany({ where: { fk_venda_id_venda: idVenda } });
      await tx.estoque.deleteMany({
        where: { fk_venda_id: idVenda, tipo_movimento: "SAIDA" },
      });

      const valorTotal = itens.reduce(
        (acc, item) => acc + Number(item.preco_unitario) * item.quantidade_vendida,
        0,
      );

      await tx.itensvenda.createMany({
        data: itens.map((item) => ({
          fk_venda_id_venda: idVenda,
          fk_produto_id_produto: item.fk_produto_id_produto,
          fk_localizacao_id: item.fk_localizacao_id,
          quantidade_vendida: item.quantidade_vendida,
          preco_unitario: item.preco_unitario,
        })),
      });

      await tx.estoque.createMany({
        data: itens.map((item) => {
          const ultimoEstoque = getEstoque(item.fk_produto_id_produto, item.fk_localizacao_id);
          return {
            fk_produto_id: item.fk_produto_id_produto,
            fk_venda_id: idVenda,
            fk_localizacao_id: item.fk_localizacao_id,
            tipo_movimento: "SAIDA",
            quantidade: item.quantidade_vendida,
            estoque_atual: (ultimoEstoque?.estoque_atual ?? 0) - item.quantidade_vendida,
            estoque_minimo: ultimoEstoque?.estoque_minimo ?? null,
            estoque_ideal: ultimoEstoque?.estoque_ideal ?? null,
          };
        }),
      });

      return tx.venda.update({
        where: { id_venda: idVenda },
        data: {
          status_pagamento,
          data_vencimento: data_vencimento ? new Date(data_vencimento) : null,
          valor_total: valorTotal,
          fk_cliente_id_cliente,
          fk_funcionario_id_funcionario,
        },
        include: {
          cliente: true,
          funcionario: true,
          itensvenda: {
            include: {
              produto: true,
              localizacao: true,
            },
          },
        },
      });
    }, { timeout: 15000 });

    return res.status(200).json({
      mensagem: "Venda atualizada com sucesso!",
      venda: vendaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao atualizar venda:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao atualizar venda." });
  }
};

// Bloqueado se a venda estiver CANCELADA
const atualizarStatusPagamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_pagamento } = req.body;

    const vendaExistente = await prisma.venda.findUnique({
      where: { id_venda: parseInt(id) },
    });

    if (!vendaExistente) {
      return res.status(404).json({ erro: "Venda não encontrada." });
    }

    if (vendaExistente.status_venda === "CANCELADA") {
      return res.status(409).json({
        erro: "Não é possível alterar o pagamento de uma venda cancelada. Realize uma nova venda.",
      });
    }

    if (
      vendaExistente.status_pagamento === "PAGO" &&
      status_pagamento === "EM_ABERTO"
    ) {
      return res.status(409).json({
        erro: "Não é permitido alterar o status de pagamento de 'PAGO' para 'EM_ABERTO'.",
      });
    }

    const vendaAtualizada = await prisma.venda.update({
      where: { id_venda: parseInt(id) },
      data: { status_pagamento },
    });

    return res.status(200).json({
      mensagem: "Status de pagamento atualizado com sucesso!",
      venda: vendaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao atualizar status de pagamento:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao atualizar venda." });
  }
};

// - Muda status_venda para CANCELADA (irreversível)
// - Estorna o estoque de cada item com registro AJUSTE
const cancelarVenda = async (req, res) => {
  try {
    const { id } = req.params;
    const idVenda = parseInt(id);

    const venda = await prisma.venda.findUnique({
      where: { id_venda: idVenda },
      include: { itensvenda: true },
    });

    if (!venda) {
      return res.status(404).json({ erro: "Venda não encontrada." });
    }

    if (venda.status_venda === "CANCELADA") {
      return res.status(409).json({
        erro: "Esta venda já está cancelada. Para realizar uma nova venda, cadastre-a novamente.",
      });
    }

    // Pré-carrega estoques FORA da transação
    const estoquesCancelamento = await Promise.all(
      venda.itensvenda.map((item) =>
        prisma.estoque.findFirst({
          where: {
            fk_produto_id: item.fk_produto_id_produto,
            fk_localizacao_id: item.fk_localizacao_id,
          },
          orderBy: { data_hora: "desc" },
        }),
      ),
    );

    const mapaEstoquesCancelamento = {};
    venda.itensvenda.forEach((item, idx) => {
      const chave = `${item.fk_produto_id_produto}-${item.fk_localizacao_id}`;
      if (!mapaEstoquesCancelamento[chave]) {
        mapaEstoquesCancelamento[chave] = estoquesCancelamento[idx];
      }
    });

    await prisma.$transaction(async (tx) => {
      await tx.estoque.createMany({
        data: venda.itensvenda.map((item) => {
          const ultimoEstoque =
            mapaEstoquesCancelamento[`${item.fk_produto_id_produto}-${item.fk_localizacao_id}`] ?? null;
          return {
            fk_produto_id: item.fk_produto_id_produto,
            fk_localizacao_id: item.fk_localizacao_id,
            tipo_movimento: "AJUSTE",
            quantidade: item.quantidade_vendida,
            estoque_atual: (ultimoEstoque?.estoque_atual ?? 0) + item.quantidade_vendida,
            estoque_minimo: ultimoEstoque?.estoque_minimo ?? null,
            estoque_ideal: ultimoEstoque?.estoque_ideal ?? null,
            observacao: `Estorno por cancelamento da venda #${idVenda}`,
          };
        }),
      });

      await tx.venda.update({
        where: { id_venda: idVenda },
        data: { status_venda: "CANCELADA" },
      });
    }, { timeout: 15000 });

    return res.status(200).json({
      mensagem: `Venda #${idVenda} cancelada com sucesso. Estoque estornado. Para realizar uma nova venda, cadastre-a novamente.`,
    });
  } catch (error) {
    console.error("Erro ao cancelar venda:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao cancelar venda." });
  }
};

module.exports = {
  cadastrarVenda,
  buscarTodasVendas,
  buscarVenda,
  atualizarVenda,
  atualizarStatusPagamento,
  cancelarVenda,
};