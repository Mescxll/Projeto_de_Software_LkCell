// Controller Venda
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

    //  Validações básicas 
    if (!status_pagamento) {
      return res.status(400).json({ erro: "Status de pagamento é obrigatório." });
    }
    if (!fk_funcionario_id_funcionario) {
      return res.status(400).json({ erro: "Funcionário é obrigatório." });
    }
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ erro: "A venda deve conter pelo menos um produto." });
    }
    for (const item of itens) {
      if (!item.fk_produto_id_produto || !item.quantidade_vendida || item.quantidade_vendida <= 0) {
        return res.status(400).json({
          erro: "Cada item deve ter um produto e uma quantidade válida.",
        });
      }
    }

    //  Busca todos os produtos e seus estoques atuais 
    const ids = itens.map((i) => i.fk_produto_id_produto);

    const produtos = await prisma.produto.findMany({
      where: { id_produto: { in: ids } },
      include: {
        estoque: {
          orderBy: { data_hora: "desc" },
          take: 1,
        },
      },
    });

    // Verifica se todos os produtos existem
    if (produtos.length !== ids.length) {
      return res.status(404).json({ erro: "Um ou mais produtos não foram encontrados." });
    }

    // Monta mapa para acesso rápido: id_produto → produto
    const mapaProdutos = {};
    for (const p of produtos) {
      mapaProdutos[p.id_produto] = p;
    }

    //  Verifica estoque suficiente para cada item 
    for (const item of itens) {
      const produto = mapaProdutos[item.fk_produto_id_produto];
      const ultimoEstoque = produto.estoque[0];
      const estoqueDisponivel = ultimoEstoque?.estoque_atual ?? 0;

      if (item.quantidade_vendida > estoqueDisponivel) {
        return res.status(409).json({
          erro: `Estoque insuficiente para o produto "${produto.nome || produto.codigo_produto}". Disponível: ${estoqueDisponivel}, solicitado: ${item.quantidade_vendida}.`,
        });
      }
    }

    // Tudo válido — executa em transação 
    const novaVenda = await prisma.$transaction(async (tx) => {
      //  Calcula valor total da venda
      let valorTotal = 0;
      for (const item of itens) {
        const produto = mapaProdutos[item.fk_produto_id_produto];
        valorTotal += Number(produto.preco_venda) * item.quantidade_vendida;
      }

      // Cria a venda
      const venda = await tx.venda.create({
        data: {
          data_hora: new Date(),                           // sistema define automaticamente
          valor_total: valorTotal,                         // calculado pelo sistema
          status_pagamento,
          data_vencimento: data_vencimento ? new Date(data_vencimento) : null,
          fk_cliente_id_cliente: fk_cliente_id_cliente || null,
          fk_funcionario_id_funcionario,
        },
      });

      // Cria os itens da venda + registro de SAIDA no estoque
      for (const item of itens) {
        const produto = mapaProdutos[item.fk_produto_id_produto];
        const ultimoEstoque = produto.estoque[0];
        const estoqueAnterior = ultimoEstoque?.estoque_atual ?? 0;
        const novoEstoqueAtual = estoqueAnterior - item.quantidade_vendida;

        //  Item da venda — preco_unitario vem do preco_venda do produto
        await tx.itensvenda.create({
          data: {
            fk_venda_id_venda: venda.id_venda,
            fk_produto_id_produto: item.fk_produto_id_produto,
            quantidade_vendida: item.quantidade_vendida,
            preco_unitario: produto.preco_venda,
          },
        });

        // Registro de SAIDA no estoque
        await tx.estoque.create({
          data: {
            fk_produto_id: item.fk_produto_id_produto,
            fk_venda_id: venda.id_venda,
            tipo_movimento: "SAIDA",
            quantidade: item.quantidade_vendida,
            estoque_atual: novoEstoqueAtual,
            estoque_minimo: ultimoEstoque?.estoque_minimo ?? null,
            estoque_ideal: ultimoEstoque?.estoque_ideal ?? null,
          },
        });
      }

      // 4. Retorna a venda com todos os dados
      return tx.venda.findUnique({
        where: { id_venda: venda.id_venda },
        include: {
          cliente: true,
          funcionario: true,
          itensvenda: {
            include: { produto: true },
          },
        },
      });
    });

    return res.status(201).json({
      mensagem: "Venda cadastrada com sucesso!",
      venda: novaVenda,
    });
  } catch (error) {
    console.error("Erro ao cadastrar venda:", error);
    return res.status(500).json({ erro: "Erro interno no servidor ao cadastrar venda." });
  }
};

