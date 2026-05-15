const prisma = require("../lib/prisma");

const cadastrarProduto = async (req, res) => {
  try {
    const {
      codigo_produto,
      descricao,
      nome_categoria, // Vem do input do usuário
      nome_marca,     // Vem do input do usuário
      nome_modelo,    // Vem do input do usuário
      estoque_minimo,
      estoque_ideal,
      estoque_atual,
      preco_compra,
      preco_custo,
      preco_venda,
      margem_lucro,
    } = req.body;

    // Validação dos Obrigatórios 
    if (!codigo_produto || !descricao || !nome_categoria || !nome_marca || !nome_modelo || !preco_venda || estoque_atual === undefined) {
      return res.status(400).json({
        erro: "Preencha todos os campos obrigatórios (Código, Descrição, Categoria, Marca, Modelo, Estoque Atual e Preço de Venda).",
      });
    }

    // Padronização tudo maiúsculo e sem espaços sobrando
    const categoriaLimpa = nome_categoria.trim().toUpperCase();
    const marcaLimpa = nome_marca.trim().toUpperCase();
    const modeloLimpo = nome_modelo.trim().toUpperCase();

    // Resolvendo chaves estrangeiras

    // Resolve a Categoria
    let categoriaDB = await prisma.categoria.findUnique({ where: { nome: categoriaLimpa } });
    if (!categoriaDB) {
      categoriaDB = await prisma.categoria.create({ data: { nome: categoriaLimpa } });
    }

    // Resolve a Marca
    let marcaDB = await prisma.marca.findUnique({ where: { nome: marcaLimpa } });
    if (!marcaDB) {
      marcaDB = await prisma.marca.create({ data: { nome: marcaLimpa } });
    }

    // Procura o modelo atrelado à marca específica
    let modeloDB = await prisma.modelo.findFirst({
      where: {
        nome: modeloLimpo,
        fk_marca_id: marcaDB.id_marca
      }
    });
    if (!modeloDB) {
      modeloDB = await prisma.modelo.create({
        data: {
          nome: modeloLimpo,
          fk_marca_id: marcaDB.id_marca
        }
      });
    }

    // Inserção Final do Produto
    const novoProduto = await prisma.produto.create({
      data: {
        codigo_produto: codigo_produto.trim(),
        nome: `${marcaLimpa} ${modeloLimpo}`, //Monta um nome amigável automático
        descricao: descricao.trim(),

        // Chaves Estrangeiras cravadas
        fk_categoria_id: categoriaDB.id_categoria,
        fk_modelo_id: modeloDB.id_modelo,

        // Convertendo para Números 
        estoque_atual: parseInt(estoque_atual),
        estoque_minimo: estoque_minimo ? parseInt(estoque_minimo) : null,
        estoque_ideal: estoque_ideal ? parseInt(estoque_ideal) : null,

        preco_venda: parseFloat(preco_venda),
        preco_compra: preco_compra ? parseFloat(preco_compra) : null,
        preco_custo: preco_custo ? parseFloat(preco_custo) : null,
        margem_lucro: margem_lucro ? parseFloat(margem_lucro) : null,
      },
      // O Prisma devolve o produto já com as informações aninhadas pra confirmar
      include: {
        categoria: true,
        modelo: {
          include: {
            marca: true,
          }
        }
      }
    });

    return res.status(201).json({
      mensagem: "Produto cadastrado com sucesso!",
      produto: novoProduto,
    });

  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);

    // Tratamento de erro de código de produto duplicado
    if (error.code === "P2002" && error.message.includes("codigo_produto")) {
      return res.status(409).json({ erro: "Este Código de Produto já está cadastrado no sistema!" });
    }

    return res.status(500).json({ erro: "Erro interno no servidor ao cadastrar produto." });
  }
};

