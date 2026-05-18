// Rotas Produto
const express = require("express");
const router = express.Router();

const produtoController = require("../controllers/produtoController");
const validarAtualizarProduto = require("../middlewares/validarAtualizarProduto");
const validarExcluirProduto = require("../middlewares/validarExcluirProduto");

// Cadastrar (POST)
router.post("/", produtoController.cadastrarProduto);

// Atualizar (PUT)
router.put('/:uuid', validarAtualizarProduto, produtoController.atualizarProduto);

// Deletar (DELETE)
router.delete('/:uuid', validarExcluirProduto, produtoController.deletarProduto);

// Buscar (GET)
router.get("/", produtoController.buscarTodos);

// Buscar por id (GET)
router.get(
    '/:uuid',
    produtoController.buscarProduto
);

module.exports = router;
