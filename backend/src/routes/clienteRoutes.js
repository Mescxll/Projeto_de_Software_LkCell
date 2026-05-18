// Rotas Cliente
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const validarCadastroCliente = require('../middlewares/cliente/validarCadastroCliente');
const validarAtualizarCliente = require('../middlewares/cliente/validarAtualizarCliente');
const validarDeletarCliente = require("../middlewares/cliente/validarDeletarCliente")

//Rota do tipo POST para cadastro de clientes
router.post(
    '/',
    validarCadastroCliente,
    clienteController.cadastrarCliente
);

// Rota do tipo GET para buscar cliente por CPF/CNPJ
router.get(
    '/:uuid',
    clienteController.buscarCliente
);

// Rota do tipo GET para buscar todos os clientes
router.get('/', clienteController.buscarTodosClientes);

// Rota do tipo PUT para atualizar cliente por CPF/CNPJ
router.put(
    '/:uuid',
    validarAtualizarCliente,
    clienteController.atualizarCliente
);

// Rota do tipo DELETE para remover cliente por CPF/CNPJ
router.delete(
    '/:uuid',
    validarDeletarCliente,
    clienteController.deletarCliente
);

module.exports = router;