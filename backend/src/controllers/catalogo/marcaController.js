// controllers/catalogo/marcaController.js
const prisma = require("../../lib/prisma");

// GET /api/marcas?search=xxx
const listarMarcas = async (req, res) => {
  try {
    const { search } = req.query;

    const marcas = await prisma.marca.findMany({
      where: search
        ? { nome: { contains: search, mode: "insensitive" } }
        : {},
      orderBy: { nome: "asc" },
      include: {
        _count: {
          select: {
            modelos: true,
          },
        },
      },
    });

    return res.status(200).json(marcas);
  } catch (error) {
    console.error("Erro ao listar marcas:", error);
    return res.status(500).json({ erro: "Erro interno ao listar marcas." });
  }
};

// GET /api/marcas/:id
const buscarMarca = async (req, res) => {
  try {
    const { id } = req.params;

    const marca = await prisma.marca.findUnique({
      where: { id_marca: parseInt(id) },
      include: {
        _count: { select: { modelos: true } },
        modelos: {
          orderBy: { nome: "asc" },
          include: {
            _count: { select: { produtos: true } },
            produtos: {
              select: {
                id_produto: true,
                codigo_produto: true,
                nome: true,
                descricao: true,
                categoria: {
                  select: {
                    id_categoria: true,
                    nome: true,
                  },
                },
              },
              orderBy: { nome: "asc" },
            },
          },
        },
      },
    });

    if (!marca) {
      return res.status(404).json({ erro: "Marca não encontrada." });
    }

    return res.status(200).json(marca);
  } catch (error) {
    console.error("Erro ao buscar marca:", error);
    return res.status(500).json({ erro: "Erro interno ao buscar marca." });
  }
};

// POST /api/marcas
const cadastrarMarca = async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({ erro: "O nome da marca é obrigatório." });
    }

    const nomeLimpo = nome.trim().toUpperCase();

    const jaExiste = await prisma.marca.findUnique({
      where: { nome: nomeLimpo },
    });

    if (jaExiste) {
      return res.status(409).json({
        erro: `A marca "${nomeLimpo}" já está cadastrada.`,
      });
    }

    const marca = await prisma.marca.create({
      data: { nome: nomeLimpo },
    });

    return res.status(201).json({
      mensagem: "Marca cadastrada com sucesso!",
      marca,
    });
  } catch (error) {
    console.error("Erro ao cadastrar marca:", error);
    return res.status(500).json({ erro: "Erro interno ao cadastrar marca." });
  }
};

// PATCH /api/marcas/:id
const atualizarMarca = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({ erro: "O nome da marca é obrigatório." });
    }

    const nomeLimpo = nome.trim().toUpperCase();

    const marcaExistente = await prisma.marca.findUnique({
      where: { id_marca: parseInt(id) },
    });

    if (!marcaExistente) {
      return res.status(404).json({ erro: "Marca não encontrada." });
    }

    // Verifica se outro registro já usa esse nome
    const conflito = await prisma.marca.findFirst({
      where: {
        nome: nomeLimpo,
        NOT: { id_marca: parseInt(id) },
      },
    });

    if (conflito) {
      return res.status(409).json({
        erro: `Já existe uma marca com o nome "${nomeLimpo}".`,
      });
    }

    const marcaAtualizada = await prisma.marca.update({
      where: { id_marca: parseInt(id) },
      data: { nome: nomeLimpo },
      include: {
        _count: { select: { modelos: true } },
      },
    });

    return res.status(200).json({
      mensagem: "Marca atualizada com sucesso!",
      marca: marcaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao atualizar marca:", error);
    return res.status(500).json({ erro: "Erro interno ao atualizar marca." });
  }
};

// DELETE /api/marcas/:id
const deletarMarca = async (req, res) => {
  try {
    const { id } = req.params;

    const marca = await prisma.marca.findUnique({
      where: { id_marca: parseInt(id) },
      include: {
        _count: { select: { modelos: true } },
      },
    });

    if (!marca) {
      return res.status(404).json({ erro: "Marca não encontrada." });
    }

    // Bloqueia exclusão se houver modelos vinculados
    if (marca._count.modelos > 0) {
      return res.status(409).json({
        erro: `Não é possível excluir a marca "${marca.nome}" pois existem ${marca._count.modelos} modelo(s) vinculado(s) a ela. Exclua os modelos primeiro.`,
      });
    }

    await prisma.marca.delete({
      where: { id_marca: parseInt(id) },
    });

    return res.status(200).json({ mensagem: "Marca excluída com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar marca:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ erro: "Marca não encontrada." });
    }

    return res.status(500).json({ erro: "Erro interno ao deletar marca." });
  }
};

module.exports = {
  listarMarcas,
  buscarMarca,
  cadastrarMarca,
  atualizarMarca,
  deletarMarca,
};
