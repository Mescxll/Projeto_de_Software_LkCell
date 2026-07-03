// controllers/compraController.js
const prisma = require("../lib/prisma");

const normalizarData = (valor) => {
  if (!valor) return null;

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return new Date(
    Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate(), 12),
  );
};

const cadastrarCompra = async (req, res) => {
  try {
    const { fk_fornecedor_id_fornecedor, prazo_entrega, itens } = req.body;

    const idsUnicos = [...new Set(itens.map((i) => i.fk_produto_id_produto))];

    const produtos = await prisma.produto.findMany({
      where: { id_produto: { in: idsUnicos } },
    });

    if (produtos.length !== idsUnicos.length) {
      return res
        .status(404)
        .json({ erro: "Um ou mais produtos não foram encontrados." });
    }

    const mapaProdutos = {};
    for (const p of produtos) {
      mapaProdutos[p.id_produto] = p;
    }

    const novaCompra = await prisma.$transaction(
      async (tx) => {
        let valorTotal = 0;
        for (const item of itens) {
          valorTotal += Number(item.preco_compra) * item.quantidade;
        }

        const compra = await tx.compra.create({
          data: {
            data_hora: new Date(),
            valor_total: valorTotal,
            prazo_entrega: normalizarData(prazo_entrega),
            fk_fornecedor_id_fornecedor,
          },
        });

        for (const item of itens) {
          // Leitura isolada: precisamos dela para garantir a consistência do cálculo de estoque
          const ultimoEstoque = await tx.estoque.findFirst({
            where: {
              fk_produto_id: item.fk_produto_id_produto,
              fk_localizacao_id: item.fk_localizacao_id,
            },
            orderBy: { data_hora: "desc" },
          });

          const novoEstoqueAtual =
            (ultimoEstoque?.estoque_atual ?? 0) + item.quantidade;

          // Execução paralela das gravações para este item
          await Promise.all([
            tx.itenscompra.create({
              data: {
                fk_compra_id_compra: compra.id_compra,
                fk_produto_id_produto: item.fk_produto_id_produto,
                fk_localizacao_id: item.fk_localizacao_id,
                quantidade: item.quantidade,
                preco_compra: item.preco_compra,
              },
            }),
            tx.estoque.create({
              data: {
                fk_produto_id: item.fk_produto_id_produto,
                fk_compra_id: compra.id_compra,
                fk_localizacao_id: item.fk_localizacao_id,
                tipo_movimento: "ENTRADA",
                quantidade: item.quantidade,
                estoque_atual: novoEstoqueAtual,
                estoque_minimo: ultimoEstoque?.estoque_minimo ?? null,
                estoque_ideal: ultimoEstoque?.estoque_ideal ?? null,
              },
            }),
            tx.produto.update({
              where: { id_produto: item.fk_produto_id_produto },
              data: { preco_custo: item.preco_compra },
            }),
          ]);
        }

        return tx.compra.findUnique({
          where: { id_compra: compra.id_compra },
          include: {
            fornecedor: true,
            itenscompra: { include: { produto: true, localizacao: true } },
          },
        });
      },
      {
        timeout: 15000, // Margem de segurança recomendada
      },
    );

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
    const { prazo_entrega, fk_fornecedor_id_fornecedor, itens } = req.body;

    const compraExistente = await prisma.compra.findUnique({
      where: { id_compra: parseInt(id) },
      include: { itenscompra: true },
    });

    if (!compraExistente) {
      return res.status(404).json({ erro: "Compra não encontrada." });
    }

    if (compraExistente.status_compra === "CANCELADA") {
      return res.status(409).json({
        erro: "Não é possível alterar uma compra cancelada. Cadastre uma nova compra.",
      });
    }

    const compraAtualizada = await prisma.$transaction(
      async (tx) => {
        await tx.compra.update({
          where: { id_compra: parseInt(id) },
          data: {
            ...(prazo_entrega !== undefined && {
              prazo_entrega: normalizarData(prazo_entrega),
            }),
            ...(fk_fornecedor_id_fornecedor !== undefined && {
              fk_fornecedor_id_fornecedor,
            }),
          },
        });

        if (itens && Array.isArray(itens) && itens.length > 0) {
          const ids = [...new Set(itens.map((i) => i.fk_produto_id_produto))];

          const produtos = await tx.produto.findMany({
            where: { id_produto: { in: ids } },
          });

          if (produtos.length !== ids.length) {
            throw new Error("Um ou mais produtos não foram encontrados.");
          }

          const mapaProdutos = {};
          for (const p of produtos) {
            mapaProdutos[p.id_produto] = p;
          }

          // Deleções em paralelo
          await Promise.all([
            tx.estoque.deleteMany({ where: { fk_compra_id: parseInt(id) } }),
            tx.itenscompra.deleteMany({
              where: { fk_compra_id_compra: parseInt(id) },
            }),
          ]);

          let valorTotal = 0;
          for (const item of itens) {
            valorTotal += Number(item.preco_compra) * item.quantidade;
          }

          for (const item of itens) {
            const ultimoEstoque = await tx.estoque.findFirst({
              where: {
                fk_produto_id: item.fk_produto_id_produto,
                fk_localizacao_id: item.fk_localizacao_id,
              },
              orderBy: { data_hora: "desc" },
            });

            const novoEstoqueAtual =
              (ultimoEstoque?.estoque_atual ?? 0) + item.quantidade;

            // Gravações em paralelo
            await Promise.all([
              tx.itenscompra.create({
                data: {
                  fk_compra_id_compra: parseInt(id),
                  fk_produto_id_produto: item.fk_produto_id_produto,
                  fk_localizacao_id: item.fk_localizacao_id,
                  quantidade: item.quantidade,
                  preco_compra: item.preco_compra,
                },
              }),
              tx.estoque.create({
                data: {
                  fk_produto_id: item.fk_produto_id_produto,
                  fk_compra_id: parseInt(id),
                  fk_localizacao_id: item.fk_localizacao_id,
                  tipo_movimento: "ENTRADA",
                  quantidade: item.quantidade,
                  estoque_atual: novoEstoqueAtual,
                  estoque_minimo: ultimoEstoque?.estoque_minimo ?? null,
                  estoque_ideal: ultimoEstoque?.estoque_ideal ?? null,
                },
              }),
              tx.produto.update({
                where: { id_produto: item.fk_produto_id_produto },
                data: { preco_custo: item.preco_compra },
              }),
            ]);
          }

          await tx.compra.update({
            where: { id_compra: parseInt(id) },
            data: { valor_total: valorTotal },
          });
        }

        return tx.compra.findUnique({
          where: { id_compra: parseInt(id) },
          include: {
            fornecedor: true,
            itenscompra: { include: { produto: true } },
            estoque: { include: { localizacao: true } },
          },
        });
      },
      {
        timeout: 15000, // Margem de segurança recomendada
      },
    );

    return res.status(200).json({
      mensagem: "Compra atualizada com sucesso!",
      compra: compraAtualizada,
    });
  } catch (error) {
    console.error("Erro ao atualizar compra:", error);

    if (error.message === "Um ou mais produtos não foram encontrados.") {
      return res.status(404).json({ erro: error.message });
    }

    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao atualizar compra." });
  }
};

const cancelarCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const idCompra = parseInt(id);

    const compra = await prisma.compra.findUnique({
      where: { id_compra: idCompra },
      include: {
        itenscompra: true,
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

    await prisma.$transaction(
      async (tx) => {
        for (const item of compra.itenscompra) {
          const ultimoEstoque = await tx.estoque.findFirst({
            where: {
              fk_produto_id: item.fk_produto_id_produto,
              fk_localizacao_id: item.fk_localizacao_id,
            },
            orderBy: { data_hora: "desc" },
          });

          const estoqueRestaurado =
            (ultimoEstoque?.estoque_atual ?? 0) - item.quantidade;

          await tx.estoque.create({
            data: {
              fk_produto_id: item.fk_produto_id_produto,
              fk_localizacao_id: item.fk_localizacao_id,
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
      },
      {
        timeout: 15000, // Margem de segurança recomendada
      },
    );

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
