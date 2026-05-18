// Lógica da Tela de Gerenciamento de Produtos (Exlusão, Busca e Listagem)
import { useState, useEffect, useRef } from "react";

export function useGerenciarProduto() {
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [categoria, setCategoria] = useState("Todas");
  const [marca, setMarca] = useState("Todas");
  const [modelo, setModelo] = useState("Todos");

  const filtroRef = useRef(null);

  // Busca os dados iniciais
  useEffect(() => {
    fetch("http://localhost:3000/api/produtos")
      .then((res) => res.json())
      .then((data) => setProdutos(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Erro ao buscar produtos:", err))
      .finally(() => {
        setLoading(false);
      });
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
  const categorias = [
    "Todas",
    ...new Set(produtos.map((p) => p.categoria).filter(Boolean)),
  ];
  const marcas = [
    "Todas",
    ...new Set(produtos.map((p) => p.marca).filter(Boolean)),
  ];
  const modelos = [
    "Todos",
    ...new Set(produtos.map((p) => p.modelo).filter(Boolean)),
  ];

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
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  // Exportando tudo que a tela precisa
  return {
    loading,
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
