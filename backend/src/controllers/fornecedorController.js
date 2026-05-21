// Controller Fornecedor
const prisma = require("../lib/prisma");

const cadastrarFornecedor = async (req, res) => {
  try {
    const {
      cnpj,
      razao_social,
      email,
      politica_preco,
      prazo_entrega,
      telefones,
    } = req.body;

    // Limpeza e Padronização 
    const cnpjLimpo = cnpj.replace(/\D/g, "");
    
    // Padronização de Variáveis
    const razaoSocialLimpa = razao_social.trim().toUpperCase();
    const emailLimpo = email ? email.trim().toLowerCase() : null;

    let telefonesData = [];
    if (telefones && Array.isArray(telefones) && telefones.length > 0) {
      telefonesData = telefones.map((tel) => ({
        telefone_fornecedor: tel.replace(/\D/g, ""), 
      }));
    }

    // Inserção no Banco 
    const novoFornecedor = await prisma.fornecedor.create({
      data: {
        cnpj: cnpjLimpo,
        razao_social: razaoSocialLimpa,
        email: emailLimpo,
        politica_preco: parseFloat(politica_preco),
        prazo_entrega: prazo_entrega ? parseInt(prazo_entrega) : null,
        
        telefone_fornecedor: {
          create: telefonesData
        }
      },
      include: {
        telefone_fornecedor: true
      }
    });

    return res.status(201).json({
      mensagem: "Fornecedor cadastrado com sucesso!",
      fornecedor: novoFornecedor,
    });

  } catch (error) {
    console.error("Erro ao cadastrar fornecedor:", error);

    // Verifica dados repetidos
    if (error.code === "P2002") {
      if (error.message.includes("cnpj")) {
        return res.status(409).json({ erro: "Este CNPJ já está cadastrado no sistema!" });
      }
      if (error.message.includes("telefone_fornecedor")) {
        return res.status(409).json({ erro: "Um dos telefones informados já está cadastrado para outro fornecedor!" });
      }
    }

    return res.status(500).json({ erro: "Erro interno no servidor ao cadastrar fornecedor." });
  }
};

const atualizarFornecedor = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { email, razao_social, politica_preco, prazo_entrega, telefones } = req.body;

    // Verifica se o fornecedor existe no banco 
    const fornecedorExistente = await prisma.fornecedor.findUnique({
      where: { uuid: uuid }
    });

    if (!fornecedorExistente) {
      return res.status(404).json({ erro: "Fornecedor não encontrado na base de dados." });
    }

    // Monta a carga de atualização só com o que o front-end manda
    const updateData = {};

    if (razao_social !== undefined) {
      updateData.razao_social = razao_social.trim().toUpperCase();
    }

    if (email !== undefined) {
      updateData.email = email ? email.trim().toLowerCase() : null;
    }

    if (politica_preco !== undefined) {
      updateData.politica_preco = parseFloat(politica_preco);
    }

    if (prazo_entrega !== undefined) {
      updateData.prazo_entrega = prazo_entrega ? parseInt(prazo_entrega) : null;
    }

    if (telefones !== undefined) {
      // Limpa as máscaras de cada número recebido
      const telefonesLimpos = telefones
        .map(tel => ({ telefone_fornecedor: tel.replace(/\D/g, "") }))
        .filter(tel => tel.telefone_fornecedor !== ""); // Tira os vazios

      updateData.telefone_fornecedor = {
        deleteMany: {}, // Apaga todas as amarrações antigas desse fornecedor
        create: telefonesLimpos 
      };
    }

    // Executa a transação no banco
    const fornecedorAtualizado = await prisma.fornecedor.update({
      where: { uuid: uuid },
      data: updateData,
      include: {
        // Devolve os telefones atualizados pra gente confirmar
        telefone_fornecedor: true 
      }
    });

    return res.status(200).json({
      mensagem: "Fornecedor atualizado com sucesso!",
      fornecedor: fornecedorAtualizado
    });

  } catch (error) {
    console.error("Erro ao atualizar fornecedor:", error);

    // Se o usuário tentar colocar um telefone que já é de outro fornecedor
    if (error.code === "P2002" && error.message.includes("telefone_fornecedor")) {
      return res.status(409).json({ erro: "Um dos telefones informados já está cadastrado no sistema!" });
    }

    return res.status(500).json({ erro: "Erro interno no servidor ao atualizar fornecedor." });
  }
};

const buscarFornecedor = async (req, res) => {
  try {
    const { uuid } = req.params;

    // Busca tabelas e suas afins
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { uuid: uuid },
      include: {
        telefone_fornecedor: true, 
        // No futuro vamos mostrar as compras feitas a esse fornecedor na tela:
        // compra: true 
      },
    });

    // Se não houver resultados para a busca
    if (!fornecedor) {
      return res.status(404).json({ 
        erro: "Fornecedor não encontrado na base de dados." 
      });
    }

    return res.status(200).json(fornecedor);

  } catch (error) {
    console.error("Erro ao buscar o fornecedor:", error);
    return res.status(500).json({ 
      erro: "Erro interno no servidor ao listar o fornecedor." 
    });
  }
};

const buscarTodosFornecedores = async (req, res) => {
  try {
    // Busca todos os Fornecedores
    const fornecedores = await prisma.fornecedor.findMany({
      include: {
        telefone_fornecedor: true, // Manda os telefones pro frontend montar os cards
      },
      orderBy: {
        razao_social: "asc", // Ordenação nativa no banco
      },
    });

    return res.status(200).json(fornecedores);

  } catch (error) {
    console.error("Erro ao buscar todos os fornecedores:", error);
    return res.status(500).json({ 
      erro: "Erro interno no servidor ao listar fornecedores." 
    });
  }
};

const deletarFornecedor = async (req, res) => {
  try {
    const { uuid } = req.params;

    // Confirma se o fornecedor existe antes de tentar apagar
    const fornecedorExistente = await prisma.fornecedor.findUnique({
      where: { uuid: uuid },
    });

    if (!fornecedorExistente) {
      return res.status(404).json({ erro: "Fornecedor não encontrado na base de dados." });
    }

    // Ação do Cascade Delete
    await prisma.fornecedor.delete({
      where: { uuid: uuid },
    });

    return res.status(200).json({ mensagem: "Fornecedor deletado com sucesso!" });

  } catch (error) {
    console.error("Erro ao deletar fornecedor:", error);

    // Tratamento de segurança caso algo dê errado no banco de dados na hora de apagar
    if (error.code === "P2025") {
      return res.status(404).json({ erro: "Fornecedor não encontrado na base de dados." });
    }

    // Caso alguma tabela segure a exclusão
    if (error.code === "P2003") {
      return res.status(409).json({
        erro: "Não é possível excluir este fornecedor pois existem registros de compras vinculados a ele.",
      });
    }

    return res.status(500).json({ erro: "Erro interno no servidor ao deletar fornecedor." });
  }
};

module.exports = {
  cadastrarFornecedor,
  atualizarFornecedor,
  buscarFornecedor,
  buscarTodosFornecedores, 
  deletarFornecedor
};