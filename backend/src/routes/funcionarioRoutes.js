// Rotas Funcionário
const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');
const validarCadastrarFuncionario = require('../middlewares/funcionario/validarCadastrarFuncionario');
const validarBuscarFuncionario = require("../middlewares/funcionario/validarBuscarFuncionario");
const validarAtualizarFuncionario = require("../middlewares/funcionario/validarAtualizarFuncionario");
const validarDeletarFuncionario = require("../middlewares/funcionario/validarDeletarFuncionario");

// Criar
router.post('/', validarCadastrarFuncionario, funcionarioController.cadastrarFuncionario);

// Buscar (tudo, por nome ou por id)
router.get("/:id", validarBuscarFuncionario, funcionarioController.buscarFuncionario);

// Rota GET para buscar todos os funcionários
router.get("/", funcionarioController.buscarTodosFuncionarios);

// Atualizar
router.put('/:id', validarAtualizarFuncionario, funcionarioController.atualizarFuncionario);

// Deletar
router.delete('/:id', validarDeletarFuncionario, funcionarioController.deletarFuncionario);

module.exports = router;