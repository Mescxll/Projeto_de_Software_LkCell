// controllers/catalogo/produtoController.js
const prisma = require("../../lib/prisma");

const cadastrarProduto = async (req, res) => {
  try {
    const {
      codigo_produto,
      descricao,
      fk_categoria_id,
      fk_modelo_id,
      compativel_todas_marcas,
      estoque_minimo,
      estoque_ideal,
      // Array de { fk_localizacao_id, quantidade }
      // Array vazio ou ausente = produto cadastrado com estoque zero
      estoque_entradas = [],
      preco_compra,
      preco_custo,
      preco_venda,
      margem_lucro,
    } = req.body;

    const categoriaId = parseInt(fk_categoria_id);
    const modeloId = fk_modelo_id ? parseInt(fk_modelo_id) : null;
    const estoqueMinimoInt = estoque_minimo ? parseInt(estoque_minimo) : null;
    const estoqueIdealInt = estoque_ideal ? parseInt(estoque_ideal) : null;

    const categoriaDB = await prisma.categoria.findUnique({
      where: { id_categoria: categoriaId },
    });

    if (!categoriaDB) {
      return res.status(404).json({ erro: "Categoria não encontrada." });
    }

    let modeloDB = null;
    if (modeloId) {
      modeloDB = await prisma.modelo.findUnique({
        where: { id_modelo: modeloId },
        include: { marca: true },
      });
      if (!modeloDB) {
        return res.status(404).json({ erro: "Modelo não encontrado." });
      }
    }

    const nomeProduto = modeloDB
      ? `${modeloDB.marca.nome} ${modeloDB.nome}`
      : descricao.trim();

    // Valida localizações informadas antes de entrar na transação
    if (estoque_entradas.length > 0) {
      const ids = estoque_entradas.map((e) => parseInt(e.fk_localizacao_id));

      const localizacoesDB = await prisma.localizacao.findMany({
        where: { id_localizacao: { in: ids } },
      });

      if (localizacoesDB.length !== ids.length) {
        return res.status(404).json({
          erro: "Uma ou mais localizações informadas não foram encontradas.",
        });
      }
    }

    const [novoProduto] = await prisma.$transaction(async (tx) => {
      const produto = await tx.produto.create({
        data: {
          codigo_produto: codigo_produto.trim(),
          nome: nomeProduto,
          descricao: descricao.trim(),
          fk_categoria_id: categoriaDB.id_categoria,
          fk_modelo_id: modeloDB?.id_modelo ?? null,
          compativel_todas_marcas: compativel_todas_marcas === true,
          preco_venda: parseFloat(preco_venda),
          preco_compra: preco_compra ? parseFloat(preco_compra) : null,
          preco_custo: preco_custo ? parseFloat(preco_custo) : null,
          margem_lucro: margem_lucro ? parseFloat(margem_lucro) : null,
        },
        include: {
          categoria: true,
          modelo: { include: { marca: true } },
        },
      });

      if (estoque_entradas.length === 0) {
        // Estoque zero — um único registro sem localização (saldo inicial = 0)
        await tx.estoque.create({
          data: {
            fk_produto_id: produto.id_produto,
            tipo_movimento: "ENTRADA",
            quantidade: 0,
            estoque_atual: 0,
            estoque_minimo: estoqueMinimoInt,
            estoque_ideal: estoqueIdealInt,
            observacao: "Cadastro inicial do produto",
          },
        });
      } else {
        // Um registro de ENTRADA por localização, saldo acumulado
        let saldoAcumulado = 0;
        for (const entrada of estoque_entradas) {
          const qty = parseInt(entrada.quantidade);
          saldoAcumulado += qty;

          await tx.estoque.create({
            data: {
              fk_produto_id: produto.id_produto,
              fk_localizacao_id: parseInt(entrada.fk_localizacao_id),
              tipo_movimento: "ENTRADA",
              quantidade: qty,
              estoque_atual: saldoAcumulado,
              estoque_minimo: estoqueMinimoInt,
              estoque_ideal: estoqueIdealInt,
              observacao: "Cadastro inicial do produto",
            },
          });
        }
      }

      return [produto];
    });

    return res.status(201).json({
      mensagem: "Produto cadastrado com sucesso!",
      produto: novoProduto,
    });
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);

    if (error.code === "P2002" && error.message.includes("codigo_produto")) {
      return res.status(409).json({
        erro: "Este Código de Produto já está cadastrado no sistema!",
      });
    }

    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao cadastrar produto." });
  }
};

