const express = require("express");
const router = express.Router();

const vendaController = require("../controllers/vendaController");

const validarCadastrarVenda          = require("../middlewares/venda/validarCadastrarVenda");
const validarBuscarVenda             = require("../middlewares/venda/validarBuscarVenda");
const validarAtualizarStatusPagamento = require("../middlewares/venda/validarAtualizarStatusPagamento");
const validarAtualizarStatusVenda    = require("../middlewares/venda/validarAtualizarStatusVenda");
const validarCancelarVenda           = require("../middlewares/venda/validarCancelarVenda");

// Cadastrar Venda (POST)
router.post("/", validarCadastrarVenda, vendaController.cadastrarVenda);
// Listar vendas (GET)
router.get("/", vendaController.buscarTodasVendas);
// Buscar Venda (GET)
router.get("/:id", validarBuscarVenda, vendaController.buscarVenda);
// Atualizar Status de Pagamento (PUT)
router.patch("/:id/status-pagamento", validarAtualizarStatusPagamento, vendaController.atualizarStatusPagamento);
// Atualizar Status de Venda (PUT)
router.patch("/:id/status-venda", validarAtualizarStatusVenda, vendaController.atualizarStatusVenda);
// Cancelar Venda
router.delete("/:id", validarCancelarVenda, vendaController.cancelarVenda);

module.exports = router;