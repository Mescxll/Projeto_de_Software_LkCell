const express = require("express");
const router = express.Router();

const produtoController = require("../controllers/produtoController");
const validarAtualizarProduto = require("../middlewares/validarAtualizarProduto");

// Cadastrar (POST)
router.post("/", produtoController.cadastrarProduto);

// Atualizar (PUT)
router.put('/:uuid', validarAtualizarProduto, produtoController.atualizarProduto);

// Buscar (GET)
router.get("/", produtoController.buscarTodos);

module.exports = router;
