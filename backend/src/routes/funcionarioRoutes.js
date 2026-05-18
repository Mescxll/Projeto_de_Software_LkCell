// Rotas Funcionário
const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');
const validarCadastroFuncionario = require('../middlewares/funcionario/validarCadastrarFuncionario');
const validarBuscarFuncionario = require("../middlewares/funcionario/validarBuscarFuncionario");

// Criar
router.post('/', validarCadastroFuncionario, funcionarioController.cadastrarFuncionario);

// Buscar (tudo, por nome ou por id)
router.get("/:id", validarBuscarFuncionario, funcionarioController.buscarFuncionario);

// Rota GET para buscar todos os funcionários
router.get("/", funcionarioController.buscarTodosFuncionarios);

// Atualizar
router.put('/:id', funcionarioController.atualizarFuncionario);

// Deletar
router.delete('/:id', funcionarioController.deletarFuncionario);

module.exports = router;