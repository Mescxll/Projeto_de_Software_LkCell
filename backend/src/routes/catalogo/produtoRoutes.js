// Rotas Produto
const express = require("express");
const router = express.Router();

const produtoController = require("../../controllers/catalogo/produtoController");
const validarCadastrarProduto = require("../../middlewares/catalogo/produto/validarCadastrarProduto");
const validarAtualizarProduto = require("../../middlewares/catalogo/produto/validarAtualizarProduto");
const validarDeletarProduto = require("../../middlewares/catalogo/produto/validarDeletarProduto");
const validarBuscarProduto = require("../../middlewares/catalogo/produto/validarBuscarProduto");
const buscarEstoquePorLocalizacao = require("../../controllers/catalogo/produtoController");

// Listar produtos (GET)
router.get("/", produtoController.buscarTodosProdutos);
// Cadastrar (POST)
router.post("/", validarCadastrarProduto, produtoController.cadastrarProduto);
// Atualizar (PUT)
router.put(
  "/:uuid",
  validarAtualizarProduto,
  produtoController.atualizarProduto,
);
// Deletar (DELETE)
router.delete(
  "/:uuid",
  validarDeletarProduto,
  produtoController.deletarProduto,
);
// Buscar (GET)
router.get("/", produtoController.buscarTodosProdutos);
// Buscar por id (GET)
router.get("/:uuid", validarBuscarProduto, produtoController.buscarProduto);
// Buscar estoque por localizacao
router.get(
  "/:id/estoque-por-localizacao",
  produtoController.buscarEstoquePorLocalizacao,
);

module.exports = router;
