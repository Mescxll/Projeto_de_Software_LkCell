import { useState, useEffect, useRef } from "react";

export function useGerenciarProduto() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [categoria, setCategoria] = useState("Todas");
  const [marca, setMarca] = useState("Todas");
  const [modelo, setModelo] = useState("Todos");
  
  const filtroRef = useRef(null);

  // Busca os dados iniciais
  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/produtos");

        if (!res.ok) {
          throw new Error(`Falha ao carregar produtos (${res.status})`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Dados recebidos não são uma lista:", data);
          setProdutos([]);
          return;
        }

        setProdutos(
          data.map((produto) => ({
            ...produto,
            categoria: produto.categoria?.nome ?? produto.categoria ?? null,
            marca: produto.marca ?? produto.modelo?.marca?.nome ?? null,
            modelo: produto.modelo?.nome ?? produto.modelo ?? null,
          })),
        );
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setProdutos([]);
      }
    };

    carregarProdutos();
  }, []);

  // Fecha os filtros se o usuário clicar fora da caixinha!
  useEffect(() => {
    const handleClickFora = (e) => {
      if (filtroRef.current && !filtroRef.current.contains(e.target)) {
        setFiltrosAbertos(false);
      }
    };
    
    if (filtrosAbertos) {
      document.addEventListener("mousedown", handleClickFora);
    }
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, [filtrosAbertos]);

  // Listas únicas para os selects 
  const categorias = ["Todas", ...new Set(produtos.map((p) => p.categoria).filter(Boolean))];
  const marcas = ["Todas", ...new Set(produtos.map((p) => p.marca).filter(Boolean))];
  const modelos = ["Todos", ...new Set(produtos.map((p) => p.modelo).filter(Boolean))];

  // Motor de busca e filtros
  const produtosFiltrados = produtos.filter((p) => {
    const termoBusca = busca.toLowerCase();
    const matchBusca =
      p.nome?.toLowerCase().includes(termoBusca) ||
      String(p.id_produto).includes(termoBusca);
    const matchCategoria = categoria === "Todas" || p.categoria === categoria;
    const matchMarca = marca === "Todas" || p.marca === marca;
    const matchModelo = modelo === "Todos" || p.modelo === modelo;
    
    return matchBusca && matchCategoria && matchMarca && matchModelo;
  });

  // Função utilitária de formatação
  const formatarPreco = (valor) =>
    Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Exportando tudo que a tela precisa 
  return {
    busca,
    setBusca,
    filtrosAbertos,
    setFiltrosAbertos,
    categoria,
    setCategoria,
    marca,
    setMarca,
    modelo,
    setModelo,
    categorias,
    marcas,
    modelos,
    produtosFiltrados,
    formatarPreco,
    filtroRef,
  };
}