const atualizarProduto = async (req, res) => {
  try {
    const { uuid } = req.params;
    const {
      descricao,
      fk_categoria_id,
      fk_modelo_id,
      compativel_todas_marcas,
      preco_compra,
      preco_custo,
      preco_venda,
    } = req.body;

    const isNumericId = /^\d+$/.test(String(uuid));
    const whereIdentifier = isNumericId
      ? { id_produto: parseInt(uuid) }
      : { codigo_produto: uuid };

    const produtoExistente = await prisma.produto.findUnique({
      where: whereIdentifier,
      include: {
        categoria: true,
        modelo: { include: { marca: true } },
      },
    });

    if (!produtoExistente) {
      return res
        .status(404)
        .json({ erro: "Produto não encontrado na base de dados." });
    }

    const updateData = {};

    if (descricao !== undefined) updateData.descricao = descricao.trim();
    if (preco_venda !== undefined)
      updateData.preco_venda = parseFloat(preco_venda);
    if (preco_compra !== undefined)
      updateData.preco_compra =
        preco_compra === null ? null : parseFloat(preco_compra);
    if (preco_custo !== undefined)
      updateData.preco_custo =
        preco_custo === null ? null : parseFloat(preco_custo);
    if (compativel_todas_marcas !== undefined)
      updateData.compativel_todas_marcas = compativel_todas_marcas === true;

    if (fk_categoria_id !== undefined) {
      const categoriaDB = await prisma.categoria.findUnique({
        where: { id_categoria: parseInt(fk_categoria_id) },
      });
      if (!categoriaDB) {
        return res.status(404).json({ erro: "Categoria não encontrada." });
      }
      updateData.fk_categoria_id = categoriaDB.id_categoria;
    }

    if (fk_modelo_id !== undefined) {
      if (fk_modelo_id === null) {
        updateData.fk_modelo_id = null;
        updateData.nome = descricao?.trim() ?? produtoExistente.descricao;
      } else {
        const modeloDB = await prisma.modelo.findUnique({
          where: { id_modelo: parseInt(fk_modelo_id) },
          include: { marca: true },
        });
        if (!modeloDB) {
          return res.status(404).json({ erro: "Modelo não encontrado." });
        }
        updateData.fk_modelo_id = modeloDB.id_modelo;
        updateData.nome = `${modeloDB.marca.nome} ${modeloDB.nome}`;
      }
    }

    const produtoAtualizado = await prisma.produto.update({
      where: { id_produto: produtoExistente.id_produto },
      data: updateData,
      include: {
        categoria: true,
        modelo: { include: { marca: true } },
      },
    });

    return res.status(200).json({
      mensagem: "Produto atualizado com sucesso!",
      produto: produtoAtualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        erro: "Produto não encontrado na base de dados para atualização.",
      });
    }

    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao atualizar produto." });
  }
};

const buscarEstoquePorLocalizacao = async (req, res) => {
  try {
    const produtoId = parseInt(req.params.id);

    const registros = await prisma.estoque.findMany({
      where: { fk_produto_id: produtoId },
      orderBy: { data_hora: "desc" },
      include: { localizacao: true },
    });

    const mapaLocalizacoes = new Map();
    for (const reg of registros) {
      const chave = reg.fk_localizacao_id ?? "sem_localizacao";
      if (!mapaLocalizacoes.has(chave)) {
        mapaLocalizacoes.set(chave, {
          id_localizacao: reg.fk_localizacao_id,
          localizacao: reg.localizacao?.localizacao ?? "Sem localização",
          estoque_atual: reg.estoque_atual,
        });
      }
    }

    const resultado = Array.from(mapaLocalizacoes.values())
      .filter((l) => l.estoque_atual > 0)
      .sort((a, b) =>
        (a.localizacao ?? "").localeCompare(b.localizacao ?? "", "pt-BR"),
      );

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao buscar estoque por localização:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno ao buscar estoque por localização." });
  }
};

const buscarProduto = async (req, res) => {
  try {
    const { uuid } = req.params;

    const isNumericId = /^\d+$/.test(String(uuid));
    const whereIdentifier = isNumericId
      ? { id_produto: parseInt(uuid) }
      : { codigo_produto: uuid };

    const produto = await prisma.produto.findUnique({
      where: whereIdentifier,
      include: {
        categoria: true,
        modelo: { include: { marca: true } },
        itenscompra: true,
        itensvenda: true,
        estoque: {
          orderBy: { data_hora: "desc" },
          take: 1,
        },
        compatibilidades: {
          include: {
            marca: true,
            modelo: { include: { marca: true } },
          },
          orderBy: [{ tipo: "asc" }, { id_compatibilidade: "asc" }],
        },
      },
    });

    if (!produto) {
      return res
        .status(404)
        .json({ erro: "Produto não encontrado na base de dados." });
    }

    return res.status(200).json(produto);
  } catch (error) {
    console.error("Erro ao buscar o produto:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao buscar o produto." });
  }
};

const buscarTodosProdutos = async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany({
      include: {
        categoria: true,
        modelo: { include: { marca: true } },
        itenscompra: true,
        itensvenda: true,
        estoque: {
          orderBy: { data_hora: "desc" },
          take: 1,
        },
        _count: { select: { compatibilidades: true } },
      },
    });

    return res.status(200).json(produtos);
  } catch (error) {
    console.error("Erro ao buscar todos os produtos:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao listar produtos." });
  }
};

const deletarProduto = async (req, res) => {
  try {
    const { uuid } = req.params;

    const isNumericId = /^\d+$/.test(String(uuid));
    const whereIdentifier = isNumericId
      ? { id_produto: parseInt(uuid) }
      : { codigo_produto: uuid };

    await prisma.produto.delete({
      where: whereIdentifier,
    });

    return res.status(200).json({ mensagem: "Produto deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);

    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ erro: "Produto não encontrado na base de dados." });
    }

    if (error.code === "P2003") {
      return res.status(409).json({
        erro: "Não é possível excluir o produto pois existem compras ou vendas vinculadas a ele.",
      });
    }

    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao deletar produto." });
  }
};

module.exports = {
  buscarTodosProdutos,
  buscarEstoquePorLocalizacao,
  cadastrarProduto,
  atualizarProduto,
  buscarProduto,
  deletarProduto,
};