const prisma = require("../lib/prisma");

module.exports = async function validarExcluirProduto(req, res, next) {
  try {
    const { uuid } = req.params;

    if (!uuid || String(uuid).trim() === "") {
      return res.status(400).json({
        erro: "Parâmetro de identificação do produto é obrigatório.",
      });
    }

    const isNumericId = /^\d+$/.test(String(uuid).trim());
    const whereIdentifier = isNumericId
      ? { id_produto: parseInt(uuid, 10) }
      : { codigo_produto: uuid.trim() };

    const produto = await prisma.findByIdentifier(whereIdentifier);

    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    if (produto.estoque_atual > 0) {
      return res.status(409).json({
        erro: "Não é possível excluir produto com estoque ativo.",
      });
    }

    const comprasRelacionadas = produto._count?.itenscompra ?? 0;
    const vendasRelacionadas = produto._count?.itensvenda ?? 0;

    if (comprasRelacionadas > 0 || vendasRelacionadas > 0) {
      return res.status(409).json({
        erro: "Não é possível excluir produto vinculado a compras ou vendas.",
      });
    }

    req.produto = produto;
    return next();
  } catch (error) {
    console.error("Erro no middleware validarExcluirProduto:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno ao validar exclusão do produto." });
  }
};
