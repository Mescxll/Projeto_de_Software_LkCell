// Rotas Fornecedor
const express = require("express");
const router = express.Router();

// Importando o Controller 
const fornecedorController = require("../controllers/fornecedorController");

// Importando os Middlewares 
const validarCadastroFornecedor = require("../middlewares/fornecedor/validarCadastroFornecedor");
const validarAtualizarFornecedor = require("../middlewares/fornecedor/validarAtualizarFornecedor");
const validarBuscarFornecedor = require("../middlewares/fornecedor/validarBuscarFornecedor");
const validarDeletarFornecedor = require("../middlewares/fornecedor/validarDeletarFornecedor");

// Cadastra um novo fornecedor (POST)
router.post("/", validarCadastroFornecedor, fornecedorController.cadastrarFornecedor);

// Busca todos os fornecedores (GET) 
router.get("/", fornecedorController.buscarTodosFornecedores);

// Busca fornecedor específico pelo UUID (GET)
router.get("/:uuid", validarBuscarFornecedor, fornecedorController.buscarFornecedor);

// Atualiza os dados de um fornecedor (PUT)
router.put("/:uuid", validarAtualizarFornecedor, fornecedorController.atualizarFornecedor);

// Deleta um fornecedor do sistema (DELETE)
router.delete("/:uuid", validarDeletarFornecedor, fornecedorController.deletarFornecedor);

module.exports = router;