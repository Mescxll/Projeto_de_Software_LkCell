// controllers/catalogo/compatibilidadeController.js
const prisma = require("../../lib/prisma");

// GET /api/produtos/:id/compatibilidades
// Retorna todas as compatibilidades do produto + flag compativel_todas_marcas
const listarCompatibilidades = async (req, res) => {
  try {
    const produtoId = parseInt(req.params.id);

    const produto = await prisma.produto.findUnique({
      where: { id_produto: produtoId },
      select: {
        id_produto: true,
        nome: true,
        descricao: true,
        compativel_todas_marcas: true,
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
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    return res.status(200).json(produto);
  } catch (error) {
    console.error("Erro ao listar compatibilidades:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno ao listar compatibilidades." });
  }
};

// PATCH /api/produtos/:id/compatibilidades/todas-marcas
// Alterna a flag compativel_todas_marcas do produto
const atualizarTodasMarcas = async (req, res) => {
  try {
    const produtoId = parseInt(req.params.id);
    const { compativel_todas_marcas } = req.body;

    if (typeof compativel_todas_marcas !== "boolean") {
      return res.status(400).json({
        erro: "O campo compativel_todas_marcas deve ser true ou false.",
      });
    }

    const produto = await prisma.produto.findUnique({
      where: { id_produto: produtoId },
    });

    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    // Ao desativar "todas as marcas", limpa as EXCLUSÕES pois não fazem
    // mais sentido — o produto passa a usar INCLUSÕES explícitas
    if (!compativel_todas_marcas) {
      await prisma.produto_compatibilidade.deleteMany({
        where: {
          fk_produto_id: produtoId,
          tipo: "EXCLUSAO",
        },
      });
    }

    // Ao ativar "todas as marcas", limpa as INCLUSÕES pois não fazem
    // mais sentido — o produto passa a ser universal com EXCLUSÕES
    if (compativel_todas_marcas) {
      await prisma.produto_compatibilidade.deleteMany({
        where: {
          fk_produto_id: produtoId,
          tipo: "INCLUSAO",
        },
      });
    }

    const produtoAtualizado = await prisma.produto.update({
      where: { id_produto: produtoId },
      data: { compativel_todas_marcas },
      select: {
        id_produto: true,
        nome: true,
        compativel_todas_marcas: true,
        compatibilidades: {
          include: { marca: true, modelo: { include: { marca: true } } },
          orderBy: [{ tipo: "asc" }, { id_compatibilidade: "asc" }],
        },
      },
    });

    return res.status(200).json({
      mensagem: compativel_todas_marcas
        ? "Produto definido como compatível com todas as marcas. Adicione exceções se necessário."
        : "Produto definido como compatível apenas com marcas específicas. Adicione as inclusões.",
      produto: produtoAtualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar compativel_todas_marcas:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno ao atualizar compatibilidade." });
  }
};

// POST /api/produtos/:id/compatibilidades
// Adiciona uma inclusão ou exclusão de compatibilidade
const adicionarCompatibilidade = async (req, res) => {
  try {
    const produtoId = parseInt(req.params.id);
    const { fk_marca_id, fk_modelo_id, tipo, observacao } = req.body;

    // Validações básicas
    if (!tipo || !["INCLUSAO", "EXCLUSAO"].includes(tipo)) {
      return res.status(400).json({
        erro: "O tipo deve ser INCLUSAO ou EXCLUSAO.",
      });
    }

    const produto = await prisma.produto.findUnique({
      where: { id_produto: produtoId },
    });

    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    // Garante consistência: EXCLUSAO só faz sentido se compativel_todas_marcas=true
    // e INCLUSAO só faz sentido se compativel_todas_marcas=false
    if (tipo === "EXCLUSAO" && !produto.compativel_todas_marcas) {
      return res.status(409).json({
        erro: 'Para adicionar uma exclusão, o produto deve estar marcado como "compatível com todas as marcas".',
      });
    }

    if (tipo === "INCLUSAO" && produto.compativel_todas_marcas) {
      return res.status(409).json({
        erro: 'Para adicionar uma inclusão, desative a opção "compatível com todas as marcas".',
      });
    }

    const marcaId = fk_marca_id ? parseInt(fk_marca_id) : null;
    const modeloId = fk_modelo_id ? parseInt(fk_modelo_id) : null;

    // Se informou marca, valida existência
    if (marcaId) {
      const marca = await prisma.marca.findUnique({
        where: { id_marca: marcaId },
      });
      if (!marca) {
        return res.status(404).json({ erro: "Marca não encontrada." });
      }
    }

    // Se informou modelo, valida existência e pertencimento à marca
    if (modeloId) {
      const modelo = await prisma.modelo.findUnique({
        where: { id_modelo: modeloId },
      });
      if (!modelo) {
        return res.status(404).json({ erro: "Modelo não encontrado." });
      }
      if (marcaId && modelo.fk_marca_id !== marcaId) {
        return res.status(409).json({
          erro: "O modelo informado não pertence à marca selecionada.",
        });
      }
    }

    // Modelo sem marca não é permitido
    if (modeloId && !marcaId) {
      return res.status(400).json({
        erro: "Informe a marca ao selecionar um modelo específico.",
      });
    }

    // Verifica duplicata via findFirst (substitui @@unique com NULLs)
    const jaExiste = await prisma.produto_compatibilidade.findFirst({
      where: {
        fk_produto_id: produtoId,
        fk_marca_id: marcaId,
        fk_modelo_id: modeloId,
        tipo,
      },
    });

    if (jaExiste) {
      return res.status(409).json({
        erro: "Esta compatibilidade já está cadastrada para este produto.",
      });
    }

    const compatibilidade = await prisma.produto_compatibilidade.create({
      data: {
        fk_produto_id: produtoId,
        fk_marca_id: marcaId,
        fk_modelo_id: modeloId,
        tipo,
        observacao: observacao?.trim() || null,
      },
      include: {
        marca: true,
        modelo: { include: { marca: true } },
      },
    });

    return res.status(201).json({
      mensagem: "Compatibilidade adicionada com sucesso!",
      compatibilidade,
    });
  } catch (error) {
    console.error("Erro ao adicionar compatibilidade:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno ao adicionar compatibilidade." });
  }
};

// PATCH /api/produtos/:id/compatibilidades/:id_compatibilidade
// Atualiza observação de uma compatibilidade (marca/modelo/tipo não mudam — delete e recrie)
const atualizarCompatibilidade = async (req, res) => {
  try {
    const produtoId = parseInt(req.params.id);
    const compId = parseInt(req.params.id_compatibilidade);
    const { observacao } = req.body;

    const compatibilidade = await prisma.produto_compatibilidade.findFirst({
      where: {
        id_compatibilidade: compId,
        fk_produto_id: produtoId,
      },
    });

    if (!compatibilidade) {
      return res
        .status(404)
        .json({ erro: "Compatibilidade não encontrada para este produto." });
    }

    const atualizada = await prisma.produto_compatibilidade.update({
      where: { id_compatibilidade: compId },
      data: { observacao: observacao?.trim() || null },
      include: {
        marca: true,
        modelo: { include: { marca: true } },
      },
    });

    return res.status(200).json({
      mensagem: "Compatibilidade atualizada com sucesso!",
      compatibilidade: atualizada,
    });
  } catch (error) {
    console.error("Erro ao atualizar compatibilidade:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno ao atualizar compatibilidade." });
  }
};

// DELETE /api/produtos/:id/compatibilidades/:id_compatibilidade
const removerCompatibilidade = async (req, res) => {
  try {
    const produtoId = parseInt(req.params.id);
    const compId = parseInt(req.params.id_compatibilidade);

    const compatibilidade = await prisma.produto_compatibilidade.findFirst({
      where: {
        id_compatibilidade: compId,
        fk_produto_id: produtoId,
      },
    });

    if (!compatibilidade) {
      return res
        .status(404)
        .json({ erro: "Compatibilidade não encontrada para este produto." });
    }

    await prisma.produto_compatibilidade.delete({
      where: { id_compatibilidade: compId },
    });

    return res
      .status(200)
      .json({ mensagem: "Compatibilidade removida com sucesso!" });
  } catch (error) {
    console.error("Erro ao remover compatibilidade:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno ao remover compatibilidade." });
  }
};

// GET /api/produtos/:id/compativel?marca_id=x&modelo_id=y
// Verifica se o produto é compatível com uma determinada marca/modelo
const verificarCompatibilidade = async (req, res) => {
  try {
    const produtoId = parseInt(req.params.id);
    const marcaId = req.query.marca_id ? parseInt(req.query.marca_id) : null;
    const modeloId = req.query.modelo_id ? parseInt(req.query.modelo_id) : null;

    if (!marcaId) {
      return res
        .status(400)
        .json({ erro: "Informe ao menos marca_id para verificar." });
    }

    const produto = await prisma.produto.findUnique({
      where: { id_produto: produtoId },
      select: {
        id_produto: true,
        nome: true,
        compativel_todas_marcas: true,
        compatibilidades: {
          include: { marca: true, modelo: true },
        },
      },
    });

    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    let compativel = false;
    let motivo = "";

    if (produto.compativel_todas_marcas) {
      // Compatível com tudo — verifica se há EXCLUSÃO para esta marca/modelo
      const exclusaoModelo = modeloId
        ? produto.compatibilidades.find(
            (c) =>
              c.tipo === "EXCLUSAO" &&
              c.fk_marca_id === marcaId &&
              c.fk_modelo_id === modeloId,
          )
        : null;

      const exclusaoMarca = produto.compatibilidades.find(
        (c) =>
          c.tipo === "EXCLUSAO" &&
          c.fk_marca_id === marcaId &&
          c.fk_modelo_id === null,
      );

      if (exclusaoModelo) {
        compativel = false;
        motivo = `Produto explicitamente incompatível com este modelo (${exclusaoModelo.marca?.nome} - ${exclusaoModelo.modelo?.nome}).`;
      } else if (exclusaoMarca) {
        compativel = false;
        motivo = `Produto explicitamente incompatível com a marca ${exclusaoMarca.marca?.nome}.`;
      } else {
        compativel = true;
        motivo =
          "Produto compatível com todas as marcas, sem exceções para esta seleção.";
      }
    } else {
      // Compatível apenas com inclusões explícitas
      const inclusaoModelo = modeloId
        ? produto.compatibilidades.find(
            (c) =>
              c.tipo === "INCLUSAO" &&
              c.fk_marca_id === marcaId &&
              c.fk_modelo_id === modeloId,
          )
        : null;

      const inclusaoMarca = produto.compatibilidades.find(
        (c) =>
          c.tipo === "INCLUSAO" &&
          c.fk_marca_id === marcaId &&
          c.fk_modelo_id === null,
      );

      if (inclusaoModelo) {
        compativel = true;
        motivo = `Compatível com este modelo específico (${inclusaoModelo.marca?.nome} - ${inclusaoModelo.modelo?.nome}).`;
      } else if (inclusaoMarca) {
        compativel = true;
        motivo = `Compatível com todos os modelos da marca ${inclusaoMarca.marca?.nome}.`;
      } else {
        compativel = false;
        motivo =
          "Produto não possui inclusão de compatibilidade para esta marca/modelo.";
      }
    }

    return res.status(200).json({ compativel, motivo });
  } catch (error) {
    console.error("Erro ao verificar compatibilidade:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno ao verificar compatibilidade." });
  }
};

module.exports = {
  listarCompatibilidades,
  atualizarTodasMarcas,
  adicionarCompatibilidade,
  atualizarCompatibilidade,
  removerCompatibilidade,
  verificarCompatibilidade,
};
