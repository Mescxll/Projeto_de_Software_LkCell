const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');
const validarCadastroFuncionario = require('../middlewares/validarCadastroFuncionario');

// Rota do tipo POST para cadastro de funcionários
router.post(
    '/',
    validarCadastroFuncionario,
    funcionarioController.cadastrarFuncionario
);

// Rota do tipo GET para buscar funcionário por ID
router.get(
    '/:id',
    funcionarioController.buscarFuncionario
);

// Rota do tipo PUT para atualizar funcionário por ID
router.put(
    '/:id',
    funcionarioController.atualizarFuncionario
);

// Rota do tipo DELETE para remover funcionário por ID
router.delete(
    '/:id',
    funcionarioController.deletarFuncionario
);

module.exports = router;
