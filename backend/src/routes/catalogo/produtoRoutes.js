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

// Rotas de compatibilidade aninhadas sob /:id
const compatibilidadeRoutes = require("./compatibilidadeRoutes");

router.get("/", buscarTodosProdutos);
router.post("/", validarCadastrarProduto, cadastrarProduto);
router.get("/:uuid", validarBuscarProduto, buscarProduto);
router.patch("/:uuid", validarAtualizarProduto, atualizarProduto);
router.delete("/:uuid", validarDeletarProduto, deletarProduto);
router.get("/:id/estoque-por-localizacao", buscarEstoquePorLocalizacao);

// Monta as rotas de compatibilidade aninhadas:
// GET    /api/produtos/:id/compatibilidades
// GET    /api/produtos/:id/compatibilidades/verificar
// PATCH  /api/produtos/:id/compatibilidades/todas-marcas
// POST   /api/produtos/:id/compatibilidades
// PATCH  /api/produtos/:id/compatibilidades/:id_compatibilidade
// DELETE /api/produtos/:id/compatibilidades/:id_compatibilidade
router.use("/:id/compatibilidades", compatibilidadeRoutes);

module.exports = router;