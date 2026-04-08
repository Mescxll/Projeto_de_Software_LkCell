const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

//Rota do tipo POST para cadastro de clientes
router.post('/', clienteController.cadastrarCliente);

module.exports = router;