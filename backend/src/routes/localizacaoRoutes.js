const express = require("express");
const router = express.Router();

const localizacaoController = require("../controllers/localizacaoController");
const {
  validarLocalizacao,
  validarIdLocalizacao,
} = require("../middlewares/localizacao/validarLocalizacao");

// Cadastrar Localização (POST)
router.post("/", validarLocalizacao, localizacaoController.cadastrarLocalizacao);
// Listar Localizações (GET)
router.get("/", localizacaoController.buscarTodasLocalizacoes);
// Buscar Localização (GET)
router.get("/:id", validarIdLocalizacao, localizacaoController.buscarLocalizacao);
// Atualizar Localização (PATCH)
router.patch("/:id", validarIdLocalizacao, validarLocalizacao, localizacaoController.atualizarLocalizacao);
// Deletar Localização (DELETE)
router.delete("/:id", validarIdLocalizacao, localizacaoController.deletarLocalizacao);

module.exports = router;