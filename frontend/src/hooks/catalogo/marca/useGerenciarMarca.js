// hooks/catalogo/marca/useGerenciarMarca.js
import { useState, useEffect } from "react";

export function useGerenciarMarca() {
  const [loading, setLoading] = useState(true);
  const [marcas, setMarcas] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalDeletar, setModalDeletar] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErro, setModalErro] = useState(false);
  const [erroMsg, setErroMsg] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [marcaSelecionada, setMarcaSelecionada] = useState(null);

  useEffect(() => {
    buscarMarcas();
  }, []);

  const buscarMarcas = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/marcas");
      const data = await res.json();
      setMarcas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar marcas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async () => {
    if (!marcaSelecionada) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/marcas/${marcaSelecionada.id_marca}`,
        { method: "DELETE" },
      );

      if (res.ok) {
        setMarcas((prev) =>
          prev.filter((m) => m.id_marca !== marcaSelecionada.id_marca),
        );
        setModalDeletar(false);
        setModalSucesso(true);
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao excluir marca.");
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

  const marcasFiltradas = marcas.filter((m) =>
    m.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return {
    loading,
    marcasFiltradas,
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
    marcaSelecionada,
    setMarcaSelecionada,
    handleDeletar,
  };
}