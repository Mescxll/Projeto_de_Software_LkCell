// Lógica da Tela de Gerenciamento de Vendas (Exlusão, Busca e Listagem)
import { useState, useEffect, useRef } from "react";

export function useGerenciarVenda() {
  const [loading, setLoading] = useState(true);
  const [vendas, setVendas] = useState([]);
  const [busca, setBusca] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [statusPagamento, setStatusPagamento] = useState("TODOS");
  const [statusVenda, setStatusVenda] = useState("TODOS");
  const [menuAberto, setMenuAberto] = useState(null);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);

  const menuRef = useRef(null);
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
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAberto(null);
      if (filtroRef.current && !filtroRef.current.contains(e.target)) setFiltrosAbertos(false);
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const handleCancelar = async () => {
    if (!vendaSelecionada) return;
    setIsCanceling(true);
    try {
      await fetch(`http://localhost:3000/api/vendas/${vendaSelecionada.id_venda}`, {
        method: "DELETE",
      });
      setVendas((prev) =>
        prev.map((v) =>
          v.id_venda === vendaSelecionada.id_venda
            ? { ...v, status_venda: "CANCELADA" }
            : v
        )
      );
      setModalCancelar(false);
      setMenuAberto(null);
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

    const matchData = !dataFiltro || (
      v.data_hora &&
      new Date(v.data_hora).toLocaleDateString("pt-BR") ===
        new Date(dataFiltro + "T12:00:00").toLocaleDateString("pt-BR")
    );

    return matchBusca && matchStatus && matchStatusVenda && matchData;
  });

  const formatarPreco = (valor) =>
    Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatarData = (data) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  return {
    loading, vendas,
    busca, setBusca,
    dataFiltro, setDataFiltro,
    filtrosAbertos, setFiltrosAbertos,
    statusPagamento, setStatusPagamento,
    statusVenda, setStatusVenda,
    menuAberto, setMenuAberto,
    modalCancelar, setModalCancelar,
    modalSucesso, setModalSucesso,
    isCanceling,
    vendaSelecionada, setVendaSelecionada,
    menuRef, filtroRef,
    vendasFiltradas,
    handleCancelar,
    formatarPreco,
    formatarData,
  };
}