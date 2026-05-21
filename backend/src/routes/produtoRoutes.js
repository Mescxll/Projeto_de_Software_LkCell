const express = require("express");
const router = express.Router();

const produtoController = require("../controllers/produtoController");
const validarAtualizarProduto = require("../middlewares/validarAtualizarProduto");

// Listar produtos (GET)
router.get("/", produtoController.buscarTodosProdutos);

// Cadastrar (POST)
router.post("/", produtoController.cadastrarProduto);

// Atualizar (PUT)
router.put('/:uuid', validarAtualizarProduto, produtoController.atualizarProduto);

module.exports = router;
