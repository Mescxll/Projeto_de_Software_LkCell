// routes/catalogo/categoriaRoutes.js
const express = require("express");
const router = express.Router();

const {
  listarCategorias,
  buscarCategoria,
  cadastrarCategoria,
  atualizarCategoria,
  deletarCategoria,
} = require("../../controllers/catalogo/categoriaController");

const validarListarCategoria = require("../../middlewares/catalogo/categoria/validarListarCategoria");
const validarBuscarCategoria = require("../../middlewares/catalogo/categoria/validarBuscarCategoria");
const validarCadastrarCategoria = require("../../middlewares/catalogo/categoria/validarCadastrarCategoria");
const validarAtualizarCategoria = require("../../middlewares/catalogo/categoria/validarAtualizarCategoria");
const validarDeletarCategoria = require("../../middlewares/catalogo/categoria/validarDeletarCategoria");

router.get("/", validarListarCategoria, listarCategorias);
router.get("/:id", validarBuscarCategoria, buscarCategoria);
router.post("/", validarCadastrarCategoria, cadastrarCategoria);
router.patch("/:id", validarAtualizarCategoria, atualizarCategoria);
router.delete("/:id", validarDeletarCategoria, deletarCategoria);

module.exports = router;