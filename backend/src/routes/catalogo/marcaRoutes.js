// routes/catalogo/marcaRoutes.js
const express = require("express");
const router = express.Router();

const {
  listarMarcas,
  buscarMarca,
  cadastrarMarca,
  atualizarMarca,
  deletarMarca,
} = require("../../controllers/catalogo/marcaController");

const validarListarMarca = require("../../middlewares/catalogo/marca/validarListarMarcas");
const validarBuscarMarca = require("../../middlewares/catalogo/marca/validarBuscarMarca");
const validarCadastrarMarca = require("../../middlewares/catalogo/marca/validarCadastrarMarca");
const validarAtualizarMarca = require("../../middlewares/catalogo/marca/validarAtualizarMarca");
const validarDeletarMarca = require("../../middlewares/catalogo/marca/validarDeletarMarca");

router.get("/", validarListarMarca, listarMarcas);
router.get("/:id", validarBuscarMarca, buscarMarca);
router.post("/", validarCadastrarMarca, cadastrarMarca);
router.patch("/:id", validarAtualizarMarca, atualizarMarca);
router.delete("/:id", validarDeletarMarca, deletarMarca);

module.exports = router;