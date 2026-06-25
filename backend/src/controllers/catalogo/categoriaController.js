// controllers/catalogo/categoriaController.js
const prisma = require("../../lib/prisma");

// GET /api/categorias?search=xxx
const listarCategorias = async (req, res) => {
  try {
    const { search } = req.query;

    const categorias = await prisma.categoria.findMany({
      where: search
        ? { nome: { contains: search, mode: "insensitive" } }
        : {},
      orderBy: { nome: "asc" },
      include: {
        _count: { select: { produto: true } },
      },
    });

    return res.status(200).json(categorias);
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    return res.status(500).json({ erro: "Erro interno ao listar categorias." });
  }
};

// GET /api/categorias/:id
const buscarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await prisma.categoria.findUnique({
      where: { id_categoria: parseInt(id) },
      include: {
        _count: { select: { produto: true } },
        produto: {
          select: {
            id_produto: true,
            codigo_produto: true,
            nome: true,
            descricao: true,
          },
        },
      },
    });

    if (!categoria) {
      return res.status(404).json({ erro: "Categoria não encontrada." });
    }

    return res.status(200).json(categoria);
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    return res.status(500).json({ erro: "Erro interno ao buscar categoria." });
  }
};

// POST /api/categorias
const cadastrarCategoria = async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({ erro: "O nome da categoria é obrigatório." });
    }

    const nomeLimpo = nome.trim().toUpperCase();

    const jaExiste = await prisma.categoria.findUnique({
      where: { nome: nomeLimpo },
    });

    if (jaExiste) {
      return res.status(409).json({ erro: `A categoria "${nomeLimpo}" já está cadastrada.` });
    }

    const categoria = await prisma.categoria.create({
      data: { nome: nomeLimpo },
    });

    return res.status(201).json({
      mensagem: "Categoria cadastrada com sucesso!",
      categoria,
    });
  } catch (error) {
    console.error("Erro ao cadastrar categoria:", error);
    return res.status(500).json({ erro: "Erro interno ao cadastrar categoria." });
  }
};

// PATCH /api/categorias/:id
const atualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({ erro: "O nome da categoria é obrigatório." });
    }

    const nomeLimpo = nome.trim().toUpperCase();

    const categoriaExistente = await prisma.categoria.findUnique({
      where: { id_categoria: parseInt(id) },
    });

    if (!categoriaExistente) {
      return res.status(404).json({ erro: "Categoria não encontrada." });
    }

    // Verifica se outro registro já usa esse nome
    const conflito = await prisma.categoria.findFirst({
      where: {
        nome: nomeLimpo,
        NOT: { id_categoria: parseInt(id) },
      },
    });

    if (conflito) {
      return res.status(409).json({ erro: `Já existe uma categoria com o nome "${nomeLimpo}".` });
    }

    const categoriaAtualizada = await prisma.categoria.update({
      where: { id_categoria: parseInt(id) },
      data: { nome: nomeLimpo },
    });

    return res.status(200).json({
      mensagem: "Categoria atualizada com sucesso!",
      categoria: categoriaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return res.status(500).json({ erro: "Erro interno ao atualizar categoria." });
  }
};

// DELETE /api/categorias/:id
const deletarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await prisma.categoria.findUnique({
      where: { id_categoria: parseInt(id) },
      include: { _count: { select: { produto: true } } },
    });

    if (!categoria) {
      return res.status(404).json({ erro: "Categoria não encontrada." });
    }

    // Bloqueia exclusão se houver produtos vinculados
    if (categoria._count.produto > 0) {
      return res.status(409).json({
        erro: `Não é possível excluir a categoria "${categoria.nome}" pois existem ${categoria._count.produto} produto(s) vinculado(s) a ela.`,
      });
    }

    await prisma.categoria.delete({
      where: { id_categoria: parseInt(id) },
    });

    return res.status(200).json({ mensagem: "Categoria excluída com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar categoria:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ erro: "Categoria não encontrada." });
    }

    return res.status(500).json({ erro: "Erro interno ao deletar categoria." });
  }
};

module.exports = {
  listarCategorias,
  buscarCategoria,
  cadastrarCategoria,
  atualizarCategoria,
  deletarCategoria,
};