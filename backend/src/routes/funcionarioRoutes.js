// Rotas Funcionário
const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');
const validarCadastrarFuncionario = require('../middlewares/funcionario/validarCadastrarFuncionario');
const validarBuscarFuncionario = require("../middlewares/funcionario/validarBuscarFuncionario");
const validarAtualizarFuncionario = require("../middlewares/funcionario/validarAtualizarFuncionario");
const validarDeletarFuncionario = require("../middlewares/funcionario/validarDeletarFuncionario");

// Criar Funcionário
router.post('/', validarCadastrarFuncionario, funcionarioController.cadastrarFuncionario);
// Buscar Funcionário (tudo, por nome ou por id)
router.get("/:id", validarBuscarFuncionario, funcionarioController.buscarFuncionario);
// Rota GET para buscar todos os Funcionários
router.get("/", funcionarioController.buscarTodosFuncionarios);
// Atualizar Funcionário 
router.put('/:id', validarAtualizarFuncionario, funcionarioController.atualizarFuncionario);
// Deletar Funcionário
router.delete('/:id', validarDeletarFuncionario, funcionarioController.deletarFuncionario);

module.exports = router;