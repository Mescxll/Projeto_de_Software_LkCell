// routes/catalogo/modeloRoutes.js
const express = require("express");
const router = express.Router();

const {
  listarModelos,
  buscarModelo,
  cadastrarModelo,
  atualizarModelo,
  deletarModelo,
} = require("../../controllers/catalogo/modeloController");

const validarListarModelo = require("../../middlewares/catalogo/modelo/validarListarModelo");
const validarBuscarModelo = require("../../middlewares/catalogo/modelo/validarBuscarModelo");
const validarCadastrarModelo = require("../../middlewares/catalogo/modelo/validarCadastrarModelo");
const validarAtualizarModelo = require("../../middlewares/catalogo/modelo/validarAtualizarModelo");
const validarDeletarModelo = require("../../middlewares/catalogo/modelo/validarDeletarModelo");

router.get("/", validarListarModelo, listarModelos);
router.get("/:id", validarBuscarModelo, buscarModelo);
router.post("/", validarCadastrarModelo, cadastrarModelo);
router.patch("/:id", validarAtualizarModelo, atualizarModelo);
router.delete("/:id", validarDeletarModelo, deletarModelo);

module.exports = router;