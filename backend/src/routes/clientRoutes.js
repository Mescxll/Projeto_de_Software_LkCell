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

// Rota do tipo GET para buscar cliente por CPF/CNPJ
router.get(
    '/:documento',
    clientController.buscarCliente
);

// Rota do tipo PUT para atualizar cliente por CPF/CNPJ
router.put(
    '/:documento',
    clientController.atualizarCliente
);

module.exports = router;