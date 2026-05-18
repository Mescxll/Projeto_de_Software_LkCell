// Controller Catálogo
const prisma = require("../lib/prisma");

const listarCategorias = async (req, res) => {
    try{
        const categorias = await prisma.categoria.findMany({
            orderBy: { nome: "asc" }, 
        });
        return res.status(200).json(categorias);
    }catch(error){
        console.error("Erro ao buscar categorias:", error);
        return res.status(500).json({ erro: "Erro interno ao listar categorias."});
    }
};

const listarMarcas = async (req, res) => {
    try{
        const marcas = await prisma.marca.findMany({
            orderBy: { nome: "asc"},
        });
        return res.status(200).json(marcas);
    }catch(error){
        console.error("Erro ao buscar marcas:", error);
        return res.status(500).json({ erro: "Erro interno ao listar marcas." });
    }
};

const listarModelos = async (req, res) => {
    try{
        const { marca_id } = req.query;
        const filtro = marca_id ? { fk_marca_id: parseInt(marca_id) } : {};

        const modelos = await prisma.modelo.findMany({
            where: filtro,
            include: {
                marca: true,
            },
            orderBy: { nome: "asc" },
        });
        return res.status(200).json(modelos);
    }catch(error){
        console.error("Erro ao buscar modelos:", error);
        return res.status(500).json({ erro: "Erro interno ao listar modelos. "});
    }
};

module.exports = {
    listarCategorias,
    listarMarcas, 
    listarModelos,
};