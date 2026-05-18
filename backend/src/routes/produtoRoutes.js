// Rotas Produto
const express = require("express");
const router = express.Router();

const produtoController = require("../controllers/produtoController");
const validarCadastrarProduto = require("../middlewares/produto/validarCadastrarProduto");
const validarAtualizarProduto = require("../middlewares/produto/validarAtualizarProduto");
const validarDeletarProduto = require("../middlewares/produto/validarDeletarProduto");


// Cadastrar (POST)
router.post("/", validarCadastrarProduto, produtoController.cadastrarProduto);

// Atualizar (PUT)
router.put('/:uuid', validarAtualizarProduto, produtoController.atualizarProduto);

// Deletar (DELETE)
router.delete('/:uuid', validarDeletarProduto, produtoController.deletarProduto);

// Buscar (GET)
router.get("/", produtoController.buscarTodosProdutos);

// Buscar por id (GET)
router.get(
    '/:uuid',
    produtoController.buscarProduto
);

module.exports = router;
