const express = require("express");
const router = express.Router();

const compraController = require("../controllers/compraController");

const validarCadastrarCompra = require("../middlewares/compra/validarCadastrarCompra");
const validarBuscarCompra    = require("../middlewares/compra/validarBuscarCompra");
const validarAtualizarCompra = require("../middlewares/compra/validarAtualizarCompra");
const validarCancelarCompra  = require("../middlewares/compra/validarCancelarCompra");

// Cadastrar Compra (POST)
router.post("/", validarCadastrarCompra, compraController.cadastrarCompra);
// Listar Compras (GET)
router.get("/", compraController.buscarTodasCompras);
// Buscar Compra (GET)
router.get("/:id", validarBuscarCompra, compraController.buscarCompra);
// Atualizar Compra (PATCH)
router.patch("/:id", validarAtualizarCompra, compraController.atualizarCompra);
// Cancelar Compra (DELETE)
router.delete("/:id", validarCancelarCompra, compraController.cancelarCompra);

module.exports = router;