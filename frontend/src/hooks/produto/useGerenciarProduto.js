// Lógica da Tela de Gerenciamento de Produtos (Exlusão, Busca e Listagem)
import { useState, useEffect, useRef } from "react";

export function useGerenciarProduto() {
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState(["Todas"]);
  const [marcas, setMarcas] = useState(["Todas"]);
  const [modelos, setModelos] = useState(["Todos"]);
  const [busca, setBusca] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [categoria, setCategoria] = useState("Todas");
  const [marca, setMarca] = useState("Todas");
  const [modelo, setModelo] = useState("Todos");
  const [menuAberto, setMenuAberto] = useState(null);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [todasMarcas, setTodasMarcas] = useState([]);

  const filtroRef = useRef(null);
  const menuRef = useRef(null);

  // Busca inicial: produtos, categorias e marcas
  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3000/api/produtos").then((r) => r.json()),
      fetch("http://localhost:3000/api/catalogo/categorias").then((r) => r.json()),
      fetch("http://localhost:3000/api/catalogo/marcas").then((r) => r.json()),
    ])
      .then(([produtosData, categoriasData, marcasData]) => {
        setProdutos(Array.isArray(produtosData) ? produtosData : []);
        setCategorias(["Todas", ...categoriasData.map((c) => c.nome)]);
        setMarcas(["Todas", ...marcasData.map((m) => m.nome)]);
        setTodasMarcas(marcasData); // guarda com id para buscar modelos
      })
      .catch((err) => console.error("Erro ao buscar dados:", err))
      .finally(() => setLoading(false));
  }, []);

  // Busca modelos quando a marca muda
  useEffect(() => {
    if (marca === "Todas") {
      setModelos(["Todos"]);
      setModelo("Todos");
      return;
    }

    const marcaSelecionada = todasMarcas.find((m) => m.nome === marca);
    if (!marcaSelecionada) return;

    fetch(`http://localhost:3000/api/catalogo/modelos?marca_id=${marcaSelecionada.id_marca}`)
      .then((r) => r.json())
      .then((data) => {
        setModelos(["Todos", ...data.map((m) => m.nome)]);
        setModelo("Todos");
      })
      .catch((err) => console.error("Erro ao buscar modelos:", err));
  }, [marca, todasMarcas]);

  useEffect(() => {
    const handleClickFora = (e) => {
      if (filtroRef.current && !filtroRef.current.contains(e.target)) {
        setFiltrosAbertos(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAberto(null);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const handleExcluir = async () => {
    if (!produtoSelecionado) return;
    setIsDeleting(true);
    try {
      await fetch(`http://localhost:3000/api/produtos/${produtoSelecionado.id_produto}`, {
        method: "DELETE",
      });
      setProdutos((prev) =>
        prev.filter((p) => p.id_produto !== produtoSelecionado.id_produto)
      );
      setModalConfirmar(false);
      setMenuAberto(null);
      setModalSucesso(true);
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const produtosFiltrados = produtos.filter((p) => {
    const termoBusca = busca.toLowerCase();
    const matchBusca =
      p.nome?.toLowerCase().includes(termoBusca) ||
      p.descricao?.toLowerCase().includes(termoBusca) ||
      p.codigo_produto?.toLowerCase().includes(termoBusca) ||
      String(p.id_produto).includes(termoBusca);
    const matchCategoria = categoria === "Todas" || p.categoria?.nome === categoria;
    const matchMarca = marca === "Todas" || p.modelo?.marca?.nome === marca;
    const matchModelo = modelo === "Todos" || p.modelo?.nome === modelo;
    return matchBusca && matchCategoria && matchMarca && matchModelo;
  });

  const formatarPreco = (valor) =>
    Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return {
    loading,
    busca, setBusca,
    filtrosAbertos, setFiltrosAbertos,
    categoria, setCategoria,
    marca, setMarca,
    modelo, setModelo,
    categorias, marcas, modelos,
    produtosFiltrados,
    formatarPreco,
    filtroRef,
    menuAberto, setMenuAberto,
    menuRef,
    modalConfirmar, setModalConfirmar,
    modalSucesso, setModalSucesso,
    isDeleting,
    produtoSelecionado, setProdutoSelecionado,
    handleExcluir,
  };
}