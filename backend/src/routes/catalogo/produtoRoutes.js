// routes/catalogo/produtoRoutes.js
const express = require("express");
const router = express.Router();

const {
  buscarTodosProdutos,
  buscarEstoquePorLocalizacao,
  cadastrarProduto,
  atualizarProduto,
  buscarProduto,
  deletarProduto,
} = require("../../controllers/catalogo/produtoController");

const validarCadastrarProduto = require("../../middlewares/catalogo/produto/validarCadastrarProduto");
const validarBuscarProduto = require("../../middlewares/catalogo/produto/validarBuscarProduto");
const validarAtualizarProduto = require("../../middlewares/catalogo/produto/validarAtualizarProduto");
const validarDeletarProduto = require("../../middlewares/catalogo/produto/validarDeletarProduto");

const compatibilidadeRoutes = require("./compatibilidadeRoutes");

router.get("/", buscarTodosProdutos);
router.post("/", validarCadastrarProduto, cadastrarProduto);

router.get("/:id/estoque-por-localizacao", buscarEstoquePorLocalizacao);
router.use("/:id/compatibilidades", compatibilidadeRoutes);

// Rotas genéricas por UUID/ID 
router.get("/:uuid", validarBuscarProduto, buscarProduto);
router.patch("/:uuid", validarAtualizarProduto, atualizarProduto);
router.delete("/:uuid", validarDeletarProduto, deletarProduto);

module.exports = router;