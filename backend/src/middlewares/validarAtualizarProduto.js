const prisma = require("../lib/prisma");

module.exports = async function validarAtualizarProduto(req, res, next) {
  try {
    const { uuid } = req.params;
    const isNumericId = /^\d+$/.test(String(uuid));
    const whereIdentifier = isNumericId ? { id_produto: parseInt(uuid) } : { codigo_produto: uuid };

    const produto = await prisma.produto.findUnique({
      where: whereIdentifier,
      include: {
        categoria: true,
        modelo: { include: { marca: true } },
      },
    });

    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    if (req.body.codigo_produto && req.body.codigo_produto.trim() !== produto.codigo_produto) {
      return res.status(400).json({ erro: "Código do Produto é imutável e não pode ser alterado." });
    }

    if (req.body.nome_categoria) req.body.nome_categoria = req.body.nome_categoria.trim().toUpperCase();
    if (req.body.nome_marca) req.body.nome_marca = req.body.nome_marca.trim().toUpperCase();
    if (req.body.nome_modelo) req.body.nome_modelo = req.body.nome_modelo.trim().toUpperCase();
    if (req.body.descricao) req.body.descricao = req.body.descricao.trim();

    const descricaoVal = req.body.descricao ?? produto.descricao;
    const categoriaVal = req.body.nome_categoria ?? produto.categoria?.nome;
    const estoqueAtualVal = req.body.estoque_atual !== undefined ? req.body.estoque_atual : produto.estoque_atual;
    const precoVendaVal = req.body.preco_venda !== undefined ? req.body.preco_venda : produto.preco_venda;

    if (!descricaoVal) return res.status(400).json({ erro: "Descrição é obrigatória." });
    if (!categoriaVal) return res.status(400).json({ erro: "Categoria é obrigatória." });
    if (estoqueAtualVal === undefined || estoqueAtualVal === null || String(estoqueAtualVal).trim() === "") {
      return res.status(400).json({ erro: "Estoque atual é obrigatório." });
    }
    if (precoVendaVal === undefined || precoVendaVal === null || String(precoVendaVal).trim() === "") {
      return res.status(400).json({ erro: "Preço de venda é obrigatório." });
    }

    // Valida numeros
    const estoqueParsed = Number(estoqueAtualVal);
    if (!Number.isInteger(estoqueParsed)) {
      return res.status(400).json({ erro: "Estoque atual deve ser um número inteiro válido." });
    }
    if (req.body.estoque_minimo !== undefined && req.body.estoque_minimo !== null) {
      const v = Number(req.body.estoque_minimo);
      if (!Number.isInteger(v)) return res.status(400).json({ erro: "Estoque mínimo inválido." });
      req.body.estoque_minimo = v;
    }
    if (req.body.estoque_ideal !== undefined && req.body.estoque_ideal !== null) {
      const v = Number(req.body.estoque_ideal);
      if (!Number.isInteger(v)) return res.status(400).json({ erro: "Estoque ideal inválido." });
      req.body.estoque_ideal = v;
    }

    const precoVParsed = Number(precoVendaVal);
    if (Number.isNaN(precoVParsed)) return res.status(400).json({ erro: "Preço de venda inválido." });

    if (req.body.preco_compra !== undefined && req.body.preco_compra !== null) {
      const v = Number(req.body.preco_compra);
      if (Number.isNaN(v)) return res.status(400).json({ erro: "Preço de compra inválido." });
      req.body.preco_compra = v;
    }
    if (req.body.preco_custo !== undefined && req.body.preco_custo !== null) {
      const v = Number(req.body.preco_custo);
      if (Number.isNaN(v)) return res.status(400).json({ erro: "Preço de custo inválido." });
      req.body.preco_custo = v;
    }
    if (req.body.margem_lucro !== undefined && req.body.margem_lucro !== null) {
      const v = Number(req.body.margem_lucro);
      if (Number.isNaN(v)) return res.status(400).json({ erro: "Margem de lucro inválida." });
      req.body.margem_lucro = v;
    }

    // Exigir marca
    if (req.body.nome_modelo && !req.body.nome_marca && !produto.modelo) {
      return res.status(400).json({ erro: "Para criar um novo modelo, informe também a marca (nome_marca)." });
    }

    // Ajustar estoque_atual 
    req.body.estoque_atual = parseInt(estoqueParsed, 10);
    req.body.preco_venda = precoVParsed;

    req.produto = produto;

    return next();
  } catch (err) {
    console.error("Erro no middleware validarAtualizarProduto:", err);
    return res.status(500).json({ erro: "Erro interno ao validar dados do produto." });
  }
};