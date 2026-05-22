// Controller Catálogo
const prisma = require("../lib/prisma");

const listarCategorias = async (req, res) => {
  try {
    const { search } = req.query;

    const categorias = await prisma.categoria.findMany({
      where: search
        ? {
            nome: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {},
      distinct: ["nome"],
      orderBy: {
        nome: "asc",
      },
      take: 10,
    });

    return res.status(200).json(categorias);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);

    return res.status(500).json({
      erro: "Erro interno ao listar categorias.",
    });
  }
};

const listarMarcas = async (req, res) => {
  try {
    const { search } = req.query;

    const marcas = await prisma.marca.findMany({
      where: search
        ? {
            nome: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {},
      distinct: ["nome"],
      orderBy: {
        nome: "asc",
      },
      take: 10,
    });

    return res.status(200).json(marcas);
  } catch (error) {
    console.error("Erro ao buscar marcas:", error);

    return res.status(500).json({
      erro: "Erro interno ao listar marcas.",
    });
  }
};

const listarModelos = async (req, res) => {
  try {
    const { marca_id, search } = req.query;

    const filtro = {};

    if (marca_id) {
      filtro.fk_marca_id = parseInt(marca_id);
    }

    if (search) {
      filtro.nome = {
        contains: search,
        mode: "insensitive",
      };
    }

    const modelos = await prisma.modelo.findMany({
      where: filtro,
      distinct: ["nome", "fk_marca_id"],
      include: {
        marca: true,
      },
      orderBy: {
        nome: "asc",
      },
      take: 10,
    });

    return res.status(200).json(modelos);
  } catch (error) {
    console.error("Erro ao buscar modelos:", error);

    return res.status(500).json({
      erro: "Erro interno ao listar modelos.",
    });
  }
};

module.exports = {
  listarCategorias,
  listarMarcas,
  listarModelos,
};
