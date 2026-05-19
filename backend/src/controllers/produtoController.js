// Controller Produto
const prisma = require("../lib/prisma");

const cadastrarProduto = async (req, res) => {
  try {
    const {
      codigo_produto,
      descricao,
      nome_categoria,
      nome_marca,
      nome_modelo,
      estoque_minimo,
      estoque_ideal,
      estoque_atual,
      preco_compra,
      preco_custo,
      preco_venda,
      margem_lucro,
    } = req.body;

    //Limpeza de Dados
    const categoriaLimpa = nome_categoria.trim().toUpperCase();
    const marcaLimpa = nome_marca.trim().toUpperCase();
    const modeloLimpo = nome_modelo.trim().toUpperCase();

    // Resolução de chaves estrangeiras
    // Resolve a Categoria
    let categoriaDB = await prisma.categoria.findUnique({
      where: { nome: categoriaLimpa },
    });
    if (!categoriaDB) {
      categoriaDB = await prisma.categoria.create({
        data: { nome: categoriaLimpa },
      });
    }

    // Resolve a Marca
    let marcaDB = await prisma.marca.findUnique({
      where: { nome: marcaLimpa },
    });
    if (!marcaDB) {
      marcaDB = await prisma.marca.create({ data: { nome: marcaLimpa } });
    }

    // Resolve o Modelo atrelado à Marca
    let modeloDB = await prisma.modelo.findFirst({
      where: {
        nome: modeloLimpo,
        fk_marca_id: marcaDB.id_marca,
      },
    });
    if (!modeloDB) {
      modeloDB = await prisma.modelo.create({
        data: {
          nome: modeloLimpo,
          fk_marca_id: marcaDB.id_marca,
        },
      });
    }

    // Inserção no banco de dados
    const novoProduto = await prisma.produto.create({
      data: {
        codigo_produto: codigo_produto.trim(),
        nome: `${marcaLimpa} ${modeloLimpo}`,
        descricao: descricao.trim(),

        fk_categoria_id: categoriaDB.id_categoria,
        fk_modelo_id: modeloDB.id_modelo,

        estoque_atual: parseInt(estoque_atual),
        estoque_minimo: estoque_minimo ? parseInt(estoque_minimo) : null,
        estoque_ideal: estoque_ideal ? parseInt(estoque_ideal) : null,

        preco_venda: parseFloat(preco_venda),
        preco_compra: preco_compra ? parseFloat(preco_compra) : null,
        preco_custo: preco_custo ? parseFloat(preco_custo) : null,
        margem_lucro: margem_lucro ? parseFloat(margem_lucro) : null,
      },
      include: {
        categoria: true,
        modelo: {
          include: {
            marca: true,
          },
        },
      },
    });

    return res.status(201).json({
      mensagem: "Produto cadastrado com sucesso!",
      produto: novoProduto,
    });
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);

    // Tratamento de erro de código de produto duplicado (Unique Key)
    if (error.code === "P2002" && error.message.includes("codigo_produto")) {
      return res
        .status(409)
        .json({
          erro: "Este Código de Produto já está cadastrado no sistema!",
        });
    }

    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao cadastrar produto." });
  }
};

