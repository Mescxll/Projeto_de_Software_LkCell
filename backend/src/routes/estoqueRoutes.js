const express = require("express");
const router = express.Router();

const estoqueController = require("../controllers/estoqueController");

const validarBuscarVisaoGeralEstoque = require("../middlewares/estoque/validarBuscarVisaoGeralEstoque");
const validarBuscarMovimentacoesGerais = require("../middlewares/estoque/validarBuscarMovimentacoesGerais");
const validarBuscarQuantidadePorProduto = require("../middlewares/estoque/validarBuscarQuantidadePorProduto");
const validarBuscarHistoricoPorProduto = require("../middlewares/estoque/validarBuscarHistoricoPorProduto");
const validarAjustarParametros = require("../middlewares/estoque/validarAjustarParametros");
const validarTransferirEstoque = require("../middlewares/estoque/validarTransferirEstoque");

// Buscar Visão Geral de Estoque — aceita ?status=abaixo_minimo|acima_ideal|normal (GET)
router.get("/", validarBuscarVisaoGeralEstoque, estoqueController.buscarVisaoGeralEstoque);
// Buscar Movimentações Gerais de Estoque — todos os produtos, paginado (GET)
router.get("/movimentacoes", validarBuscarMovimentacoesGerais, estoqueController.buscarMovimentacoesGerais);
// Buscar Histórico de Estoque Por Produto (GET)
router.get("/produto/:id/historico", validarBuscarHistoricoPorProduto, estoqueController.buscarHistoricoPorProduto);
// Buscar Saldo de Estoque Por Produto (GET)
router.get("/produto/:id", validarBuscarQuantidadePorProduto, estoqueController.buscarQuantidadePorProduto);
// Ajustar Parâmetros de Estoque — mínimo/ideal (PATCH)
router.patch("/parametros/:produtoId", validarAjustarParametros, estoqueController.ajustarParametros);
// Transferir Estoque Entre Localizações (POST)
router.post("/transferencia", validarTransferirEstoque, estoqueController.transferirEstoque);
// valida que produto não tem estoque, cria ENTRADAs por localização
router.post("/entrada-inicial", estoqueController.cadastrarEntradaInicial);
router.patch("/ajuste-quantidade", estoqueController.ajustarQuantidade);



module.exports = router;