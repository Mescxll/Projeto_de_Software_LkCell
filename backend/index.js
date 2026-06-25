// Index
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const clienteRoutes = require("./src/routes/clienteRoutes");
const funcionarioRoutes = require("./src/routes/funcionarioRoutes");
const produtoRoutes = require("./src/routes/catalogo/produtoRoutes");
const catalogoRoutes = require("./src/routes/catalogoRoutes");
const fornecedorRoutes = require("./src/routes/fornecedorRoutes");
const vendaRoutes = require("./src/routes/vendaRoutes");
const compraRoutes = require("./src/routes/compraRoutes");
const localizacaoRoutes = require("./src/routes/localizacaoRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Lista das rotas configuradas
app.use("/api/clientes", clienteRoutes);
app.use("/api/funcionarios", funcionarioRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/catalogo", catalogoRoutes);
app.use("/api/fornecedores", fornecedorRoutes);
app.use("/api/vendas", vendaRoutes);
app.use("/api/compras", compraRoutes);
app.use("/api/localizacoes", localizacaoRoutes);

module.exports = app;
