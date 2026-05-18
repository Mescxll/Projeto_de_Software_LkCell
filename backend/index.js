// Index
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const clientRoutes = require("./src/routes/clientRoutes");
const funcionarioRoutes = require("./src/routes/funcionarioRoutes");
const produtoRoutes = require("./src/routes/produtoRoutes");
const catalogoRoutes = require("./src/routes/catalogoRoutes");
const fornecedorRoutes = require("./src/routes/fornecedorRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Lista das rotas configuradas
app.use("/api/clientes", clientRoutes);
app.use("/api/funcionarios", funcionarioRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/catalogo", catalogoRoutes);
app.use("/api/fornecedores", fornecedorRoutes);

module.exports = app;
