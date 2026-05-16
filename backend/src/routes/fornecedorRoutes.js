const express = require('express');
const router = express.Router();
const fornecedorController = require('../controllers/fornecedorController');
const validarCadastroFornecedor = require('../middlewares/validarCadastroFornecedor');

// Cadastrar (POST)
router.post(
    '/',
    validarCadastroFornecedor,
    fornecedorController.cadastrarFornecedor
);

module.exports = router;