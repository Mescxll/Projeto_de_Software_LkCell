// Controller Funcionario
const prisma = require("../lib/prisma");

const cadastrarFuncionario = async (req, res) => {
  try {
    const { nome, data_nascimento } = req.body;

    // Limpeza e Padronização
    const nomeLimpo = nome.trim().toUpperCase();
    
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
    return res.status(500).json({ erro: "Erro interno no servidor ao salvar." });
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
      return res.status(404).json({ erro: "Funcionário não encontrado na base de dados." });
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
    return res.status(500).json({ erro: "Erro interno no servidor ao listar funcionários." });
  }
};

const atualizarFuncionario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, data_nascimento } = req.body;

    // Limpeza de Dados
    const updateData = {};
    
    if (nome !== undefined) {
      updateData.nome = nome.trim().toUpperCase(); // Padroniza tudo pra maiúsculo
    }
    
    if (data_nascimento !== undefined) {
      // Validação do meio-dia pra evitar o pulo de fuso horário na atualização
      updateData.data_aniversario = new Date(`${data_nascimento}T12:00:00Z`); 
    }

    // Atualização no banco
    const funcionarioAtualizado = await prisma.funcionario.update({
      where: { id_funcionario: parseInt(id) },
      data: updateData, // Injeta o objeto já limpo aqui
    });

    return res.status(200).json({
      mensagem: "Funcionário atualizado com sucesso!",
      funcionario: funcionarioAtualizado,
    });
    
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    
    if (error.code === "P2025") {
      return res.status(404).json({ erro: "Funcionário não encontrado na base de dados." });
    }
    
    return res.status(500).json({ erro: "Erro interno no servidor." });
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

    return res.status(500).json({ erro: "Erro interno no servidor ao deletar." });
  }
};

module.exports = {
  cadastrarFuncionario,
  buscarFuncionario,
  buscarTodosFuncionarios,
  atualizarFuncionario,
  deletarFuncionario,
};