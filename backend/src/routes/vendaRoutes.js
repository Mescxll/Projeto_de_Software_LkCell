const express = require("express");
const router = express.Router();

const vendaController = require("../controllers/vendaController");

const validarCadastrarVenda           = require("../middlewares/venda/validarCadastrarVenda");
const validarBuscarVenda              = require("../middlewares/venda/validarBuscarVenda");
const validarAtualizarStatusPagamento = require("../middlewares/venda/validarAtualizarStatusPagamento");
const validarCancelarVenda            = require("../middlewares/venda/validarCancelarVenda");


router.post("/",                          validarCadastrarVenda,            vendaController.cadastrarVenda);
router.get("/",                                                             vendaController.buscarTodasVendas);
router.get("/:id",                        validarBuscarVenda,               vendaController.buscarVenda);
router.patch("/:id/status-pagamento",     validarAtualizarStatusPagamento,  vendaController.atualizarStatusPagamento);
router.delete("/:id",                     validarCancelarVenda,             vendaController.cancelarVenda);

module.exports = router;