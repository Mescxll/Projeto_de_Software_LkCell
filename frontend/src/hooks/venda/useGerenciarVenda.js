// Lógica da Tela de Gerenciamento de Vendas (Exclusão, Busca e Listagem)
import { useState, useEffect, useRef } from "react";

export function useGerenciarVenda() {
  const [loading, setLoading] = useState(true);
  const [vendas, setVendas] = useState([]);
  const [busca, setBusca] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [statusPagamento, setStatusPagamento] = useState("TODOS");
  const [statusVenda, setStatusVenda] = useState("TODOS");
  const [modalCancelar, setModalCancelar] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);

  const filtroRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/vendas")
      .then((res) => res.json())
      .then((data) => setVendas(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Erro ao buscar vendas:", err))
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

  const handleCancelar = async () => {
    if (!vendaSelecionada) return;
    setIsCanceling(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/vendas/${vendaSelecionada.id_venda}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const erro = await res.json();
        console.error("Erro ao cancelar:", erro);
        return;
      }

      setVendas((prev) =>
        prev.map((v) =>
          v.id_venda === vendaSelecionada.id_venda
            ? { ...v, status_venda: "CANCELADA" }
            : v,
        ),
      );
      setModalCancelar(false);
      setModalSucesso(true);
    } catch (err) {
      console.error("Erro ao cancelar venda:", err);
    } finally {
      setIsCanceling(false);
    }
  };

  const vendasFiltradas = vendas.filter((v) => {
    const termo = busca.toLowerCase();
    const matchBusca =
      String(v.id_venda).includes(termo) ||
      v.cliente?.nome?.toLowerCase().includes(termo) ||
      v.funcionario?.nome?.toLowerCase().includes(termo) ||
      v.itensvenda?.some((i) => i.produto?.nome?.toLowerCase().includes(termo));

    const matchStatus =
      statusPagamento === "TODOS" || v.status_pagamento === statusPagamento;

    const matchStatusVenda =
      statusVenda === "TODOS" || v.status_venda === statusVenda;

    const matchData =
      !dataFiltro ||
      (v.data_hora &&
        new Date(v.data_hora).toLocaleDateString("pt-BR") ===
          new Date(dataFiltro + "T12:00:00").toLocaleDateString("pt-BR"));

    return matchBusca && matchStatus && matchStatusVenda && matchData;
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
    vendas,
    busca,
    setBusca,
    dataFiltro,
    setDataFiltro,
    filtrosAbertos,
    setFiltrosAbertos,
    statusPagamento,
    setStatusPagamento,
    statusVenda,
    setStatusVenda,
    modalCancelar,
    setModalCancelar,
    modalSucesso,
    setModalSucesso,
    isCanceling,
    vendaSelecionada,
    setVendaSelecionada,
    filtroRef,
    vendasFiltradas,
    handleCancelar,
    formatarPreco,
    formatarData,
  };
}
