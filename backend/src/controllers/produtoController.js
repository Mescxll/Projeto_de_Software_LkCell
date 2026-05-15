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

module.exports = {
  cadastrarProduto,
};
