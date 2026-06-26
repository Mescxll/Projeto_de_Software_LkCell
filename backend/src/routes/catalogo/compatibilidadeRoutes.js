// routes/catalogo/compatibilidadeRoutes.js
// Montado em /api/produtos/:id/compatibilidades (via produtoRoutes)
const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams para acessar :id do produto pai

const {
  listarCompatibilidades,
  atualizarTodasMarcas,
  adicionarCompatibilidade,
  atualizarCompatibilidade,
  removerCompatibilidade,
  verificarCompatibilidade,
} = require("../../controllers/catalogo/compatibilidadeController");

const validarListarCompatibilidade = require("../../middlewares/catalogo/compatibilidade/validarListarCompatibilidades");
const validarTodasMarcas = require("../../middlewares/catalogo/compatibilidade/validarAtualizarTodasMarcas");
const validarAdicionarCompatibilidade = require("../../middlewares/catalogo/compatibilidade/validarAdicionarCompatibilidade");
const validarAtualizarCompatibilidade = require("../../middlewares/catalogo/compatibilidade/validarAtualizarCompatibilidade");
const validarRemoverCompatibilidade = require("../../middlewares/catalogo/compatibilidade/validarRemoverCompatibilidade");
const validarVerificarCompatibilidade = require("../../middlewares/catalogo/compatibilidade/validarVerificarCompatibilidade");

// Lista todas as compatibilidades do produto
router.get("/", validarListarCompatibilidade, listarCompatibilidades);

// Verifica se é compatível com uma marca/modelo — rota específica antes do /:id_compatibilidade
router.get("/verificar", validarVerificarCompatibilidade, verificarCompatibilidade);

// Alterna a flag "compatível com todas as marcas"
router.patch("/todas-marcas", validarTodasMarcas, atualizarTodasMarcas);

// Adiciona uma entrada de compatibilidade
router.post("/", validarAdicionarCompatibilidade, adicionarCompatibilidade);

// Atualiza observação de uma entrada
router.patch("/:id_compatibilidade", validarAtualizarCompatibilidade, atualizarCompatibilidade);

// Remove uma entrada
router.delete("/:id_compatibilidade", validarRemoverCompatibilidade, removerCompatibilidade);

module.exports = router;