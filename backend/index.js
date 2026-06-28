const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const clienteRoutes = require("./src/routes/clienteRoutes");
const funcionarioRoutes = require("./src/routes/funcionarioRoutes");
const fornecedorRoutes = require("./src/routes/fornecedorRoutes");
const vendaRoutes = require("./src/routes/vendaRoutes");
const compraRoutes = require("./src/routes/compraRoutes");
const localizacaoRoutes = require("./src/routes/localizacaoRoutes");
const estoqueRoutes = require("./src/routes/estoqueRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/clientes", clienteRoutes);
app.use("/api/funcionarios", funcionarioRoutes);
app.use("/api/fornecedores", fornecedorRoutes);
app.use("/api/vendas", vendaRoutes);
app.use("/api/compras", compraRoutes);
app.use("/api/localizacoes", localizacaoRoutes);
app.use("/api/estoque", estoqueRoutes);

// Catálogo — único ponto de entrada
app.use("/api", require("./src/routes/catalogo/index"));

module.exports = app;