const atualizarProduto = async (req, res) => {
  try {
    const { uuid } = req.params;
    const {
      codigo_produto,
      descricao,
      nome_categoria,
      nome_marca,
      nome_modelo,
      estoque_minimo,
      estoque_ideal,
      estoque_atual,
      preco_compra,
      preco_custo,
      preco_venda,
      margem_lucro,
    } = req.body;

    // Busca e Regras de Negócio
    // Identifica se a busca é por ID numérico ou pelo Código do Produto
    const isNumericId = /^\d+$/.test(String(uuid));
    const whereIdentifier = isNumericId
      ? { id_produto: parseInt(uuid) }
      : { codigo_produto: uuid };

    const produtoExistente = await prisma.produto.findUnique({
      where: whereIdentifier,
      include: {
        categoria: true,
        modelo: { include: { marca: true } },
      },
    });

    if (!produtoExistente) {
      return res
        .status(404)
        .json({ erro: "Produto não encontrado na base de dados." });
    }

    // Trava de Imutabilidade do Código
    if (
      codigo_produto !== undefined &&
      codigo_produto.trim() !== produtoExistente.codigo_produto
    ) {
      return res
        .status(400)
        .json({
          erro: "O Código do Produto é imutável e não pode ser alterado.",
        });
    }

    // Limpeza de dados
    const updateData = {};

    if (descricao !== undefined) updateData.descricao = descricao.trim();

    // Numéricos
    if (estoque_atual !== undefined)
      updateData.estoque_atual = parseInt(estoque_atual);
    if (estoque_minimo !== undefined)
      updateData.estoque_minimo =
        estoque_minimo === null ? null : parseInt(estoque_minimo);
    if (estoque_ideal !== undefined)
      updateData.estoque_ideal =
        estoque_ideal === null ? null : parseInt(estoque_ideal);

    if (preco_venda !== undefined)
      updateData.preco_venda = parseFloat(preco_venda);
    if (preco_compra !== undefined)
      updateData.preco_compra =
        preco_compra === null ? null : parseFloat(preco_compra);
    if (preco_custo !== undefined)
      updateData.preco_custo =
        preco_custo === null ? null : parseFloat(preco_custo);
    if (margem_lucro !== undefined)
      updateData.margem_lucro =
        margem_lucro === null ? null : parseFloat(margem_lucro);

    // Resolvendo chaves estrangeiras
    // Categoria
    if (nome_categoria !== undefined) {
      const catLimpa = nome_categoria.trim().toUpperCase();
      let catDB = await prisma.categoria.findUnique({
        where: { nome: catLimpa },
      });
      if (!catDB)
        catDB = await prisma.categoria.create({ data: { nome: catLimpa } });
      updateData.fk_categoria_id = catDB.id_categoria;
    }

    // Marca e Modelo
    if (nome_marca !== undefined || nome_modelo !== undefined) {
      // Pega o que o usuário mandou, ou mantém o que já tava no banco se ele não mandou
      const marcaFinal =
        nome_marca !== undefined
          ? nome_marca.trim().toUpperCase()
          : produtoExistente.modelo
            ? produtoExistente.modelo.marca.nome
            : null;

      const modeloFinal =
        nome_modelo !== undefined
          ? nome_modelo.trim().toUpperCase()
          : produtoExistente.modelo
            ? produtoExistente.modelo.nome
            : null;

      if (marcaFinal && modeloFinal) {
        let marcaDB = await prisma.marca.findUnique({
          where: { nome: marcaFinal },
        });
        if (!marcaDB)
          marcaDB = await prisma.marca.create({ data: { nome: marcaFinal } });

        let modeloDB = await prisma.modelo.findFirst({
          where: { nome: modeloFinal, fk_marca_id: marcaDB.id_marca },
        });
        if (!modeloDB) {
          modeloDB = await prisma.modelo.create({
            data: { nome: modeloFinal, fk_marca_id: marcaDB.id_marca },
          });
        }

        updateData.fk_modelo_id = modeloDB.id_modelo;
        updateData.nome = `${marcaFinal} ${modeloFinal}`; // Recalcula o nome do produto
      }
    }

    // Atualização no banco de dados
    const produtoAtualizado = await prisma.produto.update({
      where: { id_produto: produtoExistente.id_produto },
      data: updateData,
      include: {
        categoria: true,
        modelo: { include: { marca: true } },
      },
    });

    return res.status(200).json({
      mensagem: "Produto atualizado com sucesso!",
      produto: produtoAtualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);

    if (error.code === "P2025") {
      return res
        .status(404)
        .json({
          erro: "Produto não encontrado na base de dados para atualização.",
        });
    }

    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao atualizar produto." });
  }
};

const buscarProduto = async (req, res) => {
  try {
    const { uuid } = req.params;

    // Verificar se mandaram um número (ID) ou um texto
    const isNumericId = /^\d+$/.test(String(uuid));
    const whereIdentifier = isNumericId
      ? { id_produto: parseInt(uuid) }
      : { codigo_produto: uuid };

    const produto = await prisma.produto.findUnique({
      where: whereIdentifier,
      include: {
        categoria: true,
        modelo: { include: { marca: true } },
        itenscompra: true,
        itensvenda: true,
      },
    });

    if (!produto) {
      return res
        .status(404)
        .json({ erro: "Produto não encontrado na base de dados." });
    }

    return res.status(200).json(produto);
  } catch (error) {
    console.error("Erro ao buscar o produto:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao buscar o produto." });
  }
};
const buscarTodosProdutos = async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany({
      include: {
        categoria: true,
        modelo: {
          include: {
            marca: true,
          },
        },
        itenscompra: true,
        itensvenda: true,
      },
    });

    return res.status(200).json(produtos);
  } catch (error) {
    console.error("Erro ao buscar todos os produtos:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao listar produtos." });
  }
};

const deletarProduto = async (req, res) => {
  try {
    const { uuid } = req.params;

    // Busca inteligente de novo pra saber quem a gente vai apagar
    const isNumericId = /^\d+$/.test(String(uuid));
    const whereIdentifier = isNumericId
      ? { id_produto: parseInt(uuid) }
      : { codigo_produto: uuid };

    // A marreta cai direto aqui
    await prisma.produto.delete({
      where: whereIdentifier,
    });

    return res.status(200).json({ mensagem: "Produto deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);

    // Caso produto não seja encontrado
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ erro: "Produto não encontrado na base de dados." });
    }

    // Trava de segurança pra chaves estrangeiras
    if (error.code === "P2003") {
      return res.status(409).json({
        erro: "Não é possível excluir o produto pois existem compras ou vendas vinculadas a ele.",
      });
    }

    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao deletar produto." });
  }
};

module.exports = {
  cadastrarProduto,
  atualizarProduto,
  buscarProduto,
  buscarTodosProdutos,
  deletarProduto,
};
