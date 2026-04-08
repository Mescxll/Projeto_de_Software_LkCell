const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

//Rota do tipo POST para cadastro de clientes
router.post('/', clientController.cadastrarCliente);

module.exports = router;