const buscarTodasVendas = async (req, res) => {
  try {
    const { cliente, funcionario, status, data_inicio, data_fim } = req.query;

    const where = {};

    // Filtro por status de pagamento
    if (status) {
      where.status_pagamento = status;
    }

    // Filtro por intervalo de data
    if (data_inicio || data_fim) {
      where.data_hora = {};
      if (data_inicio) where.data_hora.gte = new Date(data_inicio);
      if (data_fim) {
        // Inclui o dia inteiro da data_fim
        const fim = new Date(data_fim);
        fim.setHours(23, 59, 59, 999);
        where.data_hora.lte = fim;
      }
    }

    // Filtro por nome do cliente (busca parcial, case-insensitive)
    if (cliente) {
      where.cliente = {
        nome: { contains: cliente, mode: "insensitive" },
      };
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
          },
        },
      },
    });

    return res.status(200).json(vendas);
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return res.status(500).json({ erro: "Erro interno no servidor ao buscar vendas." });
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
    return res.status(500).json({ erro: "Erro interno no servidor ao buscar venda." });
  }
};

const atualizarStatusPagamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_pagamento } = req.body;

    if (!status_pagamento) {
      return res.status(400).json({ erro: "Status de pagamento é obrigatório." });
    }

    const vendaExistente = await prisma.venda.findUnique({
      where: { id_venda: parseInt(id) },
    });

    if (!vendaExistente) {
      return res.status(404).json({ erro: "Venda não encontrada." });
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
    console.error("Erro ao atualizar status da venda:", error);
    return res.status(500).json({ erro: "Erro interno no servidor ao atualizar venda." });
  }
};

// Exclui a venda e estorna o estoque de cada item com AJUSTE
const cancelarVenda = async (req, res) => {
  try {
    const { id } = req.params;
    const idVenda = parseInt(id);

    // Busca a venda com seus itens
    const venda = await prisma.venda.findUnique({
      where: { id_venda: idVenda },
      include: {
        itensvenda: {
          include: {
            produto: {
              include: {
                estoque: {
                  orderBy: { data_hora: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!venda) {
      return res.status(404).json({ erro: "Venda não encontrada." });
    }

    await prisma.$transaction(async (tx) => {
      // Estorna o estoque de cada item com registro AJUSTE
      for (const item of venda.itensvenda) {
        const ultimoEstoque = item.produto.estoque[0];
        const estoqueAnterior = ultimoEstoque?.estoque_atual ?? 0;
        const estoqueRestaurado = estoqueAnterior + item.quantidade_vendida;

        await tx.estoque.create({
          data: {
            fk_produto_id: item.fk_produto_id_produto,
            tipo_movimento: "AJUSTE",
            quantidade: item.quantidade_vendida,
            estoque_atual: estoqueRestaurado,
            estoque_minimo: ultimoEstoque?.estoque_minimo ?? null,
            estoque_ideal: ultimoEstoque?.estoque_ideal ?? null,
            observacao: `Estorno por cancelamento da venda #${idVenda}`,
          },
        });
      }

      //  Exclui a venda (itensvenda e estoque vinculado à venda
      await tx.venda.delete({
        where: { id_venda: idVenda },
      });
    });

    return res.status(200).json({
      mensagem: `Venda #${idVenda} cancelada com sucesso. Estoque estornado.`,
    });
  } catch (error) {
    console.error("Erro ao cancelar venda:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ erro: "Venda não encontrada." });
    }

    return res.status(500).json({ erro: "Erro interno no servidor ao cancelar venda." });
  }
};

module.exports = {
  cadastrarVenda,
  buscarTodasVendas,
  buscarVenda,
  atualizarStatusPagamento,
  cancelarVenda,
};