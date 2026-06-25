// controllers/funcionarioController.js
const prisma = require("../lib/prisma");
const formatarNome = require("../utils/formatarNome");

const cadastrarFuncionario = async (req, res) => {
  try {
    const { nome, data_nascimento } = req.body;

    // Limpeza e Padronização
    const nomeLimpo = formatarNome(nome);

    // Convertendo para objeto Date com a blindagem de fuso horário
    const dataAniversarioLimpa = data_nascimento
      ? new Date(`${data_nascimento}T12:00:00Z`)
      : null;

    const novoFuncionario = await prisma.funcionario.create({
      data: {
        nome: nomeLimpo,
        data_aniversario: dataAniversarioLimpa,
      },
    });

    return res.status(201).json({
      mensagem: "Funcionário cadastrado com sucesso!",
      funcionario: novoFuncionario,
    });
  } catch (error) {
    console.error("Erro Prisma ao salvar funcionário:", error);

    // Violação de constraint UNIQUE
    if (error.code === "P2002") {
      return res.status(409).json({
        erro: "Já existe um funcionário cadastrado com este nome e data de nascimento.",
      });
    }
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao salvar." });
  }
};

const buscarFuncionario = async (req, res) => {
  try {
    const { id } = req.params;

    // Busca por ID
    const funcionario = await prisma.funcionario.findUnique({
      where: { id_funcionario: parseInt(id) },
    });

    if (!funcionario) {
      return res
        .status(404)
        .json({ erro: "Funcionário não encontrado na base de dados." });
    }

    return res.status(200).json(funcionario);
  } catch (error) {
    console.error("Erro ao buscar funcionário específico:", error);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
};

const buscarTodosFuncionarios = async (req, res) => {
  try {
    const { busca } = req.query;

    // Se o front não mandou filtro nenhum, traz todos em ordem alfabética
    if (!busca) {
      const funcionarios = await prisma.funcionario.findMany({
        orderBy: { nome: "asc" },
      });
      return res.status(200).json(funcionarios);
    }

    // Se tem busca, aciona o radar inteligente (ID ou Nome)
    const isNumero = !isNaN(busca);

    const funcionarios = await prisma.funcionario.findMany({
      where: {
        OR: [
          ...(isNumero ? [{ id_funcionario: parseInt(busca) }] : []),
          {
            nome: {
              contains: busca,
              mode: "insensitive", // maiúscula/minúscula
            },
          },
        ],
      },
      orderBy: { nome: "asc" },
    });

    return res.status(200).json(funcionarios);
  } catch (error) {
    console.error("Erro ao buscar todos os funcionários:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao listar funcionários." });
  }
};

const atualizarFuncionario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, data_nascimento } = req.body;

    // Limpeza de Dados
    const updateData = {};

    if (nome !== undefined) {
      updateData.nome = formatarNome(nome);
    }
    if (data_nascimento !== undefined) {
      // Blindagem contra bug de fuso horário
      updateData.data_aniversario = new Date(`${data_nascimento}T12:00:00Z`);
    }

    // Atualização no banco
    const funcionarioAtualizado = await prisma.funcionario.update({
      where: {
        id_funcionario: parseInt(id),
      },
      data: updateData,
    });

    return res.status(200).json({
      mensagem: "Funcionário atualizado com sucesso!",
      funcionario: funcionarioAtualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar:", error);

    // Funcionário não encontrado
    if (error.code === "P2025") {
      return res.status(404).json({
        erro: "Funcionário não encontrado na base de dados.",
      });
    }

    // Violação da UNIQUE composta
    if (
      error.code === "P2002" &&
      error.meta?.target?.includes("nome") &&
      error.meta?.target?.includes("data_aniversario")
    ) {
      return res.status(409).json({
        erro: "Já existe um funcionário cadastrado com este nome e data de nascimento.",
      });
    }

    return res.status(500).json({
      erro: "Erro interno no servidor.",
    });
  }
};

const deletarFuncionario = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.funcionario.delete({
      where: { id_funcionario: parseInt(id) },
    });

    return res.status(200).json({
      mensagem: "Funcionário removido com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao deletar:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ erro: "Funcionário não encontrado." });
    }

    // P2003: Violação de Chave Estrangeira
    if (error.code === "P2003") {
      return res.status(409).json({
        erro: "Não é possível excluir. Este funcionário possui registros dependentes vinculados a ele.",
      });
    }

    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao deletar." });
  }
};

module.exports = {
  cadastrarFuncionario,
  buscarFuncionario,
  buscarTodosFuncionarios,
  atualizarFuncionario,
  deletarFuncionario,
};
