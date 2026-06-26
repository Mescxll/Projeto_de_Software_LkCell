// hooks/catalogo/categoria/useGerenciarCategoria.js
import { useState, useEffect, useRef } from "react";

export function useGerenciarCategoria() {
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalDeletar, setModalDeletar] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErro, setModalErro] = useState(false);
  const [erroMsg, setErroMsg] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  useEffect(() => {
    buscarCategorias();
  }, []);

  const buscarCategorias = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/categorias");
      const data = await res.json();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async () => {
    if (!categoriaSelecionada) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/categorias/${categoriaSelecionada.id_categoria}`,
        { method: "DELETE" },
      );

      if (res.ok) {
        setCategorias((prev) =>
          prev.filter(
            (c) => c.id_categoria !== categoriaSelecionada.id_categoria,
          ),
        );
        setModalDeletar(false);
        setModalSucesso(true);
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao excluir categoria.");
        setModalDeletar(false);
        setModalErro(true);
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModalDeletar(false);
      setModalErro(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const categoriasFiltradas = categorias.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  const formatarData = (data) => {
    if (!data) return "-";
    try {
      return new Date(data).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  return {
    loading,
    categoriasFiltradas,
    busca,
    setBusca,
    modalDeletar,
    setModalDeletar,
    modalSucesso,
    setModalSucesso,
    modalErro,
    setModalErro,
    erroMsg,
    isDeleting,
    categoriaSelecionada,
    setCategoriaSelecionada,
    handleDeletar,
    formatarData,
  };
}