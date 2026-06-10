// Lógica da Tela de Gerenciamento de Compras (Exclusão, Busca e Listagem)
import { useState, useEffect, useRef } from "react";

export function useGerenciarCompra() {
  const [loading, setLoading] = useState(true);
  const [compras, setCompras] = useState([]);
  const [busca, setBusca] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");
  const [dataEntregaFiltro, setDataEntregaFiltro] = useState("");
  const [dataCompraFiltro, setDataCompraFiltro] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [statusCompra, setStatusCompra] = useState("TODOS");
  const [modalCancelar, setModalCancelar] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const [compraSelecionada, setCompraSelecionada] = useState(null);

  const filtroRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/compras")
      .then((res) => res.json())
      .then((data) => setCompras(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Erro ao buscar compras:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClickFora = (e) => {
      if (filtroRef.current && !filtroRef.current.contains(e.target))
        setFiltrosAbertos(false);
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const formatarDataPura = (data) => {
    if (!data) return "-";

    const dataUTC = new Date(data);
    if (Number.isNaN(dataUTC.getTime())) return "-";

    const dia = String(dataUTC.getUTCDate()).padStart(2, "0");
    const mes = String(dataUTC.getUTCMonth() + 1).padStart(2, "0");
    const ano = dataUTC.getUTCFullYear();

    return `${dia}/${mes}/${ano}`;
  };

  const compararDataPura = (data, filtro) => {
    if (!data || !filtro) return false;

    const dataUTC = new Date(data);
    if (Number.isNaN(dataUTC.getTime())) return false;

    const valorData = [
      dataUTC.getUTCFullYear(),
      String(dataUTC.getUTCMonth() + 1).padStart(2, "0"),
      String(dataUTC.getUTCDate()).padStart(2, "0"),
    ].join("-");

    return valorData === filtro;
  };

  const handleCancelar = async () => {
    if (!compraSelecionada) return;
    setIsCanceling(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/compras/${compraSelecionada.id_compra}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const erro = await res.json();
        console.error("Erro ao cancelar:", erro);
        return;
      }

      setCompras((prev) =>
        prev.map((c) =>
          c.id_compra === compraSelecionada.id_compra
            ? { ...c, status_compra: "CANCELADA" }
            : c,
        ),
      );
      setModalCancelar(false);
      setModalSucesso(true);
    } catch (err) {
      console.error("Erro ao cancelar compra:", err);
    } finally {
      setIsCanceling(false);
    }
  };

  const comprasFiltradas = compras.filter((c) => {
    const termo = busca.toLowerCase();
    const matchBusca =
      String(c.id_compra).includes(termo) ||
      c.fornecedor?.razao_social?.toLowerCase().includes(termo) ||
      c.itenscompra?.some((i) =>
        i.produto?.nome?.toLowerCase().includes(termo),
      );

    const matchStatus =
      statusCompra === "TODOS" || c.status_compra === statusCompra;

    const matchDataCompra =
      !dataCompraFiltro ||
      compararDataPura(c.data_hora, dataCompraFiltro);

    const matchDataEntrega =
      !dataEntregaFiltro ||
      compararDataPura(c.prazo_entrega, dataEntregaFiltro);

    return matchBusca && matchStatus && matchDataCompra && matchDataEntrega;
  });

  const formatarPreco = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const formatarData = (data) => {
    if (!data) return "-";
    try {
      return new Date(data).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return new Date(data).toLocaleString("pt-BR");
    }
  };

  return {
    loading,
    compras,
    busca,
    setBusca,
    dataFiltro,
    setDataFiltro,
    filtrosAbertos,
    setFiltrosAbertos,
    statusCompra,
    setStatusCompra,
    modalCancelar,
    setModalCancelar,
    modalSucesso,
    setModalSucesso,
    isCanceling,
    compraSelecionada,
    setCompraSelecionada,
    filtroRef,
    comprasFiltradas,
    handleCancelar,
    formatarPreco,
    formatarData,
    formatarDataPura,
    dataEntregaFiltro,
    setDataEntregaFiltro,
    dataCompraFiltro,
    setDataCompraFiltro,
  };
}
