// controllers/localizacaoController.js
const prisma = require("../lib/prisma");

const cadastrarLocalizacao = async (req, res) => {
  try {
    const { localizacao } = req.body;

    const novaLocalizacao = await prisma.localizacao.create({
      data: { localizacao: localizacao.trim() },
    });

    return res.status(201).json({
      mensagem: "Localização cadastrada com sucesso!",
      localizacao: novaLocalizacao,
    });
  } catch (error) {
    console.error("Erro ao cadastrar localização:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao cadastrar localização." });
  }
};

const buscarTodasLocalizacoes = async (req, res) => {
  try {
    const localizacoes = await prisma.localizacao.findMany({
      orderBy: { localizacao: "asc" },
    });

    return res.status(200).json(localizacoes);
  } catch (error) {
    console.error("Erro ao buscar localizações:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao buscar localizações." });
  }
};

const buscarLocalizacao = async (req, res) => {
  try {
    const { id } = req.params;

    const localizacao = await prisma.localizacao.findUnique({
      where: { id_localizacao: parseInt(id) },
      include: { estoque: true },
    });

    if (!localizacao) {
      return res.status(404).json({ erro: "Localização não encontrada." });
    }

    return res.status(200).json(localizacao);
  } catch (error) {
    console.error("Erro ao buscar localização:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao buscar localização." });
  }
};

const atualizarLocalizacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { localizacao } = req.body;

    const localizacaoExistente = await prisma.localizacao.findUnique({
      where: { id_localizacao: parseInt(id) },
    });

    if (!localizacaoExistente) {
      return res.status(404).json({ erro: "Localização não encontrada." });
    }

    const localizacaoAtualizada = await prisma.localizacao.update({
      where: { id_localizacao: parseInt(id) },
      data: { localizacao: localizacao.trim() },
    });

    return res.status(200).json({
      mensagem: "Localização atualizada com sucesso!",
      localizacao: localizacaoAtualizada,
    });
  } catch (error) {
    console.error("Erro ao atualizar localização:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao atualizar localização." });
  }
};

const deletarLocalizacao = async (req, res) => {
  try {
    const { id } = req.params;

    const localizacaoExistente = await prisma.localizacao.findUnique({
      where: { id_localizacao: parseInt(id) },
    });

    if (!localizacaoExistente) {
      return res.status(404).json({ erro: "Localização não encontrada." });
    }

    await prisma.localizacao.delete({
      where: { id_localizacao: parseInt(id) },
    });

    return res
      .status(200)
      .json({ mensagem: "Localização deletada com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar localização:", error);

    if (error.code === "P2003") {
      return res.status(409).json({
        erro: "Não é possível excluir a localização pois existem registros de estoque vinculados a ela.",
      });
    }

    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao deletar localização." });
  }
};

module.exports = {
  cadastrarLocalizacao,
  buscarTodasLocalizacoes,
  buscarLocalizacao,
  atualizarLocalizacao,
  deletarLocalizacao,
};