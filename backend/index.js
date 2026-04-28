const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const clientRoutes = require('./src/routes/clientRoutes');
const funcionarioRoutes = require('./src/routes/funcionarioRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Lista das rotas configuradas
app.use('/api/clientes', clientRoutes);
app.use('/api/funcionarios', funcionarioRoutes);

module.exports = app;