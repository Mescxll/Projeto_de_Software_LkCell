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

module.exports = {
  cadastrarFornecedor,
};