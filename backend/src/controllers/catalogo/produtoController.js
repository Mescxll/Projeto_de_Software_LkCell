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
      estoque_atual,
      preco_compra,
      preco_custo,
      preco_venda,
      margem_lucro,
    } = req.body;

    const categoriaId = parseInt(fk_categoria_id);
    const modeloId = parseInt(fk_modelo_id);

    const estoqueAtualInt = parseInt(estoque_atual) || 0;
    const estoqueMinimoInt = estoque_minimo ? parseInt(estoque_minimo) : null;
    const estoqueIdealInt = estoque_ideal ? parseInt(estoque_ideal) : null;

    // Categoria e Modelo agora são SOMENTE seleção — valida existência,
    // não cria automaticamente. Marca é resolvida via modelo.fk_marca_id,
    // já que produto não guarda fk_marca_id diretamente.
    const [categoriaDB, modeloDB] = await Promise.all([
      prisma.categoria.findUnique({ where: { id_categoria: categoriaId } }),
      prisma.modelo.findUnique({
        where: { id_modelo: modeloId },
        include: { marca: true },
      }),
    ]);

    if (!categoriaDB) {
      return res.status(404).json({ erro: "Categoria não encontrada." });
    }

    if (!modeloDB) {
      return res.status(404).json({ erro: "Modelo não encontrado." });
    }

    // Criação do produto + registro inicial de estoque em uma única transação
    const [novoProduto] = await prisma.$transaction(async (tx) => {
      const produto = await tx.produto.create({
        data: {
          codigo_produto: codigo_produto.trim(),
          nome: `${modeloDB.marca.nome} ${modeloDB.nome}`,
          descricao: descricao.trim(),
          fk_categoria_id: categoriaDB.id_categoria,
          fk_modelo_id: modeloDB.id_modelo,
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

      // Registro inicial de estoque — sempre gerado ao cadastrar um produto
      await tx.estoque.create({
        data: {
          fk_produto_id: produto.id_produto,
          tipo_movimento: "ENTRADA",
          quantidade: estoqueAtualInt,
          estoque_atual: estoqueAtualInt,
          estoque_minimo: estoqueMinimoInt,
          estoque_ideal: estoqueIdealInt,
          observacao: "Cadastro inicial do produto",
        },
      });

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
      nome_categoria,
      compativel_todas_marcas,
      preco_compra,
      preco_custo,
      preco_venda,
    } = req.body;

    // Busca inteligente por ID numérico ou código do produto
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

    // Categoria
    if (nome_categoria !== undefined) {
      const catLimpa = nome_categoria.trim().toUpperCase();
      let catDB = await prisma.categoria.findUnique({
        where: { nome: catLimpa },
      });
      if (!catDB)
        catDB = await prisma.categoria.create({ data: { nome: catLimpa } });
      updateData.fk_categoria_id = catDB.id_categoria;
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
        (a.localizacao ?? "").localeCompare(b.localizacao ?? "", "pt-BR")
      );

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao buscar estoque por localização:", error);
    return res.status(500).json({ erro: "Erro interno ao buscar estoque por localização." });
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
        // Retorna apenas o registro mais recente para saber o estoque atual
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
        // Retorna apenas o registro mais recente de cada produto
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