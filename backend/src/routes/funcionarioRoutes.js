const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');
const validarCadastroFuncionario = require('../middlewares/validarCadastroFuncionario');

// Criar
router.post(
    '/',
    validarCadastroFuncionario,
    funcionarioController.cadastrarFuncionario
);

// Buscar (tudo, por nome ou por id)
router.get(
    '/',
    funcionarioController.buscarFuncionario
);

// Atualizar
router.put(
    '/:id',
    funcionarioController.atualizarFuncionario
);

// Deletar
router.delete(
    '/:id',
    funcionarioController.deletarFuncionario
);

module.exports = router;