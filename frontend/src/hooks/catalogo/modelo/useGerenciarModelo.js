// hooks/catalogo/modelo/useGerenciarModelo.js
import { useState, useEffect } from "react";

export function useGerenciarModelo() {
  const [loading, setLoading] = useState(true);
  const [modelos, setModelos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [busca, setBusca] = useState("");
  const [marcaFiltro, setMarcaFiltro] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [modalDeletar, setModalDeletar] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErro, setModalErro] = useState(false);
  const [erroMsg, setErroMsg] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [modeloSelecionado, setModeloSelecionado] = useState(null);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modeloDetalhes, setModeloDetalhes] = useState(null);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);

  useEffect(() => {
    buscarDados();
  }, []);

  const buscarDados = async () => {
    setLoading(true);
    try {
      const [resModelos, resMarcas] = await Promise.all([
        fetch("http://localhost:3000/api/modelos"),
        fetch("http://localhost:3000/api/marcas"),
      ]);
      const dataModelos = await resModelos.json();
      const dataMarcas = await resMarcas.json();
      setModelos(Array.isArray(dataModelos) ? dataModelos : []);
      setMarcas(Array.isArray(dataMarcas) ? dataMarcas : []);
    } catch (err) {
      console.error("Erro ao buscar modelos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async () => {
    if (!modeloSelecionado) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/modelos/${modeloSelecionado.id_modelo}`,
        { method: "DELETE" },
      );

      if (res.ok) {
        setModelos((prev) =>
          prev.filter((m) => m.id_modelo !== modeloSelecionado.id_modelo),
        );
        setModalDeletar(false);
        setModalSucesso(true);
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao excluir modelo.");
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

  const handleVisualizarDetalhes = async (modelo) => {
    setModeloSelecionado(modelo);
    setModeloDetalhes(null);
    setModalDetalhes(true);
    setLoadingDetalhes(true);

    try {
      const res = await fetch(`http://localhost:3000/api/modelos/${modelo.id_modelo}`);
      const data = await res.json();

      if (!res.ok) {
        setModalDetalhes(false);
        setErroMsg(data.erro || "Erro ao buscar detalhes do modelo.");
        setModalErro(true);
        return;
      }

      setModeloDetalhes(data);
    } catch (err) {
      console.error("Erro ao buscar detalhes do modelo:", err);
      setModalDetalhes(false);
      setErroMsg("Nao foi possivel conectar ao servidor.");
      setModalErro(true);
    } finally {
      setLoadingDetalhes(false);
    }
  };

  const modelosFiltrados = modelos.filter((m) => {
    const matchBusca =
      m.nome.toLowerCase().includes(busca.toLowerCase()) ||
      m.marca?.nome.toLowerCase().includes(busca.toLowerCase());

    const matchMarca =
      !marcaFiltro || String(m.fk_marca_id) === String(marcaFiltro);

    return matchBusca && matchMarca;
  });

  return {
    loading,
    modelosFiltrados,
    marcas,
    busca,
    setBusca,
    marcaFiltro,
    setMarcaFiltro,
    filtrosAbertos,
    setFiltrosAbertos,
    modalDeletar,
    setModalDeletar,
    modalSucesso,
    setModalSucesso,
    modalErro,
    setModalErro,
    erroMsg,
    isDeleting,
    modeloSelecionado,
    setModeloSelecionado,
    modalDetalhes,
    setModalDetalhes,
    modeloDetalhes,
    loadingDetalhes,
    handleVisualizarDetalhes,
    handleDeletar,
  };
}