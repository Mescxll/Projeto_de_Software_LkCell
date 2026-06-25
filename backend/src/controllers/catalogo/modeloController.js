// controllers/catalogo/modeloController.js
const prisma = require("../../lib/prisma");

// GET /api/modelos?search=xxx&marca_id=x
const listarModelos = async (req, res) => {
  try {
    const { search, marca_id } = req.query;

    const where = {};

    if (marca_id) {
      where.fk_marca_id = parseInt(marca_id);
    }

    if (search) {
      where.nome = { contains: search, mode: "insensitive" };
    }

    const modelos = await prisma.modelo.findMany({
      where,
      orderBy: { nome: "asc" },
      include: {
        marca: true,
        _count: { select: { produtos: true } },
      },
    });

    return res.status(200).json(modelos);
  } catch (error) {
    console.error("Erro ao listar modelos:", error);
    return res.status(500).json({ erro: "Erro interno ao listar modelos." });
  }
};

// GET /api/modelos/:id
const buscarModelo = async (req, res) => {
  try {
    const { id } = req.params;

    const modelo = await prisma.modelo.findUnique({
      where: { id_modelo: parseInt(id) },
      include: {
        marca: true,
        _count: { select: { produtos: true } },
        produtos: {
          select: {
            id_produto: true,
            codigo_produto: true,
            nome: true,
            descricao: true,
          },
          orderBy: { nome: "asc" },
        },
      },
    });

    if (!modelo) {
      return res.status(404).json({ erro: "Modelo não encontrado." });
    }

    return res.status(200).json(modelo);
  } catch (error) {
    console.error("Erro ao buscar modelo:", error);
    return res.status(500).json({ erro: "Erro interno ao buscar modelo." });
  }
};

// POST /api/modelos
const cadastrarModelo = async (req, res) => {
  try {
    const { nome, fk_marca_id } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({ erro: "O nome do modelo é obrigatório." });
    }

    if (!fk_marca_id) {
      return res.status(400).json({ erro: "A marca é obrigatória." });
    }

    const nomeLimpo = nome.trim().toUpperCase();
    const marcaId = parseInt(fk_marca_id);

    // Verifica se a marca existe
    const marca = await prisma.marca.findUnique({
      where: { id_marca: marcaId },
    });

    if (!marca) {
      return res.status(404).json({ erro: "Marca não encontrada." });
    }

    // Verifica duplicata dentro da mesma marca (PK composta nome + fk_marca_id)
    const jaExiste = await prisma.modelo.findFirst({
      where: {
        nome: nomeLimpo,
        fk_marca_id: marcaId,
      },
    });

    if (jaExiste) {
      return res.status(409).json({
        erro: `O modelo "${nomeLimpo}" já está cadastrado para a marca "${marca.nome}".`,
      });
    }

    const modelo = await prisma.modelo.create({
      data: {
        nome: nomeLimpo,
        fk_marca_id: marcaId,
      },
      include: { marca: true },
    });

    return res.status(201).json({
      mensagem: "Modelo cadastrado com sucesso!",
      modelo,
    });
  } catch (error) {
    console.error("Erro ao cadastrar modelo:", error);
    return res.status(500).json({ erro: "Erro interno ao cadastrar modelo." });
  }
};

// PATCH /api/modelos/:id
const atualizarModelo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, fk_marca_id } = req.body;

    const modeloExistente = await prisma.modelo.findUnique({
      where: { id_modelo: parseInt(id) },
      include: { marca: true },
    });

    if (!modeloExistente) {
      return res.status(404).json({ erro: "Modelo não encontrado." });
    }

    const nomeLimpo = nome ? nome.trim().toUpperCase() : modeloExistente.nome;
    const marcaId = fk_marca_id
      ? parseInt(fk_marca_id)
      : modeloExistente.fk_marca_id;

    // Se trocou a marca, verifica se ela existe
    if (fk_marca_id && marcaId !== modeloExistente.fk_marca_id) {
      const marca = await prisma.marca.findUnique({
        where: { id_marca: marcaId },
      });
      if (!marca) {
        return res.status(404).json({ erro: "Marca não encontrada." });
      }
    }

    // Verifica conflito de nome dentro da mesma marca
    const conflito = await prisma.modelo.findFirst({
      where: {
        nome: nomeLimpo,
        fk_marca_id: marcaId,
        NOT: { id_modelo: parseInt(id) },
      },
    });

    if (conflito) {
      return res.status(409).json({
        erro: `Já existe o modelo "${nomeLimpo}" para esta marca.`,
      });
    }

    const modeloAtualizado = await prisma.modelo.update({
      where: { id_modelo: parseInt(id) },
      data: {
        nome: nomeLimpo,
        fk_marca_id: marcaId,
      },
      include: {
        marca: true,
        _count: { select: { produtos: true } },
      },
    });

    return res.status(200).json({
      mensagem: "Modelo atualizado com sucesso!",
      modelo: modeloAtualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar modelo:", error);
    return res.status(500).json({ erro: "Erro interno ao atualizar modelo." });
  }
};

// DELETE /api/modelos/:id
const deletarModelo = async (req, res) => {
  try {
    const { id } = req.params;

    const modelo = await prisma.modelo.findUnique({
      where: { id_modelo: parseInt(id) },
      include: {
        marca: true,
        _count: { select: { produtos: true } },
      },
    });

    if (!modelo) {
      return res.status(404).json({ erro: "Modelo não encontrado." });
    }

    // Bloqueia exclusão se houver produtos vinculados
    if (modelo._count.produtos > 0) {
      return res.status(409).json({
        erro: `Não é possível excluir o modelo "${modelo.nome}" (${modelo.marca.nome}) pois existem ${modelo._count.produtos} produto(s) vinculado(s) a ele.`,
      });
    }

    await prisma.modelo.delete({
      where: { id_modelo: parseInt(id) },
    });

    return res.status(200).json({ mensagem: "Modelo excluído com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar modelo:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ erro: "Modelo não encontrado." });
    }

    return res.status(500).json({ erro: "Erro interno ao deletar modelo." });
  }
};

module.exports = {
  listarModelos,
  buscarModelo,
  cadastrarModelo,
  atualizarModelo,
  deletarModelo,
};