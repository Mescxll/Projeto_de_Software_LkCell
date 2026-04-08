const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const validarCadastroCliente = require('../middlewares/validarCadastroCliente');

//Rota do tipo POST para cadastro de clientes
router.post(
    '/', 
    validarCadastroCliente, 
    clientController.cadastrarCliente
);

module.exports = router;