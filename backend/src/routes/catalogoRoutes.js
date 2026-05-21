// Rotas Catálogo
const express = require("express");
const router = express.Router();
const catalogoController = require("../controllers/catalogoController");

router.get("/categorias", catalogoController.listarCategorias);
router.get("/marcas", catalogoController.listarMarcas);
router.get("/modelos", catalogoController.listarModelos);

module.exports = router;