const atualizarProduto = async (req, res) => {
  try {
    const produtoExistente = req.produto;
    if (!produtoExistente) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    // Objeto de atualização - campos aceitos
    const {
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

    const updateData = {};

    if (descricao) updateData.descricao = descricao;
    if (estoque_atual !== undefined) updateData.estoque_atual = parseInt(estoque_atual, 10);
    if (estoque_minimo !== undefined) updateData.estoque_minimo = estoque_minimo === null ? null : parseInt(estoque_minimo, 10);
    if (estoque_ideal !== undefined) updateData.estoque_ideal = estoque_ideal === null ? null : parseInt(estoque_ideal, 10);

    if (preco_venda !== undefined) updateData.preco_venda = Number(preco_venda);
    if (preco_compra !== undefined) updateData.preco_compra = preco_compra === null ? null : Number(preco_compra);
    if (preco_custo !== undefined) updateData.preco_custo = preco_custo === null ? null : Number(preco_custo);
    if (margem_lucro !== undefined) updateData.margem_lucro = margem_lucro === null ? null : Number(margem_lucro);

    if (nome_categoria) {
      const categoriaLimpa = nome_categoria;
      let categoriaDB = await prisma.categoria.findUnique({ where: { nome: categoriaLimpa } });
      if (!categoriaDB) categoriaDB = await prisma.categoria.create({ data: { nome: categoriaLimpa } });
      updateData.fk_categoria_id = categoriaDB.id_categoria;
    }

    let marcaLimpa, modeloLimpo;
    if (nome_marca) {
      marcaLimpa = nome_marca;
      let marcaDB = await prisma.marca.findUnique({ where: { nome: marcaLimpa } });
      if (!marcaDB) marcaDB = await prisma.marca.create({ data: { nome: marcaLimpa } });

      if (nome_modelo) {
        modeloLimpo = nome_modelo;
        let modeloDB = await prisma.modelo.findFirst({
          where: { nome: modeloLimpo, fk_marca_id: marcaDB.id_marca },
        });
        if (!modeloDB) {
          modeloDB = await prisma.modelo.create({
            data: { nome: modeloLimpo, fk_marca_id: marcaDB.id_marca },
          });
        }
        updateData.fk_modelo_id = modeloDB.id_modelo;
      } else {
        updateData.fk_modelo_id = null;
      }
    } else if (nome_modelo) {
      modeloLimpo = nome_modelo;
      const modeloDB = await prisma.modelo.findFirst({ where: { nome: modeloLimpo } });
      if (modeloDB) updateData.fk_modelo_id = modeloDB.id_modelo;
    }

    if (marcaLimpa && modeloLimpo) {
      updateData.nome = `${marcaLimpa} ${modeloLimpo}`;
    } else if (updateData.fk_modelo_id && !updateData.nome) {
      const modeloFull = await prisma.modelo.findUnique({
        where: { id_modelo: updateData.fk_modelo_id },
        include: { marca: true },
      });
      if (modeloFull) updateData.nome = `${modeloFull.marca.nome} ${modeloFull.nome}`;
    }

    const produtoAtualizado = await prisma.produto.update({
      where: { id_produto: produtoExistente.id_produto },
      data: updateData,
      include: {
        categoria: true,
        modelo: { include: { marca: true } },
      },
    });

    return res.json({ mensagem: "Produto atualizado com sucesso!", produto: produtoAtualizado });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    if (error.code === "P2002" && error.message && error.message.includes("codigo_produto")) {
      return res.status(409).json({ erro: "Este Código de Produto já está cadastrado no sistema!" });
    }
    return res.status(500).json({ erro: "Erro ao atualizar produto. Tente novamente mais tarde." });
  }
};

const buscarTodos = async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany({
      include: {
        codigo_produto: true,
        descricao: true,
        categoria: true,
        modelo: true,
        preco_venda: true,
        estoque_minimo: true,
        estoque_ideal: true,
        estoque_atual: true,
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

module.exports = {
  cadastrarProduto,
  atualizarProduto,
};
