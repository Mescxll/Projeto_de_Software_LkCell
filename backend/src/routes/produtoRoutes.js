const express = require("express");
const router = express.Router();

const produtoController = require("../controllers/produtoController");

// A porta de entrada para cadastrar (POST)
router.post("/", produtoController.cadastrarProduto);

// Futuramente você vai botar os outros aqui (GET, PUT, DELETE)...
// router.get("/", produtoController.buscarTodos);

module.exports = router;
