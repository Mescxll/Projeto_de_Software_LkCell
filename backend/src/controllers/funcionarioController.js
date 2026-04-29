const prisma = require("../lib/prisma");

const cadastrarFuncionario = async (req, res) => {
  try {
    const { nome, data_nascimento } = req.body;

    const novoFuncionario = await prisma.funcionario.create({
      data: {
        nome,
        // Convertendo para objeto Date
        data_aniversario: data_nascimento ? new Date(data_nascimento) : null,
      },
    });

    return res.status(201).json({
      mensagem: "Funcionário cadastrado com sucesso!",
      funcionario: novoFuncionario,
    });
  } catch (error) {
    console.error("Erro Prisma:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao salvar." });
  }
};

const buscarFuncionario = async (req, res) => {
  try {
    const { busca } = req.query;

    if (!busca) {
      const funcionarios = await prisma.funcionario.findMany({
        orderBy: { id_funcionario: "asc" },
      });

      return res.status(200).json(funcionarios);
    }

    const isNumero = !isNaN(busca);

    const funcionarios = await prisma.funcionario.findMany({
      where: {
        OR: [
          ...(isNumero ? [{ id_funcionario: parseInt(busca) }] : []),
          {
            nome: {
              contains: busca,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    return res.status(200).json(funcionarios);
  } catch (error) {
    console.error("Erro Prisma:", error);

    // P2002 = Falha de restrição única (Unique Constraint)
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({
          erro: "Já existe um funcionário com este dado único cadastrado no sistema.",
        });
    }

    // Se a tipagem dos dados enviada não bater com o Schema do banco
    if (error.name === "PrismaClientValidationError") {
      return res
        .status(400)
        .json({
          erro: "Os dados enviados estão em um formato inválido para o banco de dados.",
        });
    }

    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao salvar." });
  }
};

const atualizarFuncionario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, data_nascimento } = req.body;

    const funcionarioAtualizado = await prisma.funcionario.update({
      where: { id_funcionario: parseInt(id) },
      data: {
        nome,
        data_aniversario: data_nascimento
          ? new Date(data_nascimento)
          : undefined,
      },
    });

    return res.status(200).json({
      mensagem: "Funcionário atualizado com sucesso!",
      funcionario: funcionarioAtualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ erro: "Funcionário não encontrado." });
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

    // P2003  Violação de Chave Estrangeira (Foreign Key Constraint)
    if (error.code === "P2003") {
      return res.status(409).json({
        erro: "Não é possível excluir. Este funcionário possui registros dependentes vinculados a ele.",
      });
    }

    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
};

module.exports = {
  cadastrarFuncionario,
  buscarFuncionario,
  atualizarFuncionario,
  deletarFuncionario,
};
