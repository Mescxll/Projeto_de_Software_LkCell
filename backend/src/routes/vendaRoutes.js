// Rotas Venda
const express = require("express");
const router = express.Router();
const {
  cadastrarVenda,
  buscarTodasVendas,
  buscarVenda,
  atualizarStatusPagamento,
  cancelarVenda,
} = require("../controllers/vendaController");

router.post("/", cadastrarVenda);
router.get("/", buscarTodasVendas);
router.get("/:id", buscarVenda);
router.patch("/:id/status", atualizarStatusPagamento);
router.delete("/:id", cancelarVenda);

module.exports = router;