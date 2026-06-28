const express = require("express");
const router = express.Router();

const estoqueController = require("../controllers/estoqueController");

const validarBuscarSaldoPorProduto = require("../middlewares/estoque/validarBuscarSaldoPorProduto");
const validarBuscarHistoricoPorProduto = require("../middlewares/estoque/validarBuscarHistoricoPorProduto");
const validarBuscarAlertasEstoqueBaixo = require("../middlewares/estoque/validarBuscarAlertasEstoqueBaixo");
const validarAjustarParametros = require("../middlewares/estoque/validarAjustarParametros");
const validarTransferirEstoque = require("../middlewares/estoque/validarTransferirEstoque");

// Buscar Alertas de Estoque Baixo (GET)
router.get("/alertas", validarBuscarAlertasEstoqueBaixo, estoqueController.buscarAlertasEstoqueBaixo);
// Buscar Histórico de Estoque Por Produto (GET)
router.get("/produto/:id/historico", validarBuscarHistoricoPorProduto, estoqueController.buscarHistoricoPorProduto);
// Buscar Saldo de Estoque Por Produto (GET)
router.get("/produto/:id", validarBuscarSaldoPorProduto, estoqueController.buscarSaldoPorProduto);
// Ajustar Parâmetros de Estoque — mínimo/ideal (PATCH)
router.patch("/parametros/:produtoId", validarAjustarParametros, estoqueController.ajustarParametros);
// Transferir Estoque Entre Localizações (POST)
router.post("/transferencia", validarTransferirEstoque, estoqueController.transferirEstoque);

module.exports = router;