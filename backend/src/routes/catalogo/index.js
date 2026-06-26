// routes/catalogo/index.js
// Agrega todas as rotas do catálogo em um único ponto de entrada
const express = require("express");
const router = express.Router();

const categoriaRoutes = require("./categoriaRoutes");
const marcaRoutes = require("./marcaRoutes");
const modeloRoutes = require("./modeloRoutes");
const produtoRoutes = require("./produtoRoutes");
// compatibilidadeRoutes é montado internamente pelo produtoRoutes

router.use("/categorias", categoriaRoutes);
router.use("/marcas", marcaRoutes);
router.use("/modelos", modeloRoutes);
router.use("/produtos", produtoRoutes);

module.exports = router;