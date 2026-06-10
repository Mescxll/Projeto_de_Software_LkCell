// Controller Compra
const prisma = require("../lib/prisma");

const cadastrarCompra = async (req, res) => {
  try {
    const {
      fk_fornecedor_id_fornecedor,
      prazo_entrega,
      itens, // [{ fk_produto_id_produto, quantidade, preco_compra, fk_localizacao_id? }]
    } = req.body;

    // Busca todos os produtos e seus estoques atuais
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

    if (produtos.length !== ids.length) {
      return res
        .status(404)
        .json({ erro: "Um ou mais produtos não foram encontrados." });
    }

    const mapaProdutos = {};
    for (const p of produtos) {
      mapaProdutos[p.id_produto] = p;
    }

    // Executa tudo em transação
    const novaCompra = await prisma.$transaction(async (tx) => {
      // Calcula valor total com base nos preços de compra informados
      let valorTotal = 0;
      for (const item of itens) {
        valorTotal += Number(item.preco_compra) * item.quantidade;
      }

      // Cria o registro de compra
      const compra = await tx.compra.create({
        data: {
          data_hora: new Date(),
          valor_total: valorTotal,
          prazo_entrega: prazo_entrega ? new Date(prazo_entrega) : null,
          fk_fornecedor_id_fornecedor,
        },
      });

      // Cria itens + registro ENTRADA no estoque para cada produto
      for (const item of itens) {
        const produto = mapaProdutos[item.fk_produto_id_produto];
        const ultimoEstoque = produto.estoque[0];
        const novoEstoqueAtual =
          (ultimoEstoque?.estoque_atual ?? 0) + item.quantidade;

        await tx.itenscompra.create({
          data: {
            fk_compra_id_compra: compra.id_compra,
            fk_produto_id_produto: item.fk_produto_id_produto,
            quantidade: item.quantidade,
            preco_compra: item.preco_compra,
          },
        });

        await tx.estoque.create({
          data: {
            fk_produto_id: item.fk_produto_id_produto,
            fk_compra_id: compra.id_compra,
            // fk_localizacao_id agora vem por item — cada produto pode ter sua localização
            fk_localizacao_id: item.fk_localizacao_id ?? null,
            tipo_movimento: "ENTRADA",
            quantidade: item.quantidade,
            estoque_atual: novoEstoqueAtual,
            estoque_minimo: ultimoEstoque?.estoque_minimo ?? null,
            estoque_ideal: ultimoEstoque?.estoque_ideal ?? null,
          },
        });

        // Atualiza o preco_custo do produto com o valor mais recente
        await tx.produto.update({
          where: { id_produto: item.fk_produto_id_produto },
          data: { preco_custo: item.preco_compra },
        });
      }

      return tx.compra.findUnique({
        where: { id_compra: compra.id_compra },
        include: {
          fornecedor: true,
          itenscompra: { include: { produto: true } },
        },
      });
    });

    return res.status(201).json({
      mensagem: "Compra cadastrada com sucesso!",
      compra: novaCompra,
    });
  } catch (error) {
    console.error("Erro ao cadastrar compra:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao cadastrar compra." });
  }
};

const buscarTodasCompras = async (req, res) => {
  try {
    const { fornecedor, data_inicio, data_fim } = req.query;

    const where = {};

    if (data_inicio || data_fim) {
      where.data_hora = {};
      if (data_inicio) where.data_hora.gte = new Date(data_inicio);
      if (data_fim) {
        const fim = new Date(data_fim);
        fim.setHours(23, 59, 59, 999);
        where.data_hora.lte = fim;
      }
    }

    if (fornecedor) {
      where.fornecedor = {
        razao_social: { contains: fornecedor, mode: "insensitive" },
      };
    }

    const compras = await prisma.compra.findMany({
      where,
      orderBy: { data_hora: "desc" },
      include: {
        fornecedor: true,
        itenscompra: {
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

    return res.status(200).json(compras);
  } catch (error) {
    console.error("Erro ao buscar compras:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao buscar compras." });
  }
};

const buscarCompra = async (req, res) => {
  try {
    const { id } = req.params;

    const compra = await prisma.compra.findUnique({
      where: { id_compra: parseInt(id) },
      include: {
        fornecedor: true,
        itenscompra: {
          include: {
            produto: {
              include: {
                categoria: true,
                modelo: { include: { marca: true } },
              },
            },
          },
        },
        estoque: {
          // 👈 adicione
          include: {
            localizacao: true,
          },
        },
      },
    });

    if (!compra) {
      return res.status(404).json({ erro: "Compra não encontrada." });
    }

    return res.status(200).json(compra);
  } catch (error) {
    console.error("Erro ao buscar compra:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao buscar compra." });
  }
};

const atualizarCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const { prazo_entrega, fk_fornecedor_id_fornecedor } = req.body;

    const compraExistente = await prisma.compra.findUnique({
      where: { id_compra: parseInt(id) },
    });

    if (!compraExistente) {
      return res.status(404).json({ erro: "Compra não encontrada." });
    }

    if (compraExistente.status_compra === "CANCELADA") {
      return res.status(409).json({
        erro: "Não é possível alterar uma compra cancelada. Cadastre uma nova compra.",
      });
    }

    const compraAtualizada = await prisma.compra.update({
      where: { id_compra: parseInt(id) },
      data: {
        ...(prazo_entrega !== undefined && {
          prazo_entrega: prazo_entrega ? new Date(prazo_entrega) : null,
        }),
        ...(fk_fornecedor_id_fornecedor !== undefined && {
          fk_fornecedor_id_fornecedor,
        }),
      },
      include: {
        fornecedor: true,
        itenscompra: { include: { produto: true } },
      },
    });

    return res.status(200).json({
      mensagem: "Compra atualizada com sucesso!",
      compra: compraAtualizada,
    });
  } catch (error) {
    console.error("Erro ao atualizar compra:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao atualizar compra." });
  }
};

// - Muda status_compra para CANCELADA (irreversível)
// - Estorna o estoque de cada item com registro AJUSTE
const cancelarCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const idCompra = parseInt(id);

    const compra = await prisma.compra.findUnique({
      where: { id_compra: idCompra },
      include: {
        itenscompra: {
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

    if (!compra) {
      return res.status(404).json({ erro: "Compra não encontrada." });
    }

    if (compra.status_compra === "CANCELADA") {
      return res.status(409).json({
        erro: "Esta compra já está cancelada. Para registrar uma nova entrada, cadastre uma nova compra.",
      });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of compra.itenscompra) {
        const ultimoEstoque = item.produto.estoque[0];
        const estoqueRestaurado =
          (ultimoEstoque?.estoque_atual ?? 0) - item.quantidade;

        await tx.estoque.create({
          data: {
            fk_produto_id: item.fk_produto_id_produto,
            fk_localizacao_id: ultimoEstoque?.fk_localizacao_id ?? null,
            tipo_movimento: "AJUSTE",
            quantidade: item.quantidade,
            estoque_atual: estoqueRestaurado,
            estoque_minimo: ultimoEstoque?.estoque_minimo ?? null,
            estoque_ideal: ultimoEstoque?.estoque_ideal ?? null,
            observacao: `Estorno por cancelamento da compra #${idCompra}`,
          },
        });
      }

      await tx.compra.update({
        where: { id_compra: idCompra },
        data: { status_compra: "CANCELADA" },
      });
    });

    return res.status(200).json({
      mensagem: `Compra #${idCompra} cancelada com sucesso. Estoque estornado. Para registrar uma nova entrada, cadastre uma nova compra.`,
    });
  } catch (error) {
    console.error("Erro ao cancelar compra:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao cancelar compra." });
  }
};

module.exports = {
  cadastrarCompra,
  buscarTodasCompras,
  buscarCompra,
  atualizarCompra,
  cancelarCompra,
};
