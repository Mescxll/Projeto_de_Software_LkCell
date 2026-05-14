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
    '/:uuid',
    clientController.buscarCliente
);

// Rota do tipo GET para buscar todos os clientes
router.get('/', clientController.buscarTodos);

// Rota do tipo PUT para atualizar cliente por CPF/CNPJ
router.put(
    '/:uuid',
    clientController.atualizarCliente
);

// Rota do tipo DELETE para remover cliente por CPF/CNPJ
router.delete(
    '/:uuid',
    clientController.deletarCliente
);

module.exports = router;