const prisma = require("../lib/prisma");

const cadastrarCliente = async (req, res) => {
  try {
    const {
      nome,
      tipo_cliente,
      telefone,
      email,
      logradouro,
      cidade,
      uf,
      numero,
      cep,
      bairro,
      cpf,
      cnpj,
      razao_social,
      nome_fantasia,
    } = req.body;

    const tipoNormalizado =
      tipo_cliente === "FISICA" || tipo_cliente === "FISICO"
        ? "FISICO"
        : "JURIDICO";

    const novoCliente = await prisma.cliente.create({
      data: {
        nome,
        tipo_cliente: tipoNormalizado, // Ajuste para o ENUM do schema
        email: email || null,
        logradouro,
        cidade,
        uf,
        numero: numero ? parseInt(numero) : null, // O schema espera Int
        cep,
        bairro,
        // Criando Telefone e PF/PJ
        telefone_cliente: telefone
          ? {
              create: { telefone_cliente: telefone },
            }
          : undefined,
        pessoafisica:
          tipo_cliente === "FISICA"
            ? {
                create: { cpf },
              }
            : undefined,
        pessoajuridica:
          tipo_cliente === "JURIDICA"
            ? {
                create: { cnpj, razao_social, nome_fantasia },
              }
            : undefined,
      },
    });

    return res.status(201).json({
      mensagem: "Cliente cadastrado com sucesso!",
      cliente: novoCliente,
    });
  } catch (error) {
    console.error("Erro Prisma Completo:", error); // Continua imprimindo no terminal pra você debugar

    if (error.code === "P2002") {
      const textoDoErroBruto = error.message.toLowerCase();
      const alvo = error.meta?.target;

      const stringAlvo = Array.isArray(alvo)
        ? alvo.join(" ").toLowerCase()
        : typeof alvo === "string"
          ? alvo.toLowerCase()
          : "";

      const textoParaBusca = textoDoErroBruto + " " + stringAlvo;

      // Checa Telefone (Tabela: telefone_cliente)
      if (
        textoParaBusca.includes("telefone_cliente") ||
        textoParaBusca.includes("telefone")
      ) {
        return res
          .status(409)
          .json({ erro: "Este telefone já está vinculado a outro cliente. Tente outro." });
      }

      // Checa Email (Tabela: cliente)
      if (textoParaBusca.includes("email")) {
        return res
          .status(409)
          .json({ erro: "Este e-mail já está vinculado a outro cliente. Tente outro." });
      }

      // Checa Documento (Tabelas: pessoafisica ou pessoajuridica)
      if (
        textoParaBusca.includes("cpf") ||
        textoParaBusca.includes("pessoafisica") ||
        textoParaBusca.includes("cnpj") ||
        textoParaBusca.includes("pessoajuridica")
      ) {
        return res
          .status(409)
          .json({ erro: "Este CPF/CNPJ já está vinculado a outro cliente. Tente outro." });
      }

      // Fallback de segurança
      return res.status(409).json({
        erro: "Atenção: O dado que você tentou usar já está cadastrado no sistema.",
      });
    }

    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao cadastrar." });
  }
};

const buscarCliente = async (req, res) => {
  try {
    const { documento } = req.params;
    const documentoLimpo = documento.replace(/\D/g, "");

    if (!documentoLimpo) {
      return res.status(400).json({
        erro: "Documento inválido. Certifique-se de enviar apenas números.",
      });
    }

    // O Prisma faz o busca
    const cliente = await prisma.cliente.findFirst({
      where: {
        OR: [
          { pessoafisica: { cpf: documentoLimpo } },
          { pessoajuridica: { cnpj: documentoLimpo } },
        ],
      },
      include: {
        pessoafisica: true,
        pessoajuridica: true,
        telefone_cliente: true, // Traz os telefones na mesma viagem ao banco
      },
    });

    if (!cliente) {
      return res
        .status(404)
        .json({ erro: "Cliente não encontrado na base de dados." });
    }

    // Como o Prisma traz tudo estruturado,não é necessário mapear
    return res.status(200).json(cliente);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
};

const buscarTodos = async (req, res) => {
  try {
    // O Prisma traz as relações junto
    const clientes = await prisma.cliente.findMany({
      include: {
        pessoafisica: true,
        pessoajuridica: true,
        telefone_cliente: true, // Traz os telefones na mesma viagem
      },
    });

    return res.status(200).json(clientes);
  } catch (error) {
    console.error("Erro ao buscar todos os clientes:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao listar clientes." });
  }
};

const atualizarCliente = async (req, res) => {
  try {
    const { documento } = req.params;
    const { nome, logradouro, cidade, uf, numero, cep, bairro, telefone } =
      req.body;
    const documentoLimpo = documento.replace(/\D/g, "");

    if (!documentoLimpo) {
      return res.status(400).json({ erro: "Documento inválido." });
    }
    const pf = await prisma.pessoafisica.findUnique({
      where: { cpf: documentoLimpo },
    });
    const pj = await prisma.pessoajuridica.findUnique({
      where: { cnpj: documentoLimpo },
    });

    const clienteId = pf?.fk_cliente_id_cliente || pj?.fk_cliente_id_cliente;

    if (!clienteId) {
      return res
        .status(404)
        .json({ erro: "Cliente não encontrado na base de dados." });
    }

    // O update do Prisma só altera o que foi enviado
    const clienteAtualizado = await prisma.cliente.update({
      where: { id_cliente: clienteId },
      data: {
        nome,
        logradouro,
        cidade,
        uf,
        numero: numero ? parseInt(numero) : undefined, // Garantindo que é Int para o Postgres
        cep,
        bairro,
        telefone_cliente: telefone
          ? {
              deleteMany: {},
              create: { telefone_cliente: telefone },
            }
          : undefined,
      },
      // Incluir para aparecer no JSON de resposta
      include: {
        telefone_cliente: true,
        pessoafisica: true,
        pessoajuridica: true,
      },
    });

    return res.status(200).json({
      mensagem: "Cliente atualizado com sucesso!",
      cliente: clienteAtualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);

    // 1. Erro de Duplicidade (Tentou usar um dado que já é de outra pessoa)
    if (error.code === "P2002") {
      const textoDoErroBruto = error.message.toLowerCase();
      const alvo = error.meta?.target;

      const stringAlvo = Array.isArray(alvo)
        ? alvo.join(" ").toLowerCase()
        : typeof alvo === "string"
          ? alvo.toLowerCase()
          : "";

      const textoParaBusca = textoDoErroBruto + " " + stringAlvo;

      // Verificação de telefone
      if (
        textoParaBusca.includes("telefone_cliente") ||
        textoParaBusca.includes("telefone")
      ) {
        return res
          .status(409)
          .json({
            erro: "Este telefone já está vinculado a outro cliente. Tente outro.",
          });
      }

      if (textoParaBusca.includes("email")) {
        return res
          .status(409)
          .json({ erro: "Este email já pertence a outro cliente." });
      }

      // CPF/CNPJ geralmente não se atualiza, mas  deixa-se a trava por segurança
      if (
        textoParaBusca.includes("cpf") ||
        textoParaBusca.includes("cnpj") ||
        textoParaBusca.includes("pessoafisica") ||
        textoParaBusca.includes("pessoajuridica")
      ) {
        return res
          .status(409)
          .json({ erro: "Este documento já pertence a outro cliente." });
      }

      return res.status(409).json({
        erro: "Atenção: O dado que você tentou usar já está cadastrado no sistema.",
      });
    }

    if (error.code === "P2025") {
      return res
        .status(404)
        .json({
          erro: "Cliente não encontrado na base de dados para atualização.",
        });
    }

    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao atualizar." });
  }
};

const deletarCliente = async (req, res) => {
  try {
    const { documento } = req.params;
    const documentoLimpo = documento.replace(/\D/g, "");

    if (!documentoLimpo) {
      return res.status(400).json({
        erro: "Documento inválido. Certifique-se de enviar apenas números.",
      });
    }

    // Localiza o ID do cliente (PF ou PJ)
    const pf = await prisma.pessoafisica.findUnique({
      where: { cpf: documentoLimpo },
    });
    const pj = await prisma.pessoajuridica.findUnique({
      where: { cnpj: documentoLimpo },
    });

    const clienteId = pf?.fk_cliente_id_cliente || pj?.fk_cliente_id_cliente;

    if (!clienteId) {
      return res
        .status(404)
        .json({ erro: "Cliente não encontrado na base de dados." });
    }

    // Como o  schema tem 'onDelete: Cascade' em PF, PJ e Vendas,
    // ao deletar o Cliente, o banco apaga os dependentes automaticamente.

    await prisma.$transaction([
      // Como telefone_cliente está como 'NoAction' no seu schema, deletamos ele primeiro manualmente
      prisma.telefone_cliente.deleteMany({
        where: { telefone_cliente_pk: clienteId },
      }),
      // Agora deletamos o cliente e o Cascade faz o resto na nuvem
      prisma.cliente.delete({ where: { id_cliente: clienteId } }),
    ]);

    return res.status(200).json({
      mensagem: "Cliente deletado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao deletar." });
  }
};

module.exports = {
  cadastrarCliente,
  buscarCliente,
  buscarTodos,
  atualizarCliente,
  deletarCliente